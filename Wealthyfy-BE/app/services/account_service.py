from typing import List
from sqlalchemy.orm import selectinload, load_only
from app.services.base_service import BaseService
from app.models.financial_accounts import FinancialAccount
from app.models.accounts_holder import AccountHolder
from app.models.consent_request import ConsentRequest
from app.models.consent_fI_type import FITypeEnum


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

