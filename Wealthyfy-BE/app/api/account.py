from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.schemas.account import DepositAccountResponse
from app.schemas.response import ApiResponse
from app.services.account_service import AccountService
from app.dependencies.auth import authenticate_user
from app.models.user import User
from app.models.consent_fI_type import FITypeEnum
from app.utils.logger_util import logger_exception
from app.constants.message import Messages
from app.utils.response import success_response


# ---------------------------------------------------------------------------
# Router Configuration
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)


# ===========================================================================
# Get Deposit Accounts by User and Type
# ===========================================================================
@router.get(
    "/deposit",
    response_model=ApiResponse[List[DepositAccountResponse]],
    dependencies=[Depends(authenticate_user)]
)
def get_deposit_accounts(
    type: str = Query(
        ...,
        description="Account type filter: 'deposit' or 'term_deposit'",
        regex="^(deposit|term_deposit)$"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(authenticate_user)
):
    """
    Fetches deposit accounts for the authenticated user.
    
    Query Parameters:
        - type: Required account type filter ('deposit' or 'term_deposit')
    
    Returns:
        List of deposit accounts for the user
    """
    try:
        account_service = AccountService(db)
        
        # Convert string type to FITypeEnum
        type_upper = type.upper().replace("-", "_")
        try:
            account_type = FITypeEnum[type_upper]
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Invalid account type. Must be 'deposit' or 'term_deposit'"
            )
        
        # Fetch accounts
        accounts = account_service.get_deposit_accounts_by_user_and_type(
            user_id=current_user.id,
            account_type=account_type
        )
        
        return success_response(
            data=accounts,
            message=Messages.FETCH_SUCCESSFULLY.replace(":name", "Deposit accounts")
        )
    
    except HTTPException:
        raise
    except Exception:
        logger_exception(f"Failed to fetch deposit accounts for user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=Messages.FETCH_FAILED.replace(":name", "Deposit accounts")
        )

