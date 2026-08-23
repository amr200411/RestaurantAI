from app.db.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.core.security import hash_password


def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Admin & Demo Customer if not existing
        admin = db.query(User).filter(User.email == "admin@restaurant.ai").first()
        if not admin:
            admin = User(
                name="System Admin",
                email="admin@restaurant.ai",
                password=hash_password("admin123"),
                role="admin"
            )
            db.add(admin)

        customer = db.query(User).filter(User.email == "customer@restaurant.ai").first()
        if not customer:
            customer = User(
                name="John Customer",
                email="customer@restaurant.ai",
                password=hash_password("customer123"),
                role="customer"
            )
            db.add(customer)

        db.commit()

        # 2. Create Categories
        categories_data = [
            {"name": "Burgers & Sandwiches", "description": "Juicy handcrafted burgers and gourmet sandwiches"},
            {"name": "Pizza & Pasta", "description": "Authentic wood-fired pizzas and fresh pastas"},
            {"name": "Appetizers & Soups", "description": "Delicious starters and comforting soups"},
            {"name": "Desserts", "description": "Sweet treats and traditional pastries"},
            {"name": "Beverages", "description": "Refreshing cold drinks and warm brews"}
        ]

        cat_map = {}
        for cdata in categories_data:
            cat = db.query(Category).filter(Category.name == cdata["name"]).first()
            if not cat:
                cat = Category(name=cdata["name"], description=cdata["description"])
                db.add(cat)
                db.commit()
                db.refresh(cat)
            cat_map[cdata["name"]] = cat

        # 3. Create Sample Products
        products_data = [
            {
                "name": "Classic Beef Burger",
                "description": "Double Angus beef patty with cheddar cheese, fresh lettuce, tomato, and special sauce",
                "price": 140.00,
                "category": "Burgers & Sandwiches",
                "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
                "is_available": True
            },
            {
                "name": "Crispy Chicken Deluxe Burger",
                "description": "Golden crispy fried chicken breast with coleslaw and spicy mayo",
                "price": 125.00,
                "category": "Burgers & Sandwiches",
                "image_url": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
                "is_available": True
            },
            {
                "name": "Margherita Gourmet Pizza",
                "description": "Traditional Italian pizza with San Marzano tomato sauce, fresh mozzarella, and basil",
                "price": 160.00,
                "category": "Pizza & Pasta",
                "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
                "is_available": True
            },
            {
                "name": "Vegetable Delight Pizza",
                "description": "Loaded with bell peppers, olives, mushrooms, onions, and melted mozzarella (100% Vegetarian)",
                "price": 135.00,
                "category": "Pizza & Pasta",
                "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
                "is_available": True
            },
            {
                "name": "Lentil Soup",
                "description": "Hearty traditional red lentil soup served with lemon wedge and toasted bread",
                "price": 60.00,
                "category": "Appetizers & Soups",
                "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
                "is_available": True
            },
            {
                "name": "Crispy Mozzarella Sticks",
                "description": "6 pieces of crunchy breaded mozzarella sticks served with marinara sauce",
                "price": 75.00,
                "category": "Appetizers & Soups",
                "image_url": "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=600&q=80",
                "is_available": True
            },
            {
                "name": "Chocolate Lava Cake",
                "description": "Warm chocolate cake with oozing molten chocolate core served with vanilla ice cream",
                "price": 85.00,
                "category": "Desserts",
                "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
                "is_available": True
            },
            {
                "name": "Fresh Lemon Mint Juice",
                "description": "Refreshing blended fresh lemon juice with green mint ice slush",
                "price": 40.00,
                "category": "Beverages",
                "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
                "is_available": True
            }
        ]

        for pdata in products_data:
            existing_prod = db.query(Product).filter(Product.name == pdata["name"]).first()
            if not existing_prod:
                cat = cat_map.get(pdata["category"])
                prod = Product(
                    name=pdata["name"],
                    description=pdata["description"],
                    price=pdata["price"],
                    category_id=cat.id if cat else None,
                    image_url=pdata["image_url"],
                    is_available=pdata["is_available"]
                )
                db.add(prod)

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
