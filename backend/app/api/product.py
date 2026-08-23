from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.db.database import get_db
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import (
    create_product,
    get_products,
    get_product,
    update_product,
    delete_product
)
from app.api.deps import get_current_admin
from app.models.user import User

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create(
    product: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return create_product(db, product)


@router.get("/", response_model=list[ProductResponse])
def read_all(
    category_id: Optional[UUID] = None,
    search: Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    return get_products(
        db,
        category_id=category_id,
        search=search,
        available_only=available_only
    )


@router.get("/{product_id}", response_model=ProductResponse)
def read_one(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update(
    product_id: UUID,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    updated = update_product(db, product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}")
def delete(
    product_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    product = delete_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
