from datetime import date, time, datetime
from pydantic import BaseModel


# --- User ---
class UserOut(BaseModel):
    id: int
    telegram_id: int
    username: str | None
    first_name: str | None
    last_name: str | None
    discount_percent: float

    class Config:
        from_attributes = True


# --- Car ---
class CarCreate(BaseModel):
    brand: str
    model: str
    year: int | None = None
    plate_number: str | None = None
    vin: str | None = None


class CarUpdate(BaseModel):
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    plate_number: str | None = None
    vin: str | None = None


class CarOut(BaseModel):
    id: int
    brand: str
    model: str
    year: int | None
    plate_number: str | None
    vin: str | None

    class Config:
        from_attributes = True


# --- Service Type ---
class ServiceTypeOut(BaseModel):
    id: int
    name: str
    duration_minutes: int
    base_price: float
    description: str | None

    class Config:
        from_attributes = True


# --- Time Slot ---
class TimeSlotOut(BaseModel):
    id: int
    date: date
    time: time
    is_available: bool

    class Config:
        from_attributes = True


class DaySlots(BaseModel):
    date: date
    slots: list[TimeSlotOut]
    available_count: int


# --- Appointment ---
class AppointmentCreate(BaseModel):
    car_id: int
    service_type_id: int
    slot_id: int
    notes: str | None = None


class AppointmentOut(BaseModel):
    id: int
    status: str
    notes: str | None
    created_at: datetime
    car: CarOut
    service_type: ServiceTypeOut
    slot: TimeSlotOut
    details: "VisitDetailOut | None" = None

    class Config:
        from_attributes = True


# --- Visit Detail ---
class VisitDetailOut(BaseModel):
    work_description: str | None
    parts_used: str | None
    final_price: float | None

    class Config:
        from_attributes = True


# --- Promotion ---
class PromotionOut(BaseModel):
    id: int
    title: str
    description: str | None
    discount_percent: float | None
    valid_from: date | None
    valid_until: date | None
    image_url: str | None

    class Config:
        from_attributes = True
