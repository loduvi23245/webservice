from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Car
from schemas import CarCreate, CarUpdate, CarOut
from auth import get_current_user

router = APIRouter(prefix="/api/cars", tags=["cars"])


@router.get("/", response_model=list[CarOut])
async def get_cars(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Car).where(Car.user_id == user.id))
    return result.scalars().all()


@router.post("/", response_model=CarOut, status_code=201)
async def create_car(
    data: CarCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    car = Car(user_id=user.id, **data.model_dump())
    db.add(car)
    await db.commit()
    await db.refresh(car)
    return car


@router.put("/{car_id}", response_model=CarOut)
async def update_car(
    car_id: int,
    data: CarUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Car).where(Car.id == car_id, Car.user_id == user.id)
    )
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(car, key, value)

    await db.commit()
    await db.refresh(car)
    return car


@router.delete("/{car_id}", status_code=204)
async def delete_car(
    car_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Car).where(Car.id == car_id, Car.user_id == user.id)
    )
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    await db.delete(car)
    await db.commit()
