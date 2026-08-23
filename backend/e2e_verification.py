import sys
import unittest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.database import SessionLocal, engine
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product

client = TestClient(app)


class E2EFullVerification(unittest.TestCase):

    def setUp(self):
        self.db: Session = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_customer_registration_and_auth(self):
        email = "e2e_cust_test@restaurant.ai"
        pwd = "CustomerPassword123!"

        # Register
        reg_res = client.post("/auth/register", json={
            "name": "E2E Customer",
            "email": email,
            "password": pwd,
            "role": "customer"
        })
        if reg_res.status_code == 201:
            token = reg_res.json()["access_token"]
            user = reg_res.json()["user"]
        else:
            login_res = client.post("/auth/login", json={"email": email, "password": pwd})
            token = login_res.json()["access_token"]
            user = login_res.json()["user"]

        self.assertIsNotNone(token)
        self.assertEqual(user["role"], "customer")

        # Get current user profile
        me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], email)

    def test_02_menu_browsing_and_search(self):
        # Categories
        cats_res = client.get("/categories/")
        self.assertEqual(cats_res.status_code, 200)
        cats = cats_res.json()
        self.assertGreaterEqual(len(cats), 1)

        # Products
        prods_res = client.get("/products/")
        self.assertEqual(prods_res.status_code, 200)
        prods = prods_res.json()
        self.assertGreaterEqual(len(prods), 1)

        # Search
        search_res = client.get("/products/?search=pizza")
        self.assertEqual(search_res.status_code, 200)

    def test_03_ai_recommendation_multilingual(self):
        # Arabic query
        ar_res = client.post("/ai/recommend", json={"query": "أريد وجبة رخيصة بدون دجاج"})
        self.assertEqual(ar_res.status_code, 200)
        self.assertIn("recommended_products", ar_res.json())

        # English query
        en_res = client.post("/ai/recommend", json={"query": "Vegetarian options under 200"})
        self.assertEqual(en_res.status_code, 200)
        self.assertIn("recommended_products", en_res.json())

    def test_04_order_creation_and_postgresql_verification(self):
        # 1. Login Customer
        login_res = client.post("/auth/login", json={
            "email": "customer@restaurant.ai",
            "password": "customer123"
        })
        token = login_res.json()["access_token"]
        cust_id = login_res.json()["user"]["id"]

        # 2. Get 2 products from database
        products = self.db.query(Product).filter(Product.is_available == True).all()
        self.assertGreaterEqual(len(products), 2)
        p1, p2 = products[0], products[1]

        qty1, qty2 = 2, 3
        expected_total = (Decimal(str(p1.price)) * qty1) + (Decimal(str(p2.price)) * qty2)

        # 3. Create Order via API
        create_res = client.post("/orders/", json={
            "user_id": cust_id,
            "items": [
                {"product_id": str(p1.id), "quantity": qty1},
                {"product_id": str(p2.id), "quantity": qty2}
            ]
        }, headers={"Authorization": f"Bearer {token}"})

        self.assertEqual(create_res.status_code, 201)
        order_api_data = create_res.json()
        order_id = order_api_data["id"]

        # 4. DIRECT POSTGRESQL DB VERIFICATION
        db_order = self.db.query(Order).filter(Order.id == order_id).first()
        self.assertIsNotNone(db_order, "Order record must exist in PostgreSQL database!")
        self.assertEqual(Decimal(str(db_order.total_price)), expected_total)
        self.assertEqual(db_order.status, "Pending")

        # Verify OrderItems in PostgreSQL
        db_items = self.db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        self.assertEqual(len(db_items), 2, "Must contain exactly 2 OrderItem rows in PostgreSQL!")

        # Verify locked item prices
        for item in db_items:
            if str(item.product_id) == str(p1.id):
                self.assertEqual(item.quantity, qty1)
                self.assertEqual(Decimal(str(item.price)), Decimal(str(p1.price)))
            elif str(item.product_id) == str(p2.id):
                self.assertEqual(item.quantity, qty2)
                self.assertEqual(Decimal(str(item.price)), Decimal(str(p2.price)))

        # 5. Get My Orders via API
        my_orders_res = client.get("/orders/my-orders", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(my_orders_res.status_code, 200)
        user_order_ids = [o["id"] for o in my_orders_res.json()]
        self.assertIn(order_id, user_order_ids)

    def test_05_admin_flow_and_cascade_deletion_verification(self):
        # 1. Login Admin
        admin_login = client.post("/auth/login", json={
            "email": "admin@restaurant.ai",
            "password": "admin123"
        })
        self.assertEqual(admin_login.status_code, 200)
        admin_token = admin_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}

        # 2. Create Product
        prod_res = client.post("/products/", json={
            "name": "E2E Admin Special Dish",
            "description": "Exclusive dish created during E2E test",
            "price": 199.99,
            "is_available": True
        }, headers=headers)
        self.assertEqual(prod_res.status_code, 201)
        prod_id = prod_res.json()["id"]

        # 3. Edit Product
        edit_res = client.put(f"/products/{prod_id}", json={
            "name": "E2E Admin Special Dish Updated",
            "price": 219.99
        }, headers=headers)
        self.assertEqual(edit_res.status_code, 200)
        self.assertEqual(edit_res.json()["name"], "E2E Admin Special Dish Updated")

        # 4. Create an Order using this product to test order deletion
        order_res = client.post("/orders/", json={
            "items": [{"product_id": prod_id, "quantity": 1}]
        }, headers=headers)
        self.assertEqual(order_res.status_code, 201)
        test_order_id = order_res.json()["id"]

        # 5. Change Order Status
        status_res = client.put(f"/orders/{test_order_id}/status", json={
            "status": "Preparing"
        }, headers=headers)
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.json()["status"], "Preparing")

        # 6. Delete Order via API and verify CASCADE Deletion in PostgreSQL
        del_order_res = client.delete(f"/orders/{test_order_id}", headers=headers)
        self.assertEqual(del_order_res.status_code, 200)

        # DIRECT DB VERIFICATION OF CASCADE DELETE
        order_in_db = self.db.query(Order).filter(Order.id == test_order_id).first()
        self.assertIsNone(order_in_db, "Order record must be completely deleted from PostgreSQL!")

        items_in_db = self.db.query(OrderItem).filter(OrderItem.order_id == test_order_id).all()
        self.assertEqual(len(items_in_db), 0, "OrderItem records must be cascade deleted from PostgreSQL!")

        # 7. Delete Product
        del_prod_res = client.delete(f"/products/{prod_id}", headers=headers)
        self.assertEqual(del_prod_res.status_code, 200)

    def test_06_unauthorized_access(self):
        # 1. Login regular customer
        cust_login = client.post("/auth/login", json={
            "email": "customer@restaurant.ai",
            "password": "customer123"
        })
        cust_token = cust_login.json()["access_token"]
        cust_headers = {"Authorization": f"Bearer {cust_token}"}

        # Customer attempts to create product -> 403 Forbidden
        create_prod = client.post("/products/", json={
            "name": "Hacker Dish",
            "price": 10.00
        }, headers=cust_headers)
        self.assertEqual(create_prod.status_code, 403)

        # Customer attempts to update order status -> 403 Forbidden
        orders_res = client.get("/orders/my-orders", headers=cust_headers)
        if orders_res.json():
            oid = orders_res.json()[0]["id"]
            status_upd = client.put(f"/orders/{oid}/status", json={"status": "Delivered"}, headers=cust_headers)
            self.assertEqual(status_upd.status_code, 403)

        # Unauthenticated user attempts /auth/me -> 401 Unauthorized
        me_unauth = client.get("/auth/me")
        self.assertEqual(me_unauth.status_code, 401)


if __name__ == "__main__":
    unittest.main()
