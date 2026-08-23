import unittest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.database import SessionLocal
from app.services import admin_tools

client = TestClient(app)


class TestGeminiAdminAITools(unittest.TestCase):

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

    def test_01_backend_database_tools_execution(self):
        """Verify all 8 database tools execute without errors directly on PostgreSQL."""
        sales_summary = admin_tools.get_sales_summary(self.db)
        self.assertIn("total_revenue", sales_summary)
        self.assertIn("total_orders", sales_summary)

        top_prods = admin_tools.get_top_products(self.db, limit=3)
        self.assertIn("top_by_quantity", top_prods)

        cat_perf = admin_tools.get_category_performance(self.db)
        self.assertIn("categories", cat_perf)

        order_stats = admin_tools.get_order_statistics(self.db)
        self.assertIn("status_breakdown", order_stats)

        cust_stats = admin_tools.get_customer_statistics(self.db)
        self.assertIn("total_customers", cust_stats)

        sales_period = admin_tools.get_sales_by_period(self.db, "this_month")
        self.assertIn("total_revenue", sales_period)

        low_prods = admin_tools.get_low_performing_products(self.db, limit=3)
        self.assertIn("lowest_selling_active", low_prods)

        prod_perf = admin_tools.get_product_performance(self.db, "burger")
        self.assertIn("product_name", prod_perf)

    def test_02_user_requested_10_strategic_questions(self):
        """Test the 10 specific strategic questions specified by the user."""
        user_questions = [
            "ما أكثر المنتجات مبيعًا؟",
            "حلل لي مبيعات هذا الشهر.",
            "ليش مبيعات البيتزا ضعيفة؟",
            "ما المنتج الذي تنصحني أركز عليه؟ ولماذا؟",
            "قارن مبيعات هذا الشهر بالشهر الماضي.",
            "أي تصنيف يحقق أعلى إيرادات؟",
            "ما المنتجات التي لا تحقق مبيعات جيدة؟",
            "إذا أردت زيادة الإيرادات، ماذا تقترح؟",
            "حلل أداء المطعم وأعطني 3 توصيات.",
            "ما أكثر منتج مبيعًا وهل يستحق أن أعمل عليه عرض؟"
        ]

        for i, q in enumerate(user_questions, 1):
            res = client.post("/ai/admin-analytics", json={"query": q}, headers=self.admin_headers)
            self.assertEqual(res.status_code, 200, f"Query #{i} failed with status {res.status_code}")
            data = res.json()
            self.assertIn("reply", data)
            self.assertTrue(len(data["reply"]) > 20, f"Query #{i} reply too short")
            print(f"Strategic Query #{i} -> PASSED")

    def test_03_security_and_role_protection(self):
        """Verify customer access returns 403 and unauthenticated returns 401."""
        res_cust = client.post("/ai/admin-analytics", json={"query": "Total revenue"}, headers=self.cust_headers)
        self.assertEqual(res_cust.status_code, 403)

        res_unauth = client.post("/ai/admin-analytics", json={"query": "Total revenue"})
        self.assertEqual(res_unauth.status_code, 401)

    def test_04_customer_ai_remains_unbroken(self):
        """Verify Customer AI Food Recommendation Assistant still functions."""
        res = client.post("/ai/recommend", json={"query": "أريد وجبة رخيصة بدون دجاج"})
        self.assertEqual(res.status_code, 200)
        self.assertIn("recommended_products", res.json())


if __name__ == "__main__":
    unittest.main()
