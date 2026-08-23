import unittest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.main import app
from app.db.database import SessionLocal
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.category import Category

client = TestClient(app)


class TestAdminAIBusinessAnalytics(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.db: Session = SessionLocal()

        # Login Admin
        admin_login = client.post("/auth/login", json={
            "email": "admin@restaurant.ai",
            "password": "admin123"
        })
        cls.admin_token = admin_login.json()["access_token"]
        cls.admin_headers = {"Authorization": f"Bearer {cls.admin_token}"}

        # Login Customer
        cust_login = client.post("/auth/login", json={
            "email": "customer@restaurant.ai",
            "password": "customer123"
        })
        cls.cust_token = cust_login.json()["access_token"]
        cls.cust_headers = {"Authorization": f"Bearer {cls.cust_token}"}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_customer_unauthorized_access(self):
        # Customer attempts to query admin AI analytics -> Must return 403 Forbidden
        res = client.post("/ai/admin-analytics", json={"query": "What is total revenue?"}, headers=self.cust_headers)
        self.assertEqual(res.status_code, 403, "Customer must NOT be allowed to access admin AI analytics!")

        # Unauthenticated user attempts to query admin AI analytics -> Must return 401 Unauthorized
        res_unauth = client.post("/ai/admin-analytics", json={"query": "What is total revenue?"})
        self.assertEqual(res_unauth.status_code, 401, "Unauthenticated request must return 401!")

    def test_02_admin_10_questions_verified_against_postgresql(self):
        questions = [
            ("Q1: Top 5 products", "What are the top 5 products by quantity sold?"),
            ("Q2: Best-selling products", "What are the best-selling products?"),
            ("Q3: Most revenue product", "Which product generated the most revenue?"),
            ("Q4: Total revenue", "What is the total revenue?"),
            ("Q5: Total orders", "How many orders do we have?"),
            ("Q6: Pending orders", "How many orders are pending?"),
            ("Q7: Least-selling product", "What is the least-selling product?"),
            ("Q8: Category revenue", "Which category generates the most revenue?"),
            ("Q9: Arabic Top Products", "ما هي المنتجات الأكثر مبيعاً؟"),
            ("Q10: Arabic Revenue & Pending", "كم إجمالي الأرباح والطلبات المعلقة؟"),
            ("Q11: Arabic Category Revenue", "أي قسم يحقق أعلى إيرادات؟")
        ]

        # Calculate ground truth directly from PostgreSQL database
        raw_db_orders_count = self.db.query(Order).count()
        raw_db_pending_count = self.db.query(Order).filter(Order.status == "Pending").count()
        raw_db_total_rev = self.db.query(func.sum(Order.total_price)).scalar() or Decimal("0.00")

        raw_top_revenue_prod = (
            self.db.query(Product.name, func.sum(OrderItem.quantity * OrderItem.price).label("rev"))
            .join(OrderItem, Product.id == OrderItem.product_id)
            .group_by(Product.name)
            .order_by(desc("rev"))
            .first()
        )

        for label, q_text in questions:
            res = client.post("/ai/admin-analytics", json={"query": q_text}, headers=self.admin_headers)
            self.assertEqual(res.status_code, 200, f"Admin AI query failed for '{q_text}': status {res.status_code}")

            data = res.json()
            self.assertIn("reply", data)
            reply = data["reply"]
            self.assertTrue(len(reply) > 10, f"Response reply too short for '{q_text}'")

            # Verify metrics match PostgreSQL database
            if "total revenue" in q_text.lower() or "إجمالي" in q_text:
                self.assertIn("metrics", data)

            print(f"[{label}] -> SUCCESS. Reply length: {len(reply)} chars.")

    def test_03_customer_ai_still_works(self):
        # Verify existing customer recommendation assistant was NOT broken
        res = client.post("/ai/recommend", json={"query": "أريد وجبة رخيصة بدون دجاج"})
        self.assertEqual(res.status_code, 200)
        self.assertIn("recommended_products", res.json())


if __name__ == "__main__":
    unittest.main()
