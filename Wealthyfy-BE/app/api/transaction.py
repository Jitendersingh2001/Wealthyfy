from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi_pagination import Page, Params
from fastapi_pagination.ext.sqlalchemy import paginate as sqlalchemy_paginate
from app.config.database import get_db
from app.schemas.transaction import TransactionResponse, TransactionPaginationRequest
from app.schemas.pagination import PaginatedResponse
from app.services.transaction_service import TransactionService
from app.dependencies.auth import authenticate_user
from app.utils.logger_util import logger_exception
from app.constants.message import Messages


# ---------------------------------------------------------------------------
# Router Configuration
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


# ===========================================================================
# Get Transactions by Account ID (Paginated)
# ===========================================================================
@router.post(
    "",
    response_model=PaginatedResponse[TransactionResponse],
    dependencies=[Depends(authenticate_user)]
)
def get_transactions(
    payload: TransactionPaginationRequest,
    db: Session = Depends(get_db)
):
    """
    Paginated transactions using JSON payload instead of query params.
    
    Supports page-based pagination using fastapi-pagination.
    Supports server-side sorting by date/time and amount only.
    
    Request Body:
        - account_id: Account ID (required, min: 1)
        - page: Page number (default: 1, min: 1)
        - size: Page size (default: 10, min: 1, max: 100)
        - sort_by: Field name to sort by (optional, allowed values: 'transaction_timestamp', 'amount')
        - sort_order: Sort order - 'asc' or 'desc' (default: 'desc')
    """
    try:
        transaction_service = TransactionService(db)

        # Build SQLAlchemy query with sorting
        query = transaction_service.get_transactions_by_account_id_query(
            account_id=payload.account_id,
            sort_by=payload.sort_by,
            sort_order=payload.sort_order
        )

        # Convert payload → fastapi-pagination Params
        params = Params(page=payload.page, size=payload.size)

        # Apply pagination
        return sqlalchemy_paginate(query, params=params)

    except Exception:
        logger_exception(f"Failed to fetch transactions for account_id={payload.account_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=Messages.FETCH_FAILED.replace(":name", "Transactions")
        )

