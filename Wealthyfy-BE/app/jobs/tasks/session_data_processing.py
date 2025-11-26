from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.models.consent_data_session import DataSession, DataSessionStatusEnum
from app.models.financial_accounts import FinancialAccount
from app.models.accounts_holder import AccountHolder
from app.models.account_summary import AccountSummary
from app.models.banking_account_details import BankingAccountDetails
from app.models.bank_transaction import BankTransaction
from app.models.term_deposit_details import TermDepositDetails
from app.models.financial_institutions import FinancialInstitutions
from app.models.consent_fI_type import FITypeEnum
from app.models.consent_request import ConsentRequest
from app.models.user import User
from app.utils.logger_util import logger_info, logger_error, logger_warning
from app.services.pusher_service import PusherService
from app.constants.constant import DATE_FORMAT_YYYY_MM_DD
from app.constants.pusher_events import SESSION_COMPLETED, DATA_FETCHING_COMPLETED
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
import json
from typing import Dict, Any, List, Optional


def register(celery_app):
    """
    Register session data processing Celery tasks.
    """
    @celery_app.task(name="process_session_data", bind=True)
    def process_session_data(self, data_session_id: int):
        """
        Process session data file and insert parsed data into database tables.
        
        Args:
            data_session_id: The ID of the DataSession record containing the file path
        """
        db: Session = SessionLocal()

        try:
            logger_info(
                "Starting session data processing",
                data_session_id=data_session_id
            )

            # Fetch the data session record
            data_session = db.query(DataSession).filter(
                DataSession.id == data_session_id
            ).first()

            if not data_session:
                logger_error(
                    f"DataSession not found for id: {data_session_id}",
                    data_session_id=data_session_id
                )
                return

            if not data_session.consent_file_path:
                logger_warning(
                    "No file path found in DataSession",
                    data_session_id=data_session_id,
                    session_id=data_session.session_id
                )
                return

            file_path = Path(data_session.consent_file_path)

            # Check if file exists
            if not file_path.exists():
                logger_error(
                    f"Session data file not found: {file_path}",
                    file_path=str(file_path),
                    data_session_id=data_session_id
                )
                return

            # Load JSON data
            try:
                with open(file_path, 'r') as f:
                    session_data = json.load(f)
            except json.JSONDecodeError as e:
                logger_error(
                    f"Failed to parse JSON file: {e}",
                    file_path=str(file_path),
                    data_session_id=data_session_id
                )
                return

            # Get consent request ID for linking
            consent_request_id = data_session.consent_request_id

            # Get user_id from consent request for Pusher event
            consent_request = db.query(ConsentRequest).filter(
                ConsentRequest.id == consent_request_id
            ).first()

            user_id = None
            if consent_request:
                user_id = consent_request.user_id

            # Send session completed event when processing starts
            if user_id:
                try:
                    pusher_service = PusherService()
                    pusher_service.trigger(
                        user_id=user_id,
                        event=SESSION_COMPLETED,
                        data={
                            "status": DataSessionStatusEnum.COMPLETED.value,
                            "session_id": data_session.session_id,
                            "consent_id": consent_request.consent_id if consent_request else None
                        }
                    )
                    logger_info(
                        "Session completed event sent to user (processing started)",
                        user_id=user_id,
                        session_id=data_session.session_id
                    )
                except Exception as e:
                    logger_error(
                        f"Failed to send session completed event: {e}",
                        user_id=user_id,
                        session_id=data_session.session_id
                    )
                    # Don't raise - Pusher failure shouldn't fail the job

            # Process the session data
            _process_session_data(
                db=db,
                session_data=session_data,
                consent_request_id=consent_request_id,
                data_session_id=data_session_id
            )

            # Commit all changes
            db.commit()

            # Delete the file after successful processing
            try:
                file_path.unlink()
                logger_info(
                    "Session data file deleted after successful processing",
                    file_path=str(file_path),
                    data_session_id=data_session_id
                )
            except Exception as e:
                logger_error(
                    f"Failed to delete session data file: {e}",
                    file_path=str(file_path),
                    data_session_id=data_session_id
                )

            # Send data fetching completed event when processing is done
            if user_id:
                try:
                    user = db.query(User).filter(User.id == user_id).first()
                    if user:
                        user.is_setup_complete = True
                        db.commit()
                        logger_info(
                            "User setup marked as complete",
                            user_id=user_id,
                            data_session_id=data_session_id
                        )
                    else:
                        logger_warning(
                            "User not found when trying to mark setup as complete",
                            user_id=user_id,
                            data_session_id=data_session_id
                        )
                    pusher_service = PusherService()
                    pusher_service.trigger(
                        user_id=user_id,
                        event=DATA_FETCHING_COMPLETED,
                        data={
                            "status": "completed",
                            "message": "Data fetching completed successfully"
                        }
                    )
                    logger_info(
                        "Data fetching completed event sent to user (processing done)",
                        user_id=user_id,
                        session_id=data_session.session_id
                    )
                except Exception as e:
                    logger_error(
                        f"Failed to send data fetching completed event: {e}",
                        user_id=user_id,
                        session_id=data_session.session_id
                    )
                    # Don't raise - Pusher failure shouldn't fail the job

            logger_info(
                "Session data processing completed successfully",
                data_session_id=data_session_id
            )

        except Exception as e:
            logger_error(
                f"Session data processing failed: {e}",
                data_session_id=data_session_id,
                error=str(e)
            )
            db.rollback()
            raise

        finally:
            db.close()


def _process_session_data(
    db: Session,
    session_data: Dict[str, Any],
    consent_request_id: int,
    data_session_id: int
):
    """
    Process session data and insert into database tables.
    
    Args:
        db: Database session
        session_data: Parsed JSON session data
        consent_request_id: ID of the consent request
        data_session_id: ID of the data session
    """
    fips = session_data.get("fips", [])

    for fip_data in fips:
        fip_id = fip_data.get("fipID")
        if not fip_id:
            logger_warning("FIP ID missing in session data", fip_data=fip_data)
            continue

        # Ensure FIP exists in database
        fip_record = db.query(FinancialInstitutions).filter(
            FinancialInstitutions.fip_id == fip_id
        ).first()

        if not fip_record:
            logger_warning(
                f"FIP not found in database: {fip_id}",
                fip_id=fip_id,
                data_session_id=data_session_id
            )
            # Optionally create the FIP record if needed
            # For now, we'll skip accounts from unknown FIPs
            continue

        accounts = fip_data.get("accounts", [])

        for account_data in accounts:
            _process_account(
                db=db,
                account_data=account_data,
                fip_id=fip_id,
                consent_request_id=consent_request_id
            )


def _process_account(
    db: Session,
    account_data: Dict[str, Any],
    fip_id: str,
    consent_request_id: int
):
    """
    Process a single account and insert into database.
    
    Args:
        db: Database session
        account_data: Account data from session JSON
        fip_id: FIP ID
        consent_request_id: ID of the consent request
    """
    link_ref_number = account_data.get("linkRefNumber")
    if not link_ref_number:
        logger_warning("linkRefNumber missing in account data")
        return

    account_info = account_data.get("data", {}).get("account", {})
    if not account_info:
        logger_warning("Account data missing", link_ref_number=link_ref_number)
        return

    # Extract and map account type
    account_type_str = account_info.get("type", "")
    account_type = FITypeEnum.from_string(account_type_str)

    masked_account_number = account_data.get("maskedAccNumber", "")

    # Create new financial account (id will be auto-generated: 1, 2, 3...)
    financial_account = FinancialAccount(
        consent_id=consent_request_id,  # This maps to consent_request.id
        fip_id=fip_id,
        link_ref_number=link_ref_number,
        masked_account_number=masked_account_number,
        account_type=account_type
    )
    db.add(financial_account)
    db.flush()  # Flush to get the auto-generated id

    # Use the auto-generated id for relationships
    account_id = financial_account.id

    # Process account holders
    _process_account_holders(db, account_info, account_id)

    # Process account summary and related data
    _process_account_summary(db, account_info, account_id, account_type)

    # Process transactions
    _process_transactions(db, account_info, account_id)

    # Note: We don't commit here - commit happens once after processing all accounts


def _process_account_holders(
    db: Session,
    account_info: Dict[str, Any],
    account_id: int
):
    """
    Process account holders and insert into database.
    
    Args:
        db: Database session
        account_info: Account information from JSON
        account_id: Account ID
    """
    profile = account_info.get("profile", {})
    holders_data = profile.get("holders", {})
    holders_list = holders_data.get("holder", [])

    if not holders_list:
        return

    for holder_data in holders_list:
        # Parse date of birth
        dob = None
        dob_str = holder_data.get("dob")
        if dob_str:
            try:
                dob = datetime.strptime(dob_str, DATE_FORMAT_YYYY_MM_DD)
            except ValueError:
                logger_warning(
                    f"Invalid date format for DOB: {dob_str}",
                    account_id=account_id
                )

        # Parse ckyc compliance
        ckyc_compliance = None
        ckyc_str = holder_data.get("ckycCompliance", "").lower()
        if ckyc_str == "true":
            ckyc_compliance = True
        elif ckyc_str == "false":
            ckyc_compliance = False

        account_holder = AccountHolder(
            account_id=account_id,
            holder_type=holders_data.get("type", "SINGLE"),
            address=holder_data.get("address"),
            ckyc_compliance=ckyc_compliance,
            date_of_birth=dob,
            email=holder_data.get("email"),
            mobile=holder_data.get("mobile"),
            name=holder_data.get("name", ""),
            nominee_status=holder_data.get("nominee"),
            pan=holder_data.get("pan")
        )
        db.add(account_holder)


def _process_account_summary(
    db: Session,
    account_info: Dict[str, Any],
    account_id: int,
    account_type: FITypeEnum
):
    """
    Process account summary and related banking/term deposit details.
    
    Args:
        db: Database session
        account_info: Account information from JSON
        account_id: Account ID
        account_type: Type of account (DEPOSIT, TERM_DEPOSIT, etc.)
    """
    summary_data = account_info.get("summary", {})
    if not summary_data:
        return

    # Parse opening date
    opening_date = None
    opening_date_str = summary_data.get("openingDate")
    if opening_date_str:
        try:
            # Handle ISO format with timezone
            opening_date_str = opening_date_str.replace('Z', '+00:00')
            opening_date = datetime.fromisoformat(opening_date_str)
        except (ValueError, AttributeError):
            logger_warning(
                f"Invalid date format for openingDate: {opening_date_str}",
                account_id=account_id
            )

    # Create new account summary
    # Handle both ifscCode (for deposits) and ifsc (for term deposits)
    ifsc_code = summary_data.get("ifscCode") or summary_data.get("ifsc")
    
    account_summary = AccountSummary(
        account_id=account_id,
        branch=summary_data.get("branch"),
        ifsc_code=ifsc_code,
        opening_date=opening_date
    )
    db.add(account_summary)
    db.flush()  # Flush to get the summary.id

    # Process banking account details (for DEPOSIT accounts)
    if account_type == FITypeEnum.DEPOSIT:
        _process_banking_account_details(db, summary_data, account_summary.id)

    # Process term deposit details (for TERM_DEPOSIT accounts)
    if account_type == FITypeEnum.TERM_DEPOSIT:
        _process_term_deposit_details(db, summary_data, account_summary.id)


def _process_banking_account_details(
    db: Session,
    summary_data: Dict[str, Any],
    summary_id: int
):
    """
    Process banking account details.
    
    Args:
        db: Database session
        summary_data: Summary data from JSON
        summary_id: Account summary ID
    """
    # Parse balance date time
    balance_date_time = None
    balance_dt_str = summary_data.get("balanceDateTime")
    if balance_dt_str:
        try:
            balance_dt_str = balance_dt_str.replace('Z', '+00:00')
            balance_date_time = datetime.fromisoformat(balance_dt_str)
        except (ValueError, AttributeError):
            logger_warning(
                f"Invalid date format for balanceDateTime: {balance_dt_str}"
            )

    # Parse pending amount
    pending = summary_data.get("pending", {})
    pending_amount = _parse_decimal(pending.get("amount") if pending else None)

    # Create new banking details
    banking_details = BankingAccountDetails(
        summary_id=summary_id,
        current_balance=_parse_decimal(summary_data.get("currentBalance"), default=0),
        available_balance=_parse_decimal(summary_data.get("availableBalance")),
        current_od_limit=_parse_decimal(summary_data.get("currentODLimit")),
        drawing_limit=_parse_decimal(summary_data.get("drawingLimit")),
        facility=summary_data.get("facility"),
        status=summary_data.get("status", ""),
        account_sub_type=summary_data.get("type", ""),
        currency=summary_data.get("currency", "INR"),
        balance_date_time=balance_date_time,
        micr_code=summary_data.get("micrCode"),
        pending_amount=pending_amount,
        pending_transaction_type=pending.get(
            "transactionType") if pending else None
    )
    db.add(banking_details)


def _process_term_deposit_details(
    db: Session,
    summary_data: Dict[str, Any],
    summary_id: int
):
    """
    Process term deposit details.
    
    Args:
        db: Database session
        summary_data: Summary data from JSON (may contain term deposit specific fields)
        summary_id: Account summary ID
    """
    # Parse maturity date
    maturity_date = None
    maturity_date_str = summary_data.get("maturityDate")
    if maturity_date_str:
        try:
            maturity_date_str = maturity_date_str.replace('Z', '+00:00')
            maturity_date = datetime.fromisoformat(maturity_date_str)
        except (ValueError, AttributeError):
            logger_warning(
                f"Invalid date format for maturityDate: {maturity_date_str}"
            )

    # Create new term deposit details
    term_deposit_details = TermDepositDetails(
        summary_id=summary_id,
        account_type=summary_data.get("type", ""),
        current_value=_parse_decimal(
            summary_data.get("currentValue"), default=0),
        description=summary_data.get("description"),
        compounding_frequency=summary_data.get("compoundingFrequency"),
        interest_computation=summary_data.get("interestComputation"),
        interest_on_maturity=summary_data.get("interestOnMaturity"),
        interest_payout=summary_data.get("interestPayout"),
        interest_periodic_payout_amount=_parse_decimal(
            summary_data.get("interestPeriodicPayoutAmount")),
        interest_rate=_parse_decimal(
            summary_data.get("interestRate"), default=0),
        maturity_amount=_parse_decimal(summary_data.get("maturityAmount")),
        maturity_date=maturity_date,
        principal_amount=_parse_decimal(
            summary_data.get("principalAmount"), default=0),
        recurring_amount=_parse_decimal(summary_data.get("recurringAmount")),
        recurring_deposit_day=summary_data.get("recurringDepositDay"),
        tenure_days=summary_data.get("tenureDays"),
        tenure_months=summary_data.get("tenureMonths"),
        tenure_years=summary_data.get("tenureYears")
    )
    db.add(term_deposit_details)


def _process_transactions(
    db: Session,
    account_info: Dict[str, Any],
    account_id: int
):
    """
    Process bank transactions and insert into database using bulk insertion.
    
    Args:
        db: Database session
        account_info: Account information from JSON
        account_id: Account ID
    """
    transactions_data = account_info.get("transactions", {})
    transactions_list = transactions_data.get("transaction", [])

    if not transactions_list:
        return

    # Prepare bulk insert data
    bulk_transactions = []

    for txn_data in transactions_list:
        # Parse transaction timestamp
        txn_timestamp = None
        txn_timestamp_str = txn_data.get("transactionTimestamp")
        if txn_timestamp_str:
            try:
                txn_timestamp_str = txn_timestamp_str.replace('Z', '+00:00')
                txn_timestamp = datetime.fromisoformat(txn_timestamp_str)
            except (ValueError, AttributeError):
                logger_warning(
                    f"Invalid date format for transactionTimestamp: {txn_timestamp_str}",
                    account_id=account_id
                )

        if not txn_timestamp:
            # Skip transactions without valid timestamp
            continue

        bulk_transactions.append({
            "account_id": account_id,
            "amount": _parse_decimal(txn_data.get("amount"), default=0),
            "balance": _parse_decimal(txn_data.get("balance") or txn_data.get("currentBalance")),
            "mode": txn_data.get("mode", ""),
            "narration": txn_data.get("narration"),
            "transaction_timestamp": txn_timestamp,
            "transaction_id": txn_data.get("txnId", ""),
            "transaction_type": txn_data.get("type", "")
        })

    # Bulk insert all transactions at once
    if bulk_transactions:
        db.bulk_insert_mappings(BankTransaction, bulk_transactions)


def _parse_decimal(value: Any, default: Optional[Decimal] = None) -> Optional[Decimal]:
    """
    Safely parse a value to Decimal.
    
    Args:
        value: Value to parse
        default: Default value if parsing fails
    
    Returns:
        Decimal or None
    """
    if value is None:
        return default

    # Handle empty strings explicitly
    if isinstance(value, str) and value.strip() == "":
        return default

    try:
        return Decimal(str(value))
    except (ValueError, TypeError, InvalidOperation):
        return default
