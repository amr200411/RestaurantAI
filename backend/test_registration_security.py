import unittest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.database import SessionLocal
from app.models.user import User

client = TestClient(app)


class TestRegistrationSecurity(unittest.TestCase):

    def setUp(self):
        self.db: Session = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_registration_security_rejects_admin_role_escalation(self):
        unique_id = uuid.uuid4().hex[:8]
        malicious_email = f"attacker_{unique_id}@example.com"
        malicious_payload = {
            "name": "Attacker Trying Admin Role",
            "email": malicious_email,
            "password": "Password123!",
            "role": "admin",  # Attempting privilege escalation
            "is_admin": True
        }

        # 1. Send raw POST payload with role="admin"
        res = client.post("/auth/register", json=malicious_payload)
        self.assertEqual(res.status_code, 201, "Registration should succeed but force role='customer'")

        data = res.json()
        returned_user = data["user"]
        returned_token = data["access_token"]

        # 2. Verify API response assigned role="customer"
        self.assertEqual(
            returned_user["role"],
            "customer",
            f"SECURITY FAILURE: User role in response was '{returned_user['role']}' instead of 'customer'!"
        )

        # 3. DIRECT POSTGRESQL DATABASE VERIFICATION
        db_user = self.db.query(User).filter(User.email == malicious_email).first()
        self.assertIsNotNone(db_user, "User record must exist in database")
        self.assertEqual(
            db_user.role,
            "customer",
            f"CRITICAL SECURITY FAILURE: User role in PostgreSQL was '{db_user.role}' instead of 'customer'!"
        )

        # 4. Attempt to access Admin-only endpoints using the attacker's token
        headers = {"Authorization": f"Bearer {returned_token}"}

        # Attempt to create product -> Must fail with 403 Forbidden
        prod_res = client.post("/products/", json={
            "name": "Unauthorized Dish",
            "price": 10.0
        }, headers=headers)
        self.assertEqual(
            prod_res.status_code,
            403,
            f"SECURITY FAILURE: Privilege escalation allowed product creation! Status: {prod_res.status_code}"
        )

        # Attempt to list all users -> Must fail with 403 Forbidden
        users_res = client.get("/users/", headers=headers)
        self.assertEqual(
            users_res.status_code,
            403,
            f"SECURITY FAILURE: Privilege escalation allowed listing users! Status: {users_res.status_code}"
        )

        print("\nSECURITY VERIFICATION PASSED: Role escalation payload 'role=admin' was overridden by backend to 'customer'!")


if __name__ == "__main__":
    unittest.main()
