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
from app.models.consent_data_session import DataSession, DataSessionStatusEnum
from app.utils.logger_util import (
    logger_info, logger_error, logger_success, logger_warning
)
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import joinedload
from datetime import datetime, timezone
import json
from pathlib import Path
from app.config.celery_app import celery_app


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
    # Mark Setup as Complete
    # ======================================================================
    def mark_setup_complete(self, user_id: int) -> User:
        """
        Marks the user's setup as complete.
        
        Args:
            user_id: User database ID
            
        Returns:
            Updated User object
        """
        def _update():
            user = (
                self.db.query(User)
                .filter(User.id == user_id)
                .first()
            )

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=Messages.USER_NOT_FOUND
                )

            user.is_setup_complete = True
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

    # ======================================================================
    # Create User Data Session
    # ======================================================================
    def create_user_data_session(
        self,
        consent_request: ConsentRequest,
        session_data: Dict[str, Any]
    ) -> DataSession:
        """
        Creates and stores a data session record from Setu API response.
        
        Args:
            consent_request: The ConsentRequest object
            session_data: Response data from Setu create data session API
        
        Returns:
            DataSession: Created data session record
        """
        def _create():
            # Extract session data from response
            session_id = session_data.get("id")
            
            # Parse status using DataSessionStatusEnum
            status_str = session_data.get("status", "PENDING")
            try:
                session_status = DataSessionStatusEnum[status_str]
            except KeyError:
                logger_warning(
                    f"Unknown status '{status_str}', defaulting to PENDING",
                    status=status_str,
                    consent_id=consent_request.consent_id
                )
                session_status = DataSessionStatusEnum.PENDING
            
            # Parse date range
            data_range = session_data.get("dataRange", {})
            data_range_from = None
            data_range_to = None
            
            if data_range:
                from_str = data_range.get("from")
                to_str = data_range.get("to")
                
                if from_str:
                    # Parse ISO format date string (handles 'Z' suffix)
                    from_str = from_str.replace('Z', '+00:00')
                    data_range_from = datetime.fromisoformat(from_str)
                
                if to_str:
                    # Parse ISO format date string (handles 'Z' suffix)
                    to_str = to_str.replace('Z', '+00:00')
                    data_range_to = datetime.fromisoformat(to_str)
            
            # Create DataSession record
            data_session = DataSession(
                session_id=session_id,
                consent_request_id=consent_request.id,
                status=session_status,
                data_range_from=data_range_from,
                data_range_to=data_range_to
            )
            
            self.db.add(data_session)
            self.commit()
            self.db.refresh(data_session)
            
            return data_session
        
        return self.execute_safely(_create)
    

    # ======================================================================
    # Update Session Status
    # ======================================================================
    def update_session_status(self, consent_id: str, session_id: str, session_status: str, setu_service=None) -> None:
        """
        Updates the status of a data session.
        If status becomes COMPLETED:
        - Fetch session data from Setu
        - Store JSON to disk
        - Save file path inside DataSession.consent_file_path
        
        Args:
            consent_id: The consent ID
            session_id: The session ID
            session_status: The new session status
            setu_service: Optional SetuService instance for fetching session data
        """

        STORAGE_DIR = Path("storage/session_data")
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)

        def _update():
            # ------------------------------------------------
            # 1. Fetch Consent Request
            # ------------------------------------------------
            consent_request = (
                self.db.query(ConsentRequest)
                .filter(ConsentRequest.consent_id == consent_id)
                .first()
            )
            if not consent_request:
                logger_error(f"Consent request not found for consent_id: {consent_id}")
                return

            # ------------------------------------------------
            # 2. Fetch Data Session
            # ------------------------------------------------
            data_session = (
                self.db.query(DataSession)
                .filter(
                    DataSession.consent_request_id == consent_request.id,
                    DataSession.session_id == session_id
                )
                .order_by(DataSession.id.desc())
                .first()
            )
            if not data_session:
                logger_error(f"Data session not found for consent_id: {consent_id}")
                return

            # ------------------------------------------------
            # 3. Update Status
            # ------------------------------------------------
            try:
                new_status = DataSessionStatusEnum[session_status]
                data_session.status = new_status
                self.commit()

                # ------------------------------------------------
                # 4. Handle COMPLETED Status
                # ------------------------------------------------
                if new_status == DataSessionStatusEnum.COMPLETED:
                    if not setu_service:
                        logger_warning(
                            "SetuService not provided, cannot fetch session data",
                            session_id=session_id,
                            consent_id=consent_id
                        )
                        return
                    
                    try:
                        # ---- Fetch full session data from Setu ----
                        session_json = setu_service.fetch_session_data(session_id)

                        user_id = consent_request.user_id

                        # ---- Build file name ----
                        file_name = f"session_{session_id}_{consent_id}_{user_id}.json"
                        file_path = STORAGE_DIR / file_name

                        # ---- Save JSON response to file ----
                        with open(file_path, "w") as f:
                            json.dump(session_json, f, indent=2)

                        # ---- Update DB with file path ----
                        data_session.consent_file_path = str(file_path)
                        data_session.last_fetched_at = datetime.now(timezone.utc)
                        self.commit()

                        logger_info(
                            "Completed session data stored to file",
                            file_path=str(file_path),
                            session_id=session_id,
                            consent_id=consent_id
                        )

                        # ---- Trigger background job to process session data ----
                        try:
                            celery_app.send_task(
                                "process_session_data",
                                args=[data_session.id]
                            )
                            logger_info(
                                "Background job triggered for session data processing",
                                data_session_id=data_session.id,
                                session_id=session_id
                            )
                        except Exception as e:
                            logger_error(
                                "Failed to trigger background job for session data processing",
                                error=str(e),
                                data_session_id=data_session.id,
                                session_id=session_id
                            )

                    except Exception as e:
                        logger_error(
                            "Failed to fetch or store completed session data",
                            error=str(e),
                            session_id=session_id,
                            consent_id=consent_id
                        )

            except KeyError:
                logger_warning(
                    f"Unknown session status '{session_status}' received",
                    session_id=data_session.session_id
                )

        # ------------------------------------------------
        # Execute inside safety wrapper
        # ------------------------------------------------
        self.execute_safely(_update)

    # ======================================================================
    # Check Session Status
    # ======================================================================
    def check_session_status(self, consent_id: str) -> Optional[Dict[str, Any]]:
        """
        Checks if a session exists and is completed for a given consent_id.
        Also checks if data processing is complete (usage_count === 1).
        
        Args:
            consent_id: The consent ID to check
            
        Returns:
            Dict with session info if found and completed, None otherwise
            Format: {
                "session_id": str,
                "consent_id": str,
                "status": str,
                "exists": bool,
                "completed": bool,
                "usage_count": int,
                "is_ready": bool  # True if completed AND usage_count is 1
            }
        """
        def _check():
            # Default response structure for not found cases
            default_response = {
                "session_id": None,
                "consent_id": consent_id,
                "status": None,
                "exists": False,
                "completed": False
            }
            
            # Find the consent request by consent_id
            consent_request = (
                self.db.query(ConsentRequest)
                .filter(ConsentRequest.consent_id == consent_id)
                .first()
            )
            
            if not consent_request:
                logger_warning(
                    f"Consent request not found for consent_id: {consent_id}"
                )
                return default_response
            
            # Find the latest data session for the consent request
            data_session = (
                self.db.query(DataSession)
                .filter(
                    DataSession.consent_request_id == consent_request.id
                )
                .order_by(DataSession.id.desc())
                .first()
            )
            
            if not data_session:
                logger_info(
                    f"No data session found for consent_id: {consent_id}"
                )
                return default_response
            
            # Session found - return with actual data
            is_completed = data_session.status == DataSessionStatusEnum.COMPLETED
            usage_count = data_session.usage_count or 0
            # Session is ready if it's completed AND usage_count is 1 (data processing is done)
            is_ready = is_completed and usage_count == 1
            
            return {
                "session_id": data_session.session_id,
                "consent_id": consent_id,
                "status": data_session.status.value,
                "exists": True,
                "completed": is_completed,
                "usage_count": usage_count,
                "is_ready": is_ready  # Green flag: completed and usage_count is 1
            }
        
        return self.execute_safely(_check)