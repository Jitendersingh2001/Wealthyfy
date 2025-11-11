from app.models.user import User
from app.schemas.user import UserCreate
from app.constants.message import Messages
from fastapi import HTTPException, status
from app.services.base_service import BaseService
from app.constants.constant import CAP_ACTIVE
from app.models.pancard import Pancard
from typing import Optional


class UserService(BaseService):
    """
    Service class responsible for handling user profile related operations.
    Uses BaseService for safe DB execution and transaction handling.
    """

    # ======================================================================
    # Create User
    # ======================================================================
    def create_user(self, user: UserCreate) -> User:
        """
        Creates a new user record.
        """
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

    # ======================================================================
    # Update User Status (After email verification)
    # ======================================================================
    def update_user_status(self, payload: dict) -> User:
        """
        Marks user status as active and email as verified.
        """
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

    # ======================================================================
    # Fetch User by ID
    # ======================================================================
    def get_user_by_id(self, id: str) -> User:
        """
        Returns user details based on Keycloak user ID.
        """
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

    # ======================================================================
    # Create or Update User Pancard
    # ======================================================================
    def add_or_update_user_pancard(self, user_id: str, pancard: str, consent:str, pancard_id: Optional[str] = None) -> Pancard:
        """
        Creates a new PAN record if `pancard_id` is not provided,
        otherwise updates the existing PAN record.
        """
        def _save():
            if pancard_id:
                # Update existing pancard record
                record = self.db.query(Pancard).filter(
                    Pancard.id == pancard_id
                ).first()

                if not record:
                    raise ValueError("Invalid pancard_id")

                record.pancard = pancard
                record.consent = consent
                self.db.commit()
                self.db.refresh(record)
                return record

            # Insert a new pancard record
            new_record = Pancard(
                user_id=user_id,
                pancard=pancard,
                consent=consent
            )
            self.db.add(new_record)
            self.db.commit()
            self.db.refresh(new_record)
            return new_record

        return self.execute_safely(_save)

    # ======================================================================
    # Update User Phone Number
    # ======================================================================
    def update_user_phone_no(self, id: str, phone_number: str) -> User:
        """
        Updates the phone number of the user.
        """
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

    # ======================================================================
    # Get User Pan Card
    # ======================================================================
    def get_pancard(self,id:str) -> Pancard:
        def _get():
            return (
                self.db.query(Pancard).
                filter(Pancard.user_id == id)
                .first()
            )
        return self.execute_safely(_get)