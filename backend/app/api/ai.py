from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.services.ai_service import process_ai_recommendation, process_admin_ai_query
from app.schemas.product import ProductResponse
from app.api.deps import get_current_admin
from app.models.user import User


class AIQueryRequest(BaseModel):
    query: str


class AIQueryResponse(BaseModel):
    reply: str
    recommended_products: List[ProductResponse]


class AIAdminAnalyticsResponse(BaseModel):
    reply: str
    metrics: Dict[str, Any] = {}
    engine: Optional[str] = None


router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)


@router.post("/recommend", response_model=AIQueryResponse)
def get_ai_recommendations(
    payload: AIQueryRequest,
    db: Session = Depends(get_db)
):
    result = process_ai_recommendation(db, payload.query)
    return result


@router.post("/admin-analytics", response_model=AIAdminAnalyticsResponse)
def get_admin_ai_analytics(
    payload: AIQueryRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = process_admin_ai_query(db, payload.query)
    return result
