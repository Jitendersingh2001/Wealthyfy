from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Query
from sqlalchemy import desc, asc, func, and_, extract, case
from app.services.base_service import BaseService
from app.models.bank_transaction import BankTransaction
from app.models.banking_account_details import BankingAccountDetails
from app.models.account_summary import AccountSummary
from app.constants.constant import TRANSACTION_TYPE_CREDIT, TRANSACTION_TYPE_DEBIT


class TransactionService(BaseService):
    """
    Service class responsible for handling transaction-related operations.
    Uses BaseService for safe DB execution and transaction handling.
    """

    # Allowed fields for sorting (only date/time and amount)
    ALLOWED_SORT_FIELDS = {
        "transaction_timestamp",
        "amount",
    }

    def get_transactions_by_account_id_query(
        self,
        account_id: int,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = "desc"
    ) -> Query:
        """
        Returns a query object for transactions filtered by account_id.
        This allows the API layer to handle pagination using fastapi-pagination.
        
        Args:
            account_id: The account ID to filter transactions
            sort_by: Field name to sort by (must be in ALLOWED_SORT_FIELDS)
            sort_order: Sort order - 'asc' or 'desc' (default: 'desc')
            
        Returns:
            SQLAlchemy Query object ready for pagination
        """
        query = self.db.query(BankTransaction).filter(
            BankTransaction.account_id == account_id
        )

        # Apply sorting
        if sort_by and sort_by in self.ALLOWED_SORT_FIELDS:
            column = getattr(BankTransaction, sort_by)
            if sort_order == "asc":
                query = query.order_by(asc(column))
            else:
                query = query.order_by(desc(column))
        else:
            # Default sorting by transaction_timestamp desc
            query = query.order_by(desc(BankTransaction.transaction_timestamp))

        return query

    def get_account_metrics(
        self,
        account_id: int
    ) -> Dict[str, Any]:
        """
        Returns account metrics including current balance and last month transaction totals.
        
        Args:
            account_id: The account ID to fetch metrics for
            
        Returns:
            Dictionary containing current_balance, last_month_total_credit, last_month_total_debit
        """
        # Calculate last month date range
        today = datetime.now()
        first_day_last_month = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
        first_day_this_month = today.replace(day=1)
        
        # Get current balance from BankingAccountDetails via AccountSummary
        current_balance = None
        summary = self.db.query(AccountSummary).filter(
            AccountSummary.account_id == account_id
        ).first()
        
        if summary and summary.banking_details:
            current_balance = float(summary.banking_details.current_balance) if summary.banking_details.current_balance else None
        
        # Calculate last month total credit
        last_month_credit = self.db.query(
            func.coalesce(func.sum(BankTransaction.amount), 0)
        ).filter(
            and_(
                BankTransaction.account_id == account_id,
                BankTransaction.transaction_type == TRANSACTION_TYPE_CREDIT,
                BankTransaction.transaction_timestamp >= first_day_last_month,
                BankTransaction.transaction_timestamp < first_day_this_month
            )
        ).scalar() or 0
        
        # Calculate last month total debit
        last_month_debit = self.db.query(
            func.coalesce(func.sum(BankTransaction.amount), 0)
        ).filter(
            and_(
                BankTransaction.account_id == account_id,
                BankTransaction.transaction_type == TRANSACTION_TYPE_DEBIT,
                BankTransaction.transaction_timestamp >= first_day_last_month,
                BankTransaction.transaction_timestamp < first_day_this_month
            )
        ).scalar() or 0
        
        return {
            "current_balance": float(current_balance) if current_balance is not None else None,
            "last_month_total_credit": float(last_month_credit),
            "last_month_total_debit": float(last_month_debit),
        }

    def get_payment_type_statistics(
        self,
        account_id: int
    ) -> Dict[str, Any]:
        """
        Returns payment type statistics grouped by transaction mode.
        Calculates total amount and percentage for each payment type.
        
        Args:
            account_id: The account ID to fetch statistics for
            
        Returns:
            Dictionary containing list of payment types with amounts and percentages
        """
        # Query to get total amount grouped by mode
        results = self.db.query(
            BankTransaction.mode,
            func.sum(BankTransaction.amount).label('total_amount'),
            func.count(BankTransaction.id).label('count')
        ).filter(
            BankTransaction.account_id == account_id
        ).group_by(
            BankTransaction.mode
        ).all()
        
        # Calculate total amount across all payment types
        total_amount = sum(float(result.total_amount) for result in results)
        
        # Build response with percentages
        payment_types = []
        for result in results:
            amount = float(result.total_amount)
            percentage = (amount / total_amount * 100) if total_amount > 0 else 0
            
            payment_types.append({
                "mode": result.mode,
                "amount": amount,
                "count": result.count,
                "percentage": round(percentage, 2)
            })
        
        # Sort by amount descending
        payment_types.sort(key=lambda x: x["amount"], reverse=True)
        
        return {
            "payment_types": payment_types,
            "total_amount": total_amount
        }

    def get_monthly_credit_debit_statistics(
        self,
        account_id: int,
        year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Returns monthly credit and debit statistics for a given account and year.
        If year is not provided, returns data for all years with available years list.
        
        Args:
            account_id: The account ID to fetch statistics for
            year: Optional year to filter by. If None, returns all years data.
            
        Returns:
            Dictionary containing:
            - available_years: List of years with transactions
            - monthly_data: List of monthly statistics (if year provided)
            - all_years_data: Dictionary of year -> monthly_data (if year not provided)
        """
        # Get all transactions for the account
        query = self.db.query(BankTransaction).filter(
            BankTransaction.account_id == account_id
        )
        
        # Get distinct years from transactions
        years_query = self.db.query(
            extract('year', BankTransaction.transaction_timestamp).label('year')
        ).filter(
            BankTransaction.account_id == account_id
        ).distinct().order_by(desc('year'))
        
        available_years = [int(row.year) for row in years_query.all()]
        
        if not available_years:
            return {
                "available_years": [],
                "monthly_data": [],
            }
        
        # If year is provided, get monthly data for that year
        if year is not None:
            # Filter by year
            year_start = datetime(year, 1, 1)
            year_end = datetime(year + 1, 1, 1)
            
            # Get monthly credit and debit totals in a single query using conditional aggregation
            results = self.db.query(
                extract('month', BankTransaction.transaction_timestamp).label('month'),
                func.coalesce(
                    func.sum(
                        case(
                            (BankTransaction.transaction_type == TRANSACTION_TYPE_CREDIT, BankTransaction.amount),
                            else_=0
                        )
                    ), 0
                ).label('credit_total'),
                func.coalesce(
                    func.sum(
                        case(
                            (BankTransaction.transaction_type == TRANSACTION_TYPE_DEBIT, BankTransaction.amount),
                            else_=0
                        )
                    ), 0
                ).label('debit_total')
            ).filter(
                and_(
                    BankTransaction.account_id == account_id,
                    BankTransaction.transaction_timestamp >= year_start,
                    BankTransaction.transaction_timestamp < year_end
                )
            ).group_by(
                extract('month', BankTransaction.transaction_timestamp)
            ).all()
            
            # Create dictionaries for quick lookup
            credit_dict = {int(row.month): float(row.credit_total) for row in results}
            debit_dict = {int(row.month): float(row.debit_total) for row in results}
            
            # Build monthly data array (1-12 for Jan-Dec)
            monthly_data = []
            month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            
            for month_num in range(1, 13):
                monthly_data.append({
                    "month": month_names[month_num - 1],
                    "credit": credit_dict.get(month_num, 0.0),
                    "debit": debit_dict.get(month_num, 0.0),
                })
            
            return {
                "available_years": available_years,
                "monthly_data": monthly_data,
            }
        else:
            # Return available years only
            return {
                "available_years": available_years,
                "monthly_data": [],
            }

