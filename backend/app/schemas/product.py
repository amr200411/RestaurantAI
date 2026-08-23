from pydantic import BaseModel
from uuid import UUID
from decimal import Decimal
from datetime import datetime

from app.schemas.category import CategorySimple


class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    image_url: str | None = None
    is_available: bool = True
    category_id: UUID | None = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None
    category: CategorySimple | None = None


    class Config:
        from_attributes = True


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    image_url: str | None = None
    is_available: bool | None = None
    category_id: UUID | None = None
