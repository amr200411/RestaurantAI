from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.models import user, category, product, order, order_item
from app.api import auth, user as user_api, category as category_api, product as product_api, order as order_api, ai as ai_api

# Ensure all tables are created on database startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RestaurantAI System API",
    description="Smart Restaurant Management System with AI Assistant & Order Tracking",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers
app.include_router(auth.router)
app.include_router(user_api.router)
app.include_router(category_api.router)
app.include_router(product_api.router)
app.include_router(order_api.router)
app.include_router(ai_api.router)


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Restaurant AI API is Running 🚀",
        "docs_url": "/docs"
    }
