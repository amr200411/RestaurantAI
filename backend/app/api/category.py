from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.database import get_db
from app.schemas.category import CategoryCreate, CategoryResponse
from app.services.category_service import create_category, get_categories, delete_category
from app.api.deps import get_current_admin
from app.models.user import User

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return create_category(db, category)


@router.get("/", response_model=list[CategoryResponse])
def read_all(
    db: Session = Depends(get_db)
):
    return get_categories(db)


@router.delete("/{category_id}")
def delete(
    category_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    deleted = delete_category(db, category_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
