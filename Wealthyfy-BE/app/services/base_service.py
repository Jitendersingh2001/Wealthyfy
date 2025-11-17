from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.constants.message import Messages
from app.utils.logger_util import logger_error

class BaseService:
    """Base service providing reusable DB operations and error handling."""

    def __init__(self, db: Session):
        self.db = db

    def commit(self):
        try:
            self.db.commit()
        except SQLAlchemyError as e:
            logger_error(
                f"Database commit failed: {str(e)}",
                error_type="SQLAlchemyError"
            )
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.DATABASE_ERROR
            )
        except Exception as e:
            logger_error(
                f"Unexpected commit error: {str(e)}",
                error_type="UnexpectedError"
            )
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
            logger_error(
                f"Database operation failed: {str(e)}",
                error_type="SQLAlchemyError"
            )
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.DATABASE_ERROR
            )
        except HTTPException:
            raise
        except Exception as e:
            logger_error(
                f"Unexpected error: {str(e)}",
                error_type="UnexpectedError"
            )
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG
            )
