from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from app.schemas.product import ProductResponse


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int


class OrderCreate(BaseModel):
    user_id: Optional[UUID] = None
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    price: Decimal
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID
    status: str
    total_price: Decimal
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str
