from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate


def create_category(db: Session, category: CategoryCreate):
    existing = db.query(Category).filter(Category.name == category.name.strip()).first()
    if existing:
        return existing

    db_category = Category(
        name=category.name.strip(),
        description=category.description
    )

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category


def get_categories(db: Session):
    return db.query(Category).all()


def delete_category(db: Session, category_id):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return None
    db.delete(category)
    db.commit()
    return category
