from __future__ import annotations

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.nutrition_engine import NUTRITION_DISCLAIMER, generate_nutrition_plan

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])


class NutritionRequest(BaseModel):
    pregnancy_week: int = Field(..., ge=1, le=42)
    symptoms: list[str] = []
    hemoglobin: float | None = None
    bp: str | None = None
    weight: float | None = None
    dietary_preference: str = "rice-based"
    allergies: list[str] = []
    budget: Literal["low", "medium"] = "low"
    location: str = "Bangladesh"


@router.post("/plan")
def nutrition_plan(payload: NutritionRequest):
    return generate_nutrition_plan(payload.model_dump())


@router.get("/disclaimer")
def nutrition_disclaimer():
    return {"disclaimer": NUTRITION_DISCLAIMER}
