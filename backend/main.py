from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from database import init_db, async_session
from models import ServiceType, Promotion
from routes import cars, appointments, history, promotions


async def seed_data():
    """Populate initial service types and promotions."""
    async with async_session() as db:
        # Seed service types if empty
        result = await db.execute(select(ServiceType).limit(1))
        if not result.scalar_one_or_none():
            services = [
                ServiceType(name="Замена масла", duration_minutes=30, base_price=2500, description="Замена моторного масла и масляного фильтра"),
                ServiceType(name="Диагностика", duration_minutes=60, base_price=1500, description="Полная компьютерная диагностика автомобиля"),
                ServiceType(name="Тормозная система", duration_minutes=90, base_price=4000, description="Проверка и замена тормозных колодок/дисков"),
                ServiceType(name="Шиномонтаж", duration_minutes=40, base_price=2000, description="Сезонная замена шин, балансировка"),
                ServiceType(name="ТО плановое", duration_minutes=120, base_price=5000, description="Плановое техобслуживание по регламенту"),
                ServiceType(name="Ходовая часть", duration_minutes=90, base_price=3500, description="Диагностика и ремонт подвески"),
                ServiceType(name="Кондиционер", duration_minutes=60, base_price=3000, description="Заправка и обслуживание кондиционера"),
                ServiceType(name="Электрика", duration_minutes=60, base_price=2500, description="Диагностика и ремонт электрооборудования"),
            ]
            db.add_all(services)

        # Seed promotions if empty
        result = await db.execute(select(Promotion).limit(1))
        if not result.scalar_one_or_none():
            promos = [
                Promotion(
                    title="Скидка 20% на диагностику",
                    description="При первом посещении — полная компьютерная диагностика со скидкой 20%!",
                    discount_percent=20,
                    valid_from=None,
                    valid_until=None,
                    is_active=True,
                ),
                Promotion(
                    title="Комплекс «Весна»",
                    description="Замена масла + проверка ходовой + диагностика кондиционера по специальной цене 6000₽ вместо 7000₽",
                    discount_percent=15,
                    valid_from=None,
                    valid_until=None,
                    is_active=True,
                ),
                Promotion(
                    title="Приведи друга",
                    description="Получи скидку 10% на следующий визит, если друг запишется по твоей рекомендации",
                    discount_percent=10,
                    valid_from=None,
                    valid_until=None,
                    is_active=True,
                ),
            ]
            db.add_all(promos)

        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_data()
    yield


app = FastAPI(title="AutoService Mini App API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cars.router)
app.include_router(appointments.router)
app.include_router(history.router)
app.include_router(promotions.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
