from app.models.user import User
from app.schemas.user import UserCreate
from app.constants.message import Messages
from fastapi import HTTPException, status
from app.services.base_service import BaseService
from app.constants.constant import CAP_ACTIVE
from app.models.pancard import Pancard
from app.models.consent_request import ConsentRequest, ConsentStatus, FetchType, UnitEnum
from app.models.consent_fI_type import ConsentFIType, FITypeEnum, ConsentFITypeStatus
from app.models.consent_cancellation_log import ConsentCancellationLog, CancelledBy
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import joinedload
from datetime import datetime


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
                .options(joinedload(User.pancard))
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

    # ======================================================================
    # Expire Existing Pending Consents
    # ======================================================================
    def expire_pending_consents(self, user_id: int) -> int:
        """
        Marks all pending and non-expired consent requests for a user as EXPIRED.
        Also expires all associated FI types and logs the cancellation reason.
        
        Args:
            user_id: User ID
        
        Returns:
            int: Number of consents expired
        """
        def _expire():
            # Find all pending consents for the user and mark them as expired
            pending_consents = (
                self.db.query(ConsentRequest)
                .filter(
                    ConsentRequest.user_id == user_id,
                    ConsentRequest.status == ConsentStatus.PENDING
                )
                .all()
            )
            
            expired_count = 0
            for consent in pending_consents:
                consent.status = ConsentStatus.EXPIRED
                # Expire all associated FI types
                for fi_type in consent.fi_types:
                    fi_type.status = ConsentFITypeStatus.EXPIRE
                
                # Create cancellation log entry
                cancellation_log = ConsentCancellationLog(
                    consent_request_id=consent.id,
                    reason=Messages.CONSENT_CANCELLED_NEW_CONSENT_CREATED,
                    cancelled_by=CancelledBy.SYSTEM
                )
                self.db.add(cancellation_log)
                expired_count += 1
            
            if expired_count > 0:
                self.commit()
            
            return expired_count
        
        return self.execute_safely(_expire)

    # ======================================================================
    # Create Consent Request
    # ======================================================================
    def create_consent_request(
        self,
        user_id: int,
        pan_id: int,
        consent_data: Dict[str, Any]
    ) -> ConsentRequest:
        """
        Creates and stores a consent request record from Setu API response.
        
        Args:
            user_id: User ID
            pan_id: PAN card ID
            consent_data: Response data from Setu create_consent API
        
        Returns:
            ConsentRequest: Created consent request record
        """
        def _create():
            # Extract data from response
            consent_id = consent_data.get("id")
            if not consent_id:
                raise ValueError("Missing consent ID in response")
            
            try:
                consent_status = ConsentStatus[consent_data.get("status", "PENDING")]
            except KeyError:
                consent_status = ConsentStatus.PENDING
            
            detail = consent_data.get("detail", {})
            
            # Get data life from response
            data_life = detail.get("dataLife", {})
            try:
                data_life_unit = UnitEnum[data_life.get("unit", "INF")]
                data_life_value = data_life.get("value", 0)
            except KeyError:
                data_life_unit = UnitEnum.INF
                data_life_value = 0
            
            # Get frequency from response (if present)
            frequency = detail.get("frequency")
            frequency_unit = None
            frequency_value = None
            if frequency:
                try:
                    frequency_unit = UnitEnum[frequency.get("unit")]
                    frequency_value = frequency.get("value")
                except KeyError:
                    pass
            
            # Get fetch type from response
            try:
                fetch_type = FetchType[detail.get("fetchType", "ONETIME")]
            except KeyError:
                fetch_type = FetchType.ONETIME
            
            # Extract datetime values directly from response
            data_range = detail.get("dataRange", {})
            
            # Create ConsentRequest record
            consent_request = ConsentRequest(
                consent_id=consent_id,
                user_id=user_id,
                pan_id=pan_id,
                status=consent_status,
                consent_mode=detail.get("consentMode", "STORE"),
                vua=detail.get("vua", ""),
                purpose_code=detail.get("purpose", {}).get("code", "101"),
                purpose_text=detail.get("purpose", {}).get("text", "Wealth management service"),
                purpose_ref_uri=detail.get("purpose", {}).get("refUri"),
                purpose_category_type=detail.get("purpose", {}).get("category", {}).get("type"),
                fetch_type=fetch_type,
                data_range_from=data_range.get("from"),
                data_range_to=data_range.get("to"),
                consent_start=detail.get("consentStart"),
                consent_expiry=detail.get("consentExpiry"),
                data_life_unit=data_life_unit,
                data_life_value=data_life_value,
                frequency_unit=frequency_unit,
                frequency_value=frequency_value,
                redirect_url=consent_data.get("redirectUrl"),
                trace_id=consent_data.get("traceId"),
                tags=consent_data.get("tags"),
                consent_types=detail.get("consentTypes"),
                context=consent_data.get("context")
            )
            
            self.db.add(consent_request)
            self.db.flush()  # Flush to get the consent_request.id (not committing yet)
            self.db.refresh(consent_request)
            return consent_request
        
        return self.execute_safely(_create)

    # ======================================================================
    # Create Consent FI Types
    # ======================================================================
    def create_consent_fi_types(
        self,
        consent_request_id: int,
        fi_types: List[str]
    ) -> List[ConsentFIType]:
        """
        Creates and stores consent FI type records for a consent request.
        
        Args:
            consent_request_id: ID of the consent request
            fi_types: List of FI type strings from Setu API response
        
        Returns:
            List[ConsentFIType]: List of created consent FI type records
        """
        def _create():
            created_fi_types = []
            for fi_type_str in fi_types:
                try:
                    fi_type_enum = FITypeEnum[fi_type_str]
                    consent_fi_type = ConsentFIType(
                        consent_request_id=consent_request_id,
                        fi_type=fi_type_enum,
                        status=ConsentFITypeStatus.ACTIVE
                    )
                    self.db.add(consent_fi_type)
                    created_fi_types.append(consent_fi_type)
                except KeyError:
                    # Skip invalid FI types
                    continue
            
            self.commit()
            return created_fi_types
        
        return self.execute_safely(_create)