from sqlalchemy.orm import Session
from app.services.setu_service import SetuService
from app.models.financial_institutions import FinancialInstitutions, FinancialInstitutionsStatusEnum
from app.config.database import SessionLocal
from app.config.celery_app import celery_app
from app.utils.logger_util import logger_info, logger_error


@celery_app.task(name="sync_fip_master_data")
def sync_fip_master_data():
    """
    Pull FIP list from Setu and upsert into the database.
    """
    db: Session = SessionLocal()

    logger_info("Starting FIP Sync Job")

    try:
        service = SetuService(db)

        # Fetch FIP list
        fip_list = service.fetch_fip_ids()

        # Extract only FIP IDs from external source
        incoming_fip_ids = set(item["fipId"] for item in fip_list)

        # Update or insert
        for fip in fip_list:
            existing = (
                db.query(FinancialInstitutions)
                .filter(FinancialInstitutions.fip_id == fip["fipId"])
                .first()
            )

            if existing:
                # Update existing record
                existing.name = fip.get("name")
                existing.institution_type = fip.get("institutionType")
                existing.consent = FinancialInstitutionsStatusEnum.ACTIVE
            else:
                # Insert new FIP
                new_fip = FinancialInstitutions(
                    name=fip.get("name"),
                    fip_id=fip.get("fipId"),
                    institution_type=fip.get("institutionType"),
                    Status=FinancialInstitutionsStatusEnum.ACTIVE
                )
                db.add(new_fip)

        # Mark missing FIPs as INACTIVE
        all_db_fips = db.query(FinancialInstitutions).all()

        for db_fip in all_db_fips:
            if db_fip.fip_id not in incoming_fip_ids:
                db_fip.Status = FinancialInstitutionsStatusEnum.INACTIVE

        db.commit()
        logger_info("FIP Sync Job completed successfully")

    except Exception as e:
        logger_error(f"FIP Sync Job failed: {e}")
        db.rollback()
        raise

    finally:
        db.close()
