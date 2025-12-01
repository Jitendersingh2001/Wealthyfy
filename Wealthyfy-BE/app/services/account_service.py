from typing import List, Optional, Dict, Any
from sqlalchemy.orm import selectinload, load_only, joinedload
from app.services.base_service import BaseService
from app.models.financial_accounts import FinancialAccount
from app.models.accounts_holder import AccountHolder
from app.models.consent_request import ConsentRequest
from app.models.consent_fI_type import FITypeEnum
from app.models.account_summary import AccountSummary


class AccountService(BaseService):
    """
    Service class responsible for handling account-related operations.
    Uses BaseService for safe DB execution and transaction handling.
    """

    def get_deposit_accounts_by_user_and_type(
        self,
        user_id: int,
        account_type: FITypeEnum
    ) -> List[FinancialAccount]:
        """
        Returns deposit accounts for a user, filtered by account type.
        Only loads holders relationship (name field) for minimal data transfer.
        
        Args:
            user_id: The user ID to filter accounts
            account_type: Account type filter (DEPOSIT or TERM_DEPOSIT)
            
        Returns:
            List of FinancialAccount objects with holders loaded
        """
        # Query financial accounts through consent_request - only load holders name field
        query = self.db.query(FinancialAccount).join(
            ConsentRequest,
            FinancialAccount.consent_id == ConsentRequest.id
        ).options(
            selectinload(FinancialAccount.holders).load_only(AccountHolder.name)
        ).filter(
            ConsentRequest.user_id == user_id,
            FinancialAccount.account_type == account_type
        )
        
        # Order by created_at descending (newest first)
        query = query.order_by(FinancialAccount.created_at.desc())
        
        return query.all()

    def get_account_details(
        self,
        account_id: int,
        user_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Returns account details for a specific account, including holder and summary information.
        Fetches all data in a single database query using eager loading.
        
        Args:
            account_id: The account ID to fetch details for
            user_id: The user ID to verify ownership
            
        Returns:
            Dictionary containing account details or None if not found/unauthorized
        """
        # Fetch account with holder and summary in a single query using eager loading
        account = self.db.query(FinancialAccount).join(
            ConsentRequest,
            FinancialAccount.consent_id == ConsentRequest.id
        ).options(
            selectinload(FinancialAccount.holders),
            joinedload(FinancialAccount.summary)
        ).filter(
            FinancialAccount.id == account_id,
            ConsentRequest.user_id == user_id
        ).first()
        
        if not account:
            return None
        
        # Get primary account holder (first holder) - already loaded via eager loading
        holder = account.holders[0] if account.holders else None
        
        # Get account summary - already loaded via eager loading
        summary = account.summary
        
        # Build response dictionary
        details = {
            "holder_type": holder.holder_type if holder else None,
            "ckyc_compliance": holder.ckyc_compliance if holder else None,
            "date_of_birth": holder.date_of_birth if holder else None,
            "email": holder.email if holder else None,
            "mobile": holder.mobile if holder else None,
            "nominee_status": holder.nominee_status if holder else None,
            "pan": holder.pan if holder else None,
            "branch": summary.branch if summary else None,
            "ifsc_code": summary.ifsc_code if summary else None,
        }
        
        return details

