from datetime import date, time, datetime
from sqlalchemy import (
    Column, Integer, BigInteger, String, Float, Boolean,
    Date, Time, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False, index=True)
    username = Column(String(100))
    first_name = Column(String(100))
    last_name = Column(String(100))
    discount_percent = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    cars = relationship("Car", back_populates="owner", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="user")


class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    brand = Column(String(50), nullable=False)
    model = Column(String(50), nullable=False)
    year = Column(Integer)
    plate_number = Column(String(20))
    vin = Column(String(17))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="cars")
    appointments = relationship("Appointment", back_populates="car")


class ServiceType(Base):
    __tablename__ = "service_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    duration_minutes = Column(Integer, default=60)
    base_price = Column(Float, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

    appointments = relationship("Appointment", back_populates="service_type")


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    is_available = Column(Boolean, default=True)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False)
    service_type_id = Column(Integer, ForeignKey("service_types.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("time_slots.id"), nullable=False)
    status = Column(String(20), default="booked")  # booked, confirmed, completed, cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="appointments")
    car = relationship("Car", back_populates="appointments")
    service_type = relationship("ServiceType", back_populates="appointments")
    slot = relationship("TimeSlot")
    details = relationship("VisitDetail", back_populates="appointment", uselist=False)


class VisitDetail(Base):
    __tablename__ = "visit_details"

    id = Column(Integer, primary_key=True, autoincrement=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False, unique=True)
    work_description = Column(Text)
    parts_used = Column(Text)
    final_price = Column(Float)

    appointment = relationship("Appointment", back_populates="details")


class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    discount_percent = Column(Float)
    valid_from = Column(Date)
    valid_until = Column(Date)
    is_active = Column(Boolean, default=True)
    image_url = Column(String(500))
