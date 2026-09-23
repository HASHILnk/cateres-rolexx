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

    # 3. Seed Initial Clients
    if db.query(Client).count() == 0:
        clients_data = [
            {
                "id": "cli-1",
                "name": "Dr. Tariq Rahman",
                "phone": "+91 98951 44220",
                "email": "dr.tariq@rahmanhealth.com",
                "address": "Skyline Imperial Villa 14, Kozhikode",
                "company": "Rahman Specialty Hospitals",
                "vip": True,
                "total_events": 3,
                "total_spend": 1450000,
                "last_event_date": "2026-09-26",
                "notes": "Very particular about warm dessert presentation and copper handi displays.",
            },
            {
                "id": "cli-2",
                "name": "Adv. Meera Nambiar",
                "phone": "+91 94472 88102",
                "email": "meera.nambiar@lexchambers.in",
                "address": "Rosewood Gardens, Ernakulam",
                "company": "Lex Chambers & Associates",
                "vip": False,
                "total_events": 1,
                "total_spend": 480000,
                "last_event_date": "2026-10-04",
                "notes": "Requires strictly 100% vegetarian live counters with Jain options.",
            },
            {
                "id": "cli-3",
                "name": "Sanjay Singhania",
                "phone": "+91 98200 99341",
                "email": "sanjay@singhanialogistics.com",
                "address": "Silver Crest Penthouse, Marine Drive, Kochi",
                "company": "Singhania Logistics Ltd",
                "vip": True,
                "total_events": 4,
                "total_spend": 2800000,
                "last_event_date": "2026-09-24",
                "notes": "VIP corporate partner. Always requests executive silver service & live mocktail station.",
            },
            {
                "id": "cli-4",
                "name": "Fathima Nihala",
                "phone": "+91 97455 33119",
                "email": "nihala.f@gmail.com",
                "address": "Palace View Residency, Malappuram",
                "company": None,
                "vip": False,
                "total_events": 1,
                "total_spend": 620000,
                "last_event_date": "2026-10-12",
                "notes": "Traditional Malabar wedding feast. Demands Dum Biryani cooked on dum woodfire.",
            },
            {
                "id": "cli-5",
                "name": "Capt. Rajesh Varma",
                "phone": "+91 94960 77331",
                "email": "capt.varma@maritime.org",
                "address": "Heritage Enclave, Fort Kochi",
                "company": "Maritime Operations",
                "vip": False,
                "total_events": 2,
                "total_spend": 740000,
                "last_event_date": "2026-08-15",
                "notes": "Prefers colonial high tea and seafood grilled appetizers.",
            },
        ]
        for c in clients_data:
            db.add(Client(**c))
        db.commit()

    # 4. Seed Initial Stock Items
    if db.query(StockItem).count() == 0:
        stock_data = [
            {"id": "stk-1", "name": "Royal Brass Chafing Dish (Round 6L)", "category": "Chafing Dishes", "total_qty": 45, "reserved_qty": 32, "unit": "nos", "min_threshold": 10},
            {"id": "stk-2", "name": "Hammered Copper Handi with Stand (8L)", "category": "Chafing Dishes", "total_qty": 30, "reserved_qty": 24, "unit": "nos", "min_threshold": 8},
            {"id": "stk-3", "name": "Porcelain Gold-Rim Dinner Plates (10.5 in)", "category": "Crockery & China", "total_qty": 1200, "reserved_qty": 950, "unit": "nos", "min_threshold": 200},
            {"id": "stk-4", "name": "Fine Bone China Dessert Bowls", "category": "Crockery & China", "total_qty": 800, "reserved_qty": 650, "unit": "nos", "min_threshold": 150},
            {"id": "stk-5", "name": "Heavy Gauge Stainless Cutlery Set (Fork/Spoon)", "category": "Cutlery & Silverware", "total_qty": 1500, "reserved_qty": 1100, "unit": "pairs", "min_threshold": 300},
            {"id": "stk-6", "name": "Crystal Cut Water Goblets (320ml)", "category": "Glassware", "total_qty": 900, "reserved_qty": 750, "unit": "nos", "min_threshold": 150},
            {"id": "stk-7", "name": "Live Shawarma & Grill Machine (3 Burner)", "category": "Live Station", "total_qty": 8, "reserved_qty": 5, "unit": "units", "min_threshold": 2},
            {"id": "stk-8", "name": "Dum Biryani Woodfire Cooking Deg (60kg)", "category": "Cookware", "total_qty": 14, "reserved_qty": 8, "unit": "units", "min_threshold": 4},
            {"id": "stk-9", "name": "Insulated Thermal Food Carrier Transport Boxes", "category": "Transport & Logistics", "total_qty": 40, "reserved_qty": 28, "unit": "nos", "min_threshold": 10},
            {"id": "stk-10", "name": "Champagne Gold Banquet Damask Table Linen", "category": "Linens & Decor", "total_qty": 160, "reserved_qty": 120, "unit": "nos", "min_threshold": 30},
        ]
        for s in stock_data:
            db.add(StockItem(**s))
        db.commit()

    # 5. Seed Initial Events
    if db.query(CateringEvent).count() == 0:
        events_data = [
            {
                "id": "evt-1",
                "title": "Dr. Tariq Rahman Grand Royal Wedding Banquet",
                "client_name": "Dr. Tariq Rahman",
                "client_phone": "+91 98951 44220",
                "date": "2026-09-26",
                "time": "06:30 PM - 11:30 PM",
                "guest_count": 500,
                "venue": "Grand Regal Palace Convention Centre, Calicut",
                "event_type": "Wedding",
                "status": "confirmed",
                "budget": 750000,
                "advance_paid": 400000,
                "menu_locked": True,
                "special_instructions": "VIP bride & groom private dining counter with antique brass service.",
            },
            {
                "id": "evt-2",
                "title": "Singhania Logistics Corporate Annual Banquet",
                "client_name": "Sanjay Singhania",
                "client_phone": "+91 98200 99341",
                "date": "2026-09-24",
                "time": "07:00 PM - 11:00 PM",
                "guest_count": 250,
                "venue": "Le Maritime Waterfront Ballroom, Kochi",
                "event_type": "Corporate Gala",
                "status": "confirmed",
                "budget": 420000,
                "advance_paid": 300000,
                "menu_locked": True,
                "special_instructions": "Live pasta and flambé dessert counter required.",
            },
            {
                "id": "evt-3",
                "title": "Nambiar Family Jubilee Silver Reception",
                "client_name": "Adv. Meera Nambiar",
                "client_phone": "+91 94472 88102",
                "date": "2026-10-04",
                "time": "11:30 AM - 03:30 PM",
                "guest_count": 350,
                "venue": "Heritage Malabar Garden Pavilion, Thrissur",
                "event_type": "Reception",
                "status": "planning",
                "budget": 480000,
                "advance_paid": 150000,
                "menu_locked": False,
                "special_instructions": "Strictly 100% vegetarian menu with special Jain live counter.",
            },
        ]
        for ed in events_data:
            ev = CateringEvent(**ed)
            db.add(ev)
            db.commit()
            db.refresh(ev)

            # Add default readiness checklist for each event
            checklist = [
                ("Catering Crew", "Executive Head Chef & Sous Chef Assigned", True, "high"),
                ("Catering Crew", "Uniformed Banquet Captain & Steward Roster", True, "medium"),
                ("Live Counters", "Copper Chafing Handi & Live Grills Verified", True, "high"),
                ("Beverage Station", "Welcome Mocktails & Ice Box Setup", False, "medium"),
                ("Logistics", "Delivery Vehicle & Buffet Warmers Dispatched", False, "high"),
                ("Client Coordination", "Final Guest Count & Dietary Preferences Locked", True, "high"),
            ]
            for cat, label, is_done, prio in checklist:
                db.add(ReadinessItem(event_id=ev.id, category=cat, label=label, is_done=is_done, priority=prio))

            # Add menu items
            menu = [
                ("Welcome Drinks", "Royal Saffron Cardamom Sharbat", "Beverage", "Served in crystal cut goblets"),
                ("Starters", "Murgh Malai Tikka with Mint Chutney", "Non-Veg", "Live charcoal tandoor counter"),
                ("Main Course", "Rolex Heritage Dum Mutton Biryani", "Non-Veg", "Cooked in traditional 60kg deg"),
                ("Desserts", "Warm Shahi Tukda with Gold Vark", "Sweet", "Presented in warm brass handi"),
            ]
            for cat, name, diet, notes in menu:
                db.add(MenuCourseItem(event_id=ev.id, category=cat, name=name, dietary=diet, notes=notes))
            db.commit()

    # 6. Seed Initial Quotations
    if db.query(Quotation).count() == 0:
        quotations_data = [
            {
                "id": "qt-1",
                "quotation_number": "QT-2026-089",
                "client_name": "Dr. Tariq Rahman",
                "client_phone": "+91 98951 44220",
                "event_title": "Grand Royal Wedding Banquet (500 Pax)",
                "date": "2026-09-20",
                "valid_until": "2026-09-25",
                "status": "approved",
                "subtotal": 714285,
                "tax_pct": 5.0,
                "discount_pct": 0.0,
                "total": 750000,
                "notes": "Includes 4 Live Interactive Food Counters & Royal Buffet Setup",
            },
            {
                "id": "qt-2",
                "quotation_number": "QT-2026-090",
                "client_name": "Sanjay Singhania",
                "client_phone": "+91 98200 99341",
                "event_title": "Corporate Annual Leadership Gala (250 Pax)",
                "date": "2026-09-18",
                "valid_until": "2026-09-23",
                "status": "approved",
                "subtotal": 400000,
                "tax_pct": 5.0,
                "discount_pct": 0.0,
                "total": 420000,
                "notes": "Executive corporate silver dining and live mocktail lounge",
            },
        ]
        for qd in quotations_data:
            q = Quotation(**qd)
            db.add(q)
            db.commit()
            db.refresh(q)

            line_items = [
                ("Executive Multi-Cuisine Buffet Feast (Per Pax)", "Food & Beverage", 500, 950, 475000),
                ("Live Malabar Biryani Woodfire Cooking Deg Setup", "Live Counters", 2, 25000, 50000),
                ("Royal Brass Chafing & Silver Platter Presentation", "Equipment", 1, 60000, 60000),
                ("Uniformed Service Captains & Professional Waitstaff", "Staff & Logistics", 20, 2500, 50000),
            ]
            for desc, cat, qty, rate, amt in line_items:
                db.add(QuotationLineItem(quotation_id=q.id, description=desc, category=cat, quantity=qty, unit_rate=rate, amount=amt))
            db.commit()

    # 7. Seed Initial Transactions
    if db.query(Transaction).count() == 0:
        txns_data = [
            {"id": "txn-1", "event_id": "evt-1", "type": "income", "amount": 400000, "category": "Event Advance Payment", "description": "50% Advance received for Rahman Wedding", "date": "2026-09-18", "payment_method": "Bank Transfer", "status": "completed"},
            {"id": "txn-2", "event_id": "evt-2", "type": "income", "amount": 300000, "category": "Event Advance Payment", "description": "Corporate advance for Singhania Gala", "date": "2026-09-19", "payment_method": "UPI / NetBanking", "status": "completed"},
            {"id": "txn-3", "event_id": "evt-1", "type": "expense", "amount": 85000, "category": "Raw Materials & Groceries", "description": "Premium Basmati Rice, Ghee, and Malabar Spices", "date": "2026-09-22", "payment_method": "Direct Vendor Transfer", "status": "completed"},
            {"id": "txn-4", "event_id": "evt-2", "type": "expense", "amount": 45000, "category": "Kitchen Staff & Crew Wages", "description": "Chefs & Tandoor Specialist advance wages", "date": "2026-09-22", "payment_method": "Cash", "status": "completed"},
        ]
        for t in txns_data:
            db.add(Transaction(**t))
        db.commit()

    logger.info("Database initialization and initial data verification complete.")
