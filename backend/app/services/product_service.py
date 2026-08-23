from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from uuid import UUID

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, product: ProductCreate):
    db_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        image_url=product.image_url,
        is_available=product.is_available,
        category_id=product.category_id
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product


def get_products(
    db: Session,
    category_id: Optional[UUID] = None,
    search: Optional[str] = None,
    available_only: bool = False
):
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if available_only:
        query = query.filter(Product.is_available == True)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern)
            )
        )

    return query.order_by(Product.created_at.desc()).all()


def get_product(db: Session, product_id: UUID):
    return db.query(Product).filter(Product.id == product_id).first()


def update_product(db: Session, product_id: UUID, product_data: ProductUpdate):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        return None

    update_dict = product_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product


def delete_product(db: Session, product_id: UUID):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        return None

    db.delete(product)
    db.commit()

    return product