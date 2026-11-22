from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel

from app.core.fechas import ahora_utc


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    full_name: str = Field(max_length=100)
    email: str = Field(unique=True, index=True, max_length=120)
    hashed_password: str
    role: str = Field(default="user")  # "user" | "admin"
    disabled: bool = Field(default=False)  # baja lógica
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))
