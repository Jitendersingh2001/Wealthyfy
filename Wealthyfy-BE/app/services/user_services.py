from app.models.user import User
from app.schemas.user import UserCreate
from app.constants.message import Messages
from fastapi import HTTPException, status
from app.services.base_service import BaseService
from app.constants.constant import CAP_ACTIVE


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
