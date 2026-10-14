"""Unit and integration test script for Urban Scenery Ventures FastAPI backend."""
from decimal import Decimal
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app
from settings import sessionlocal, engine, Model
from core.database import init_db
from models.products_model import Product
from models.utils import ProductStatus
from services.lookup_service import get_lookup
from services.user_service import UserService


def run_tests():
    print("=== STARTING FASTAPI BACKEND TEST SUITE ===")
    
    # Initialize database tables
    init_db()
    client = TestClient(app)

    # 1. Health check test
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] GET /health returned 200 OK")

    # 2. Root info test
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"
    print("[PASS] GET / returned 200 OK with online status")

    # 3. Seed test product
    db = sessionlocal()
    test_prod = db.query(Product).filter(Product.name == "Test Electronics Drone").first()
    if not test_prod:
        test_prod = Product(
            name="Test Electronics Drone",
            price=Decimal("299.99"),
            description="4K camera drone with GPS and auto return",
            quantity=10,
            product_status=get_lookup(db, ProductStatus, "AVAILABLE"),
        )
        db.add(test_prod)
        db.commit()
        db.refresh(test_prod)
    test_product_id = test_prod.id
    db.close()
    print(f"[PASS] Seeded test product #{test_product_id}")

    # 4. Product catalog listing test
    res = client.get("/api/v1/products")
    assert res.status_code == 200
    products = res.json()
    assert len(products) > 0
    print(f"[PASS] GET /api/v1/products returned {len(products)} products")

    # 5. User registration test
    import uuid
    rand_email = f"user_{uuid.uuid4().hex[:6]}@test.com"
    reg_payload = {
        "name": "Test Customer",
        "email": rand_email,
        "password": "securepassword123",
        "contact": "+250780000111",
        "role": "CUSTOMER",
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Registration failed: {res.text}"
    user_data = res.json()
    assert user_data["email"] == rand_email
    print(f"[PASS] POST /api/v1/auth/register created user {rand_email}")

    # 6. User login test
    login_payload = {
        "email": rand_email,
        "password": "securepassword123",
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.text}"
    token_data = res.json()
    assert "access_token" in token_data
    auth_header = {"Authorization": f"Bearer {token_data['access_token']}"}
    print("[PASS] POST /api/v1/auth/login returned JWT bearer token")

    # 7. Authenticated /me endpoint test
    res = client.get("/api/v1/auth/me", headers=auth_header)
    assert res.status_code == 200
    assert res.json()["email"] == rand_email
    print("[PASS] GET /api/v1/auth/me returned correct authenticated user")

    res = client.post(
        "/api/v1/auth/token",
        data={"username": rand_email, "password": "securepassword123"},
    )
    assert res.status_code == 200, f"OAuth token exchange failed: {res.text}"
    oauth_token = res.json()["access_token"]
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {oauth_token}"},
    )
    assert res.status_code == 200, f"OAuth bearer token rejected: {res.text}"
    print("[PASS] Swagger OAuth2 password flow authorized /api/v1/auth/me")

    # 8. Order creation test (Checks stock reduction)
    order_payload = {
        "product_id": test_product_id,
        "quantity": 2,
        "address": "Kigali Heights, 4th Floor, Kigali",
        "contact": "+250780000111",
        "payment_method": "MOBILE MONEY",
    }
    res = client.post("/api/v1/orders", json=order_payload, headers=auth_header)
    assert res.status_code == 201, f"Order creation failed: {res.text}"
    order_data = res.json()
    order_id = order_data["id"]
    assert order_data["quantity"] == 2
    assert Decimal(str(order_data["total_price"])) == Decimal("299.99") * 2
    assert order_data["payment_status"] == "NOT YET PAID"
    print(f"[PASS] POST /api/v1/orders created order #{order_id} with correct total price")

    # 9. Verify stock decrement
    db = sessionlocal()
    updated_prod = db.get(Product, test_product_id)
    assert updated_prod.quantity == 8, f"Expected 8 in stock, got {updated_prod.quantity}"
    db.close()
    print("[PASS] Inventory stock decremented from 10 to 8 automatically")

    # 10. Process Payment test
    pay_payload = {
        "order_id": order_id,
        "payment_method": "MOBILE MONEY",
        "amount": float(order_data["total_price"]),
    }
    res = client.post("/api/v1/payments/pay", json=pay_payload)
    assert res.status_code == 201, f"Payment failed: {res.text}"
    payment_data = res.json()
    assert payment_data["order_id"] == order_id
    print(f"[PASS] POST /api/v1/payments/pay settled payment for order #{order_id}")

    # 11. Verify order status after payment
    res = client.get(f"/api/v1/orders/{order_id}", headers=auth_header)
    assert res.status_code == 200
    assert res.json()["payment_status"] == "PAID"
    assert res.json()["order_status"] == "APPROVED"
    print(f"[PASS] Order #{order_id} marked as PAID and APPROVED")

    # 12. AI Recommendation test
    ai_query = {
        "query": "looking for a 4K camera drone for aerial photography",
        "max_budget": 500.0,
    }
    res = client.post("/api/v1/ai/recommend", json=ai_query)
    assert res.status_code == 200
    ai_data = res.json()
    assert len(ai_data["recommendations"]) > 0
    print(f"[PASS] POST /api/v1/ai/recommend matched: {ai_data['recommendations'][0]['name']}")

    # 13. AI Smart Search test
    res = client.get("/api/v1/ai/smart-search?q=drone")
    assert res.status_code == 200
    assert res.json()["total_matches"] > 0
    print(f"[PASS] GET /api/v1/ai/smart-search found {res.json()['total_matches']} matches for 'drone'")

    # 14. Admin-only CRUD endpoints for each remaining model
    import uuid
    admin_email = f"admin_{uuid.uuid4().hex[:8]}@test.com"
    db = sessionlocal()
    UserService(db).create_user(
        email=admin_email,
        name="CRUD Administrator",
        password="securepassword123",
        role="ADMIN",
    )
    db.close()
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": admin_email, "password": "securepassword123"},
    )
    assert admin_login.status_code == 200, admin_login.text
    admin_header = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    assert client.get("/api/v1/lookups/product-statuses").status_code == 401
    assert client.get(
        "/api/v1/lookups/product-statuses", headers=auth_header
    ).status_code == 403

    lookup = client.post(
        "/api/v1/lookups/product-statuses",
        headers=admin_header,
        json={"name": "CRUD TEST", "description": "Temporary CRUD test value"},
    )
    assert lookup.status_code == 201, lookup.text
    lookup_id = lookup.json()["id"]
    assert client.get(
        f"/api/v1/lookups/product-statuses/{lookup_id}", headers=admin_header
    ).status_code == 200
    lookup = client.put(
        f"/api/v1/lookups/product-statuses/{lookup_id}",
        headers=admin_header,
        json={"description": "Updated CRUD test value"},
    )
    assert lookup.status_code == 200
    assert lookup.json()["description"] == "Updated CRUD test value"
    assert client.delete(
        f"/api/v1/lookups/product-statuses/{lookup_id}", headers=admin_header
    ).status_code == 204

    new_user = client.post(
        "/api/v1/users",
        headers=admin_header,
        json={
            "name": "CRUD Test User",
            "email": f"crud_{uuid.uuid4().hex[:8]}@test.com",
            "password": "securepassword123",
            "role": "CUSTOMER",
        },
    )
    assert new_user.status_code == 201, new_user.text
    user_public_id = new_user.json()["public_id"]
    assert client.get(
        f"/api/v1/users/{user_public_id}", headers=admin_header
    ).status_code == 200
    role_change = client.patch(
        f"/api/v1/users/{user_public_id}/role",
        headers=admin_header,
        json={"role": "GUEST"},
    )
    assert role_change.status_code == 200
    assert role_change.json()["role"] == "GUEST"
    assert client.delete(
        f"/api/v1/users/{user_public_id}", headers=admin_header
    ).status_code == 204

    product = client.post(
        "/api/v1/products",
        headers=admin_header,
        json={
            "name": "CRUD Test Accessory",
            "price": 15.25,
            "description": "Temporary product for CRUD tests",
            "quantity": 4,
            "status": "AVAILABLE",
        },
    )
    assert product.status_code == 201, product.text
    crud_product_id = product.json()["id"]
    assert client.get(f"/api/v1/products/{crud_product_id}").status_code == 200
    product = client.put(
        f"/api/v1/products/{crud_product_id}",
        headers=admin_header,
        json={"quantity": 6},
    )
    assert product.status_code == 200
    assert product.json()["quantity"] == 6
    assert client.delete(
        f"/api/v1/products/{crud_product_id}", headers=admin_header
    ).status_code == 204

    assert client.delete(
        f"/api/v1/products/{test_product_id}", headers=admin_header
    ).status_code == 409

    interaction = client.post(
        "/api/v1/ai/interactions",
        headers=admin_header,
        json={"prompt": "CRUD prompt", "response": "CRUD response"},
    )
    assert interaction.status_code == 201, interaction.text
    interaction_id = interaction.json()["id"]
    assert client.get(
        f"/api/v1/ai/interactions/{interaction_id}", headers=admin_header
    ).status_code == 200
    interaction = client.put(
        f"/api/v1/ai/interactions/{interaction_id}",
        headers=admin_header,
        json={"response": "Updated response"},
    )
    assert interaction.status_code == 200
    assert interaction.json()["response"] == "Updated response"
    assert client.get(
        "/api/v1/ai/interactions", headers=admin_header
    ).status_code == 200
    assert client.delete(
        f"/api/v1/ai/interactions/{interaction_id}", headers=admin_header
    ).status_code == 204

    payment_id = payment_data["id"]
    assert client.get(
        f"/api/v1/payments/order/{order_id}", headers=admin_header
    ).status_code == 200
    assert client.get("/api/v1/payments", headers=admin_header).status_code == 200
    assert client.get("/api/v1/orders", headers=admin_header).status_code == 200
    payment_update = client.put(
        f"/api/v1/payments/{payment_id}",
        headers=admin_header,
        json={
            "payment_method": "BANK",
            "amount": float(order_data["total_price"]),
        },
    )
    assert payment_update.status_code == 200, payment_update.text
    assert payment_update.json()["payment_method"] == "BANK"
    assert client.delete(
        f"/api/v1/payments/{payment_id}", headers=admin_header
    ).status_code == 204
    order_after_payment_delete = client.get(
        f"/api/v1/orders/{order_id}", headers=auth_header
    )
    assert order_after_payment_delete.status_code == 200
    assert order_after_payment_delete.json()["payment_status"] == "NOT YET PAID"
    assert order_after_payment_delete.json()["order_status"] == "PENDING"
    order_update = client.patch(
        f"/api/v1/orders/{order_id}/status",
        headers=admin_header,
        json={"order_status": "CANCELLED"},
    )
    assert order_update.status_code == 200, order_update.text
    assert client.delete(
        f"/api/v1/orders/{order_id}", headers=admin_header
    ).status_code == 204
    assert client.delete(
        f"/api/v1/products/{test_product_id}", headers=admin_header
    ).status_code == 204
    print("[PASS] Admin CRUD exercised across the model and lookup endpoints")

    print("\n=== ALL 14 TEST SUITES PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    run_tests()
