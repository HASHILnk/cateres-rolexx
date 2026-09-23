from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import BusinessProfile, AdminUser
from ..schemas import BusinessProfileUpdate, BusinessProfileResponse
from ..auth import get_current_admin

router = APIRouter(prefix="/api/profile", tags=["Business Profile & Settings"])


@router.get("", response_model=BusinessProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(BusinessProfile).first()
    if not profile:
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
        db.refresh(profile)
    return profile


@router.put("", response_model=BusinessProfileResponse)
def update_profile(
    payload: BusinessProfileUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    profile = db.query(BusinessProfile).first()
    if not profile:
        profile = BusinessProfile(id="default")
        db.add(profile)

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile
