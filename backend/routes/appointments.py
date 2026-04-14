from datetime import date, time, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import User, Appointment, TimeSlot, ServiceType, Car
from schemas import AppointmentCreate, AppointmentOut, DaySlots, TimeSlotOut, ServiceTypeOut
from auth import get_current_user

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

WORK_START = 9   # 09:00
WORK_END = 18    # 18:00
SLOT_DURATION = 60  # minutes


async def ensure_slots_exist(db: AsyncSession, target_date: date):
    """Create time slots for a date if they don't exist yet."""
    result = await db.execute(
        select(TimeSlot).where(TimeSlot.date == target_date).limit(1)
    )
    if result.scalar_one_or_none():
        return

    for hour in range(WORK_START, WORK_END):
        slot = TimeSlot(date=target_date, time=time(hour, 0), is_available=True)
        db.add(slot)
    await db.commit()


@router.get("/services", response_model=list[ServiceTypeOut])
async def get_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ServiceType).where(ServiceType.is_active == True))
    return result.scalars().all()


@router.get("/slots", response_model=list[DaySlots])
async def get_weekly_slots(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Return available slots for the next 7 days."""
    today = date.today()
    days = []

    for i in range(7):
        target = today + timedelta(days=i)
        # Skip Sunday (6)
        if target.weekday() == 6:
            continue

        await ensure_slots_exist(db, target)

        result = await db.execute(
            select(TimeSlot).where(TimeSlot.date == target).order_by(TimeSlot.time)
        )
        slots = result.scalars().all()
        available = sum(1 for s in slots if s.is_available)

        days.append(DaySlots(
            date=target,
            slots=[TimeSlotOut.model_validate(s) for s in slots],
            available_count=available,
        ))

    return days


@router.post("/", response_model=AppointmentOut, status_code=201)
async def create_appointment(
    data: AppointmentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify car belongs to user
    result = await db.execute(select(Car).where(Car.id == data.car_id, Car.user_id == user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Car not found")

    # Verify service type exists
    result = await db.execute(select(ServiceType).where(ServiceType.id == data.service_type_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Service type not found")

    # Verify slot is available
    result = await db.execute(select(TimeSlot).where(TimeSlot.id == data.slot_id))
    slot = result.scalar_one_or_none()
    if not slot or not slot.is_available:
        raise HTTPException(status_code=400, detail="Slot is not available")

    # Mark slot as taken
    slot.is_available = False

    appointment = Appointment(
        user_id=user.id,
        car_id=data.car_id,
        service_type_id=data.service_type_id,
        slot_id=data.slot_id,
        notes=data.notes,
    )
    db.add(appointment)
    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == appointment.id)
        .options(
            selectinload(Appointment.car),
            selectinload(Appointment.service_type),
            selectinload(Appointment.slot),
            selectinload(Appointment.details),
        )
    )
    return result.scalar_one()


@router.delete("/{appointment_id}", status_code=204)
async def cancel_appointment(
    appointment_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == appointment_id, Appointment.user_id == user.id)
        .options(selectinload(Appointment.slot))
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Free up the slot
    if appointment.slot:
        appointment.slot.is_available = True

    appointment.status = "cancelled"
    await db.commit()
