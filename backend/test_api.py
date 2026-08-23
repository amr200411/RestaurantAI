import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestRestaurantAIBackend(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # 1. Register test customer
        res = client.post("/auth/register", json={
            "name": "Test Customer",
            "email": "testcust@example.com",
            "password": "password123",
            "role": "customer"
        })
        if res.status_code == 201:
            cls.cust_token = res.json()["access_token"]
            cls.cust_user = res.json()["user"]
        else:
            login_res = client.post("/auth/login", json={
                "email": "testcust@example.com",
                "password": "password123"
            })
            cls.cust_token = login_res.json()["access_token"]
            cls.cust_user = login_res.json()["user"]

        # 2. Login admin user
        admin_login = client.post("/auth/login", json={
            "email": "admin@restaurant.ai",
            "password": "admin123"
        })
        cls.admin_token = admin_login.json()["access_token"]
        cls.admin_user = admin_login.json()["user"]

    def test_01_root(self):
        res = client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "online")

    def test_02_auth_me(self):
        res = client.get("/auth/me", headers={"Authorization": f"Bearer {self.cust_token}"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["email"], "testcust@example.com")

    def test_03_get_categories(self):
        res = client.get("/categories/")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.json()), 1)

    def test_04_get_products(self):
        res = client.get("/products/")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.json()), 1)

    def test_05_search_products(self):
        res = client.get("/products/?search=burger")
        self.assertEqual(res.status_code, 200)

    def test_06_ai_recommendation(self):
        res = client.post("/ai/recommend", json={
            "query": "أريد وجبة رخيصة بدون دجاج"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("reply", data)
        self.assertIsInstance(data["recommended_products"], list)

    def test_07_order_flow_and_cascade_delete(self):
        # Fetch a product to order
        prods_res = client.get("/products/")
        prods = prods_res.json()
        self.assertTrue(len(prods) > 0)
        p1 = prods[0]

        # Create Order
        create_res = client.post("/orders/", json={
            "user_id": self.cust_user["id"],
            "items": [
                {"product_id": p1["id"], "quantity": 2}
            ]
        }, headers={"Authorization": f"Bearer {self.cust_token}"})

        self.assertEqual(create_res.status_code, 201)
        order_data = create_res.json()
        order_id = order_data["id"]
        expected_total = float(p1["price"]) * 2
        self.assertAlmostEqual(float(order_data["total_price"]), expected_total, places=2)
        self.assertEqual(len(order_data["items"]), 1)

        # Get My Orders
        my_orders_res = client.get("/orders/my-orders", headers={"Authorization": f"Bearer {self.cust_token}"})
        self.assertEqual(my_orders_res.status_code, 200)

        # Admin Update Order Status
        status_res = client.put(f"/orders/{order_id}/status", json={
            "status": "Preparing"
        }, headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.json()["status"], "Preparing")

        # Admin Delete Order (Tests CASCADE deletion)
        del_res = client.delete(f"/orders/{order_id}", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(del_res.status_code, 200)
        self.assertIn("deleted successfully", del_res.json()["message"])

        # Verify Order is deleted
        get_res = client.get(f"/orders/{order_id}", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(get_res.status_code, 404)


if __name__ == "__main__":
    unittest.main()
