from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from app.constants.message import Messages


class UserService:
    def __init__(self, db: Session):
        self.db = db

    # Function to create a new user
    def create_user(self, user: UserCreate) -> User:
        try:
            # Check if the user already exists
            existing_user = self.db.query(User).filter(
                User.email == user.email).first()

            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=Messages.EXISTS
                )

            # Hash the password before storing it
            hashed_password = self._hash_password(user.password)

            new_user = User(
                username=user.username,
                email=user.email,
                password=hashed_password
            )
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            return new_user
        except SQLAlchemyError as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.ERROR
            )
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG
            )