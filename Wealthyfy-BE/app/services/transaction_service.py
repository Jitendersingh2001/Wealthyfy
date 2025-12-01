from typing import Optional
from sqlalchemy.orm import Query
from sqlalchemy import desc, asc
from app.services.base_service import BaseService
from app.models.bank_transaction import BankTransaction


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

