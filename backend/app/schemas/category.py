from pydantic import BaseModel
from uuid import UUID


class CategoryBase(BaseModel):
    name: str
    description: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class CategorySimple(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True
