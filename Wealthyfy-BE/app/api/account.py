from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from enum import Enum
from app.config.database import get_db
from app.schemas.account import (
    DepositAccountResponse, 
    AccountDetailsResponse, 
    AccountMetricsResponse, 
    PaymentTypeStatisticsResponse,
    MonthlyCreditDebitStatisticsResponse
)
from app.schemas.response import ApiResponse
from app.services.account_service import AccountService
from app.services.transaction_service import TransactionService
from app.dependencies.auth import authenticate_user
from app.models.user import User
from app.models.consent_fI_type import FITypeEnum
from app.models.financial_accounts import FinancialAccount
from app.models.consent_request import ConsentRequest
from app.utils.logger_util import logger_exception
from app.constants.message import Messages
from app.utils.response import success_response


class DepositAccountType(str, Enum):
    """Enum for deposit account types in API requests."""
    DEPOSIT = "deposit"
    TERM_DEPOSIT = "term_deposit"


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
    type: DepositAccountType = Query(
        ...,
        description="Account type filter: 'deposit' or 'term_deposit'"
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
        
        # Convert DepositAccountType enum to FITypeEnum
        type_upper = type.value.upper().replace("-", "_")
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
            detail=Messages.SOMETHING_WENT_WRONG
        )


# ===========================================================================
# Get Account Details by Account ID
# ===========================================================================
@router.get(
    "/{account_id}/details",
    response_model=ApiResponse[AccountDetailsResponse],
    dependencies=[Depends(authenticate_user)]
)
def get_account_details(
    account_id: int = Path(..., description="Account ID to fetch details for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(authenticate_user)
):
    """
    Fetches detailed account information for a specific account.
    
    Path Parameters:
        - account_id: The account ID to fetch details for
    
    Returns:
        Account details including holder type, CKYC, DOB, email, phone, 
        nominee status, PAN, branch, and IFSC code
    """
    try:
        account_service = AccountService(db)
        
        # Fetch account details
        details = account_service.get_account_details(
            account_id=account_id,
            user_id=current_user.id
        )
        
        if details is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found or access denied"
            )
        
        return success_response(
            data=details,
            message=Messages.FETCH_SUCCESSFULLY.replace(":name", "Account details")
        )
    
    except HTTPException:
        raise
    except Exception:
        logger_exception(f"Failed to fetch account details for account_id={account_id}, user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=Messages.SOMETHING_WENT_WRONG
        )


# ===========================================================================
# Get Account Metrics (Current Balance, Last Month Credit/Debit)
# ===========================================================================
@router.get(
    "/{account_id}/metrics",
    response_model=ApiResponse[AccountMetricsResponse],
    dependencies=[Depends(authenticate_user)]
)
def get_account_metrics(
    account_id: int = Path(..., description="Account ID to fetch metrics for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(authenticate_user)
):
    """
    Fetches account metrics including current balance and last month transaction totals.
    
    Path Parameters:
        - account_id: The account ID to fetch metrics for
    
    Returns:
        Account metrics including current balance, last month total credit, and last month total debit
    """
    try:
        transaction_service = TransactionService(db)
        metrics = transaction_service.get_account_metrics(account_id)
        
        return success_response(
            data=metrics,
            message=Messages.FETCH_SUCCESSFULLY.replace(":name", "Account metrics")
        )
    
    except HTTPException:
        raise
    except Exception:
        logger_exception(f"Failed to fetch account metrics for account_id={account_id}, user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=Messages.SOMETHING_WENT_WRONG
        )


# ===========================================================================
# Get Payment Type Statistics
# ===========================================================================
@router.get(
    "/{account_id}/payment-statistics",
    response_model=ApiResponse[PaymentTypeStatisticsResponse],
    dependencies=[Depends(authenticate_user)]
)
def get_payment_type_statistics(
    account_id: int = Path(..., description="Account ID to fetch payment statistics for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(authenticate_user)
):
    """
    Fetches payment type statistics grouped by transaction mode.
    
    Path Parameters:
        - account_id: The account ID to fetch payment statistics for
    
    Returns:
        Payment type statistics including mode, amount, count, and percentage for each payment type
    """
    try:
        transaction_service = TransactionService(db)
        statistics = transaction_service.get_payment_type_statistics(account_id)
        
        return success_response(
            data=statistics,
            message=Messages.FETCH_SUCCESSFULLY.replace(":name", "Payment statistics")
        )
    
    except HTTPException:
        raise
    except Exception:
        logger_exception(f"Failed to fetch payment statistics for account_id={account_id}, user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=Messages.SOMETHING_WENT_WRONG
        )


# ===========================================================================
# Get Monthly Credit/Debit Statistics
# ===========================================================================
@router.get(
    "/{account_id}/monthly-statistics",
    response_model=ApiResponse[MonthlyCreditDebitStatisticsResponse],
    dependencies=[Depends(authenticate_user)]
)
def get_monthly_credit_debit_statistics(
    account_id: int = Path(..., description="Account ID to fetch monthly statistics for"),
    year: Optional[int] = Query(None, description="Year to filter by. If not provided, returns available years only."),
    db: Session = Depends(get_db),
    current_user: User = Depends(authenticate_user)
):
    """
    Fetches monthly credit and debit statistics for a given account and year.
    
    Path Parameters:
        - account_id: The account ID to fetch statistics for
    
    Query Parameters:
        - year: Optional year to filter by. If not provided, returns available years only.
    
    Returns:
        Monthly credit/debit statistics including available years and monthly data
    """
    try:
        transaction_service = TransactionService(db)
        statistics = transaction_service.get_monthly_credit_debit_statistics(
            account_id=account_id,
            year=year
        )
        
        return success_response(
            data=statistics,
            message=Messages.FETCH_SUCCESSFULLY.replace(":name", "Monthly statistics")
        )
    
    except HTTPException:
        raise
    except Exception:
        logger_exception(f"Failed to fetch monthly statistics for account_id={account_id}, user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=Messages.SOMETHING_WENT_WRONG
        )

