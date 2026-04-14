from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import User, Appointment
from schemas import AppointmentOut
from auth import get_current_user

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("/", response_model=list[AppointmentOut])
async def get_history(
    car_id: int | None = Query(None, description="Filter by car ID"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Appointment)
        .where(Appointment.user_id == user.id)
        .options(
            selectinload(Appointment.car),
            selectinload(Appointment.service_type),
            selectinload(Appointment.slot),
            selectinload(Appointment.details),
        )
        .order_by(Appointment.created_at.desc())
    )

    if car_id is not None:
        query = query.where(Appointment.car_id == car_id)

    result = await db.execute(query)
    return result.scalars().all()
