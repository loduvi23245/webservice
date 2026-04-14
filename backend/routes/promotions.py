from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from database import get_db
from models import Promotion, User
from schemas import PromotionOut, UserOut
from auth import get_current_user

router = APIRouter(prefix="/api/promotions", tags=["promotions"])


@router.get("/", response_model=list[PromotionOut])
async def get_promotions(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    today = date.today()
    result = await db.execute(
        select(Promotion).where(
            Promotion.is_active == True,
            or_(Promotion.valid_until == None, Promotion.valid_until >= today),
        )
    )
    return result.scalars().all()


@router.get("/profile", response_model=UserOut)
async def get_profile(user: User = Depends(get_current_user)):
    return user
