import hashlib
import hmac
import json
from urllib.parse import parse_qs

from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User

BOT_TOKEN = "YOUR_BOT_TOKEN"


def validate_init_data(init_data: str) -> dict:
    """Validate Telegram Mini App initData using HMAC-SHA256."""
    parsed = parse_qs(init_data)
    check_hash = parsed.get("hash", [None])[0]
    if not check_hash:
        raise HTTPException(status_code=401, detail="Missing hash")

    data_pairs = []
    for key, values in parsed.items():
        if key != "hash":
            data_pairs.append(f"{key}={values[0]}")
    data_pairs.sort()
    data_check_string = "\n".join(data_pairs)

    secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if computed_hash != check_hash:
        raise HTTPException(status_code=401, detail="Invalid initData")

    user_data = parsed.get("user", [None])[0]
    if user_data:
        return json.loads(user_data)
    raise HTTPException(status_code=401, detail="No user data")


async def get_current_user(
    x_telegram_init_data: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate Telegram user from initData header."""
    user_data = validate_init_data(x_telegram_init_data)
    telegram_id = user_data["id"]

    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            telegram_id=telegram_id,
            username=user_data.get("username"),
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
