from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.constants.message import Messages
import logging

logger = logging.getLogger(__name__)

class BaseService:
    """Base service providing reusable DB operations and error handling."""

    def __init__(self, db: Session):
        self.db = db

    def commit(self):
        try:
            self.db.commit()
        except SQLAlchemyError as e:
            logger.error(f"Database commit failed: {str(e)}")
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.DATABASE_ERROR
            )
        except Exception as e:
            logger.error(f"Unexpected commit error: {str(e)}")
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG
            )

    def execute_safely(self, func):
        """Wrapper for handling DB operations safely."""
        try:
            return func()
        except SQLAlchemyError as e:
            logger.error(f"Database operation failed: {str(e)}")
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.DATABASE_ERROR
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG
            )
