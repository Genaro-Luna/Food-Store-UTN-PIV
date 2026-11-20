from typing import Optional
from pydantic import EmailStr, field_validator
from sqlmodel import SQLModel, Field


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=100)
    email: str = Field(unique=True, index=True, max_length=120)
    hashed_password: str
    role: str = Field(default="user")
    disabled: bool = Field(default=False)


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username", "full_name")
    @classmethod
    def validar_no_vacios(cls, v: str) -> str:
        limpio = v.strip()
        if not limpio:
            raise ValueError("El campo no puede estar vacío")
        return limpio

    @field_validator("password")
    @classmethod
    def validar_longitud_bytes_bcrypt(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes en UTF-8")
        return v


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"