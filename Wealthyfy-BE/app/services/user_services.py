from app.models.user import User
from app.schemas.user import UserCreate
from app.constants.message import Messages
from fastapi import HTTPException, status
from app.services.base_service import BaseService
from app.constants.constant import CAP_ACTIVE
from app.models.pancard import Pancard
from typing import Optional


class UserService(BaseService):

    """Handles user-related operations."""

    # -----------------------------------------------------------------------
    def create_user(self, user: UserCreate) -> User:
        def _create():
            new_user = User(
                keycloak_user_id=user.keycloak_user_id,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                email_verified=user.email_verified,
            )
            self.db.add(new_user)
            self.commit()
            self.db.refresh(new_user)
            return new_user

        return self.execute_safely(_create)

    # -----------------------------------------------------------------------

    def update_user_status(self, payload: dict) -> User:
        def _update():
            user = (
                self.db.query(User)
                .filter(User.keycloak_user_id == payload.get("userId"))
                .first()
            )

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=Messages.USER_NOT_FOUND
                )

            user.email_verified = True
            user.status = CAP_ACTIVE
            self.commit()
            self.db.refresh(user)
            return user

        return self.execute_safely(_update)

    # -----------------------------------------------------------------------

    def get_user_by_id(self, id: str) -> User:
        def _get():
            user = (
                self.db.query(User)
                .filter(User.keycloak_user_id == id)
                .first()
            )

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=Messages.USER_NOT_FOUND
                )

            return user

        return self.execute_safely(_get)

    # -----------------------------------------------------------------------


    def add_or_update_user_pancard(self, user_id: str, pancard: str, pancard_id: Optional[str]=  None) -> Pancard:
        def _save():
            if pancard_id:
                # Update existing
                record = self.db.query(Pancard).filter(
                    Pancard.id == pancard_id
                ).first()

                if not record:
                    raise ValueError("Invalid pancard_id")

                record.pancard = pancard
                self.db.commit()
                self.db.refresh(record)
                return record

            # Create new
            new_record = Pancard(
                user_id=user_id,
                pancard=pancard
            )
            self.db.add(new_record)
            self.db.commit()
            self.db.refresh(new_record)
            return new_record

        return self.execute_safely(_save)

    # -----------------------------------------------------------------------

    def update_user_phone_no(self, id: str, phone_number: str) -> User:
        def _update():
            user = (
                self.db.query(User)
                .filter(User.id == id)
                .first()
            )

            user.phone_number = phone_number
            self.commit()
            self.db.refresh(user)
            return user

        return self.execute_safely(_update)
