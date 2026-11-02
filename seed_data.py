from __future__ import annotations
"""Seed database with sample electronics products and initial admin user."""
from decimal import Decimal
from core.database import init_db, sessionlocal
from models.users_model import User
from models.products_model import Product
from models.utils import ProductStatus, UserRole
from core.security import hash_password
from services.lookup_service import get_lookup


def seed():
    # Ensure tables exist
    init_db()
    db = sessionlocal()

    try:
        # 1. Seed Admin User
        admin_email = "admin@urbanventures.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="Admin Manager",
                email=admin_email,
                hashed_password=hash_password("admin123"),
                user_role=get_lookup(db, UserRole, "ADMIN"),
                contact="+250788000001",
            )
            db.add(admin)
            print("Created default admin user: admin@urbanventures.com / admin123")

        # 2. Seed Customer User
        customer_email = "customer@example.com"
        customer = db.query(User).filter(User.email == customer_email).first()
        if not customer:
            customer = User(
                name="John Techie",
                email=customer_email,
                hashed_password=hash_password("customer123"),
                user_role=get_lookup(db, UserRole, "CUSTOMER"),
                contact="+250788000002",
            )
            db.add(customer)
            print("Created default customer user: customer@example.com / customer123")

        # 3. Seed Sample Electronics Catalog
        sample_electronics = [
            {
                "name": "Apple MacBook Pro 14 M3 Pro",
                "price": Decimal("1999.00"),
                "description": "14-inch Liquid Retina XDR display, 18GB Unified Memory, 512GB SSD, Space Black. Designed for high performance developers and creators.",
                "banner_image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
                "quantity": 15,
                "status": "AVAILABLE",
            },
            {
                "name": "Sony WH-1000XM5 Wireless Headphones",
                "price": Decimal("399.99"),
                "description": "Industry-leading noise canceling Bluetooth headphones with Auto NC Optimizer, crystal clear hands-free calling, and 30-hour battery life.",
                "banner_image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
                "quantity": 30,
                "status": "AVAILABLE",
            },
            {
                "name": "Samsung Galaxy S24 Ultra",
                "price": Decimal("1299.99"),
                "description": "Titanium Gray, 256GB, Galaxy AI powered smartphone with 200MP camera, Snapdragon 8 Gen 3, and built-in S Pen.",
                "banner_image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c",
                "quantity": 25,
                "status": "AVAILABLE",
            },
            {
                "name": "Dell UltraSharp 27 4K USB-C Monitor (U2723QE)",
                "price": Decimal("579.50"),
                "description": "IPS Black technology with 2000:1 contrast ratio, 98% DCI-P3 color gamut, 4K resolution, and 90W USB-C power delivery hub.",
                "banner_image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
                "quantity": 10,
                "status": "AVAILABLE",
            },
            {
                "name": "Anker 737 Power Bank (PowerCore 24K)",
                "price": Decimal("149.99"),
                "description": "24,000mAh 3-port portable charger with 140W fast output, smart digital display, compatible with laptops, phones, and tablets.",
                "banner_image": "https://images.unsplash.com/photo-1609592424364-c78d53b27670",
                "quantity": 50,
                "status": "AVAILABLE",
            },
            {
                "name": "Sony PlayStation 5 Slim Console",
                "price": Decimal("499.00"),
                "description": "Next-gen gaming console with 1TB SSD, ultra-high speed SSD, ray tracing, 4K-TV gaming, and DualSense wireless controller.",
                "banner_image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
                "quantity": 8,
                "status": "AVAILABLE",
            },
            {
                "name": "DJI Mini 4 Pro 4K HDR Camera Drone",
                "price": Decimal("759.00"),
                "description": "Sub-249g ultra-light folding drone, 4K/60fps HDR true vertical shooting, omnidirectional active obstacle sensing, 34-min flight battery.",
                "banner_image": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108",
                "quantity": 18,
                "status": "AVAILABLE",
            },
            {
                "name": "Meta Quest 3 Mixed Reality VR Headset (512GB)",
                "price": Decimal("649.99"),
                "description": "Breakthrough mixed reality headset with 4K+ Infinite Display, Snapdragon XR2 Gen 2, Touch Plus controllers with TruTouch haptics.",
                "banner_image": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df",
                "quantity": 12,
                "status": "AVAILABLE",
            },
            {
                "name": "Apple Watch Ultra 2 GPS + Cellular",
                "price": Decimal("799.00"),
                "description": "Rugged 49mm titanium case, 3000-nit display, S9 SiP with double tap gesture, precision dual-frequency GPS, and 36-hour battery life.",
                "banner_image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
                "quantity": 22,
                "status": "AVAILABLE",
            },
            {
                "name": "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
                "price": Decimal("210.00"),
                "description": "CNC aluminum body, 75% layout, QMK/VIA programmable, hot-swappable switches, sound-absorbing acoustic foam, and Bluetooth 5.1.",
                "banner_image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
                "quantity": 35,
                "status": "AVAILABLE",
            },
            {
                "name": "Sony Alpha a7 IV Full-Frame Mirrorless Camera",
                "price": Decimal("2498.00"),
                "description": "33MP Exmor R CMOS sensor, 4K 60p 10-bit 4:2:2 video, real-time eye AF for humans, animals, and birds, 5-axis optical stabilization.",
                "banner_image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
                "quantity": 14,
                "status": "AVAILABLE",
            },
            {
                "name": "EcoFlow DELTA 2 Max 2400W Portable Power Station",
                "price": Decimal("1899.00"),
                "description": "2048Wh expandable LiFePO4 battery station, X-Boost up to 3400W output, 0-80% charge in 43 minutes, dual solar charging inputs.",
                "banner_image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
                "quantity": 9,
                "status": "AVAILABLE",
            },
        ]

        for item in sample_electronics:
            existing = db.query(Product).filter(Product.name == item["name"]).first()
            if not existing:
                product_data = item.copy()
                product_status = get_lookup(
                    db, ProductStatus, product_data.pop("status")
                )
                prod = Product(**product_data, product_status=product_status)
                db.add(prod)
                print(f"Added electronics product: {item['name']}")

        db.commit()
        print("Database seeding completed successfully!")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
