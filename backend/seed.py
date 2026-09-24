import logging
from sqlalchemy.orm import Session
from .models import (
    AdminUser,
    Client,
    CateringEvent,
    ReadinessItem,
    MenuCourseItem,
    StockItem,
    StockAllocation,
    EventExpense,
    Quotation,
    QuotationLineItem,
    Transaction,
    BusinessProfile,
)
from .auth import hash_password

logger = logging.getLogger("uvicorn")


def seed_database(db: Session):
    # 1. Superadmin User
    admin = db.query(AdminUser).filter(AdminUser.username == "ADMIN").first()
    if not admin:
        default_admin = AdminUser(
            username="ADMIN",
            hashed_password=hash_password("ADMIN"),
            is_superadmin=True,
        )
        db.add(default_admin)
        db.commit()
        logger.info("Created default Superadmin: Username=ADMIN, Password=ADMIN")

    # 2. Business Profile
    if not db.query(BusinessProfile).first():
        profile = BusinessProfile(
            id="default",
            name="ROLEX Events & Caterers",
            tagline="Exquisite Banquets & Royal Culinary Experiences",
            phone="+91 98470 12345",
            email="operations@rolexcaterers.com",
            address="Rolex Heritage Grand Tower, Calicut Road, Kerala, India",
            gst_number="32AAAAA0000A1Z5",
            currency_symbol="₹",
            quotation_terms=[
                "50% advance payment required upon quotation confirmation.",
                "40% payment payable 48 hours prior to the event setup.",
                "Balance 10% upon successful event conclusion.",
                "Guest count must be locked 3 days prior to the function.",
                "All broken or missing crockery/cutlery will be billed at actual cost.",
            ],
            whatsapp_template=(
                "Dear {clientName}, greetings from ROLEX Events & Caterers! "
                "Here is the latest update for your upcoming event '{eventTitle}' on {eventDate}. "
                "Please review the details or reach out for any customizations. "
                "Warm regards, Rolex Operations Team."
            ),
        )
        db.add(profile)
        db.commit()

    logger.info("Database initialization verified: Admin & Business Profile active. Operational tables clean.")

