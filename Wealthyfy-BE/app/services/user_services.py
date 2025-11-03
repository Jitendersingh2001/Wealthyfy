from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from app.constants.message import Messages


class UserService:
    def __init__(self, db: Session):
        self.db = db

    # Function to create a new user.
    def create_user(self, user: UserCreate) -> User:
        try:
            new_user = User(
                keycloak_user_id=user.keycloak_user_id,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                email_verified=user.email_verified,
            )

            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            return new_user

        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.ERROR
            )

        except Exception:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG
            )
        
    def update_user_status(self, payload: dict):
        try:
            user_id = payload.get("userId")
            user = self.db.query(User).filter(User.keycloak_user_id == user_id).first()

            if user:
                user.email_verified = True
                self.db.commit()
                self.db.refresh(user)
                return user
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.ERROR
            )

        except Exception:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG
            )