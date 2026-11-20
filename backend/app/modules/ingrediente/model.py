from typing import Optional
from sqlmodel import SQLModel, Field


class IngredienteBase(SQLModel):
    nombre: str = Field(min_length=1, max_length=100)


class Ingrediente(IngredienteBase, table=True):
    __tablename__ = "ingrediente"

    id: Optional[int] = Field(default=None, primary_key=True)
    activo: bool = Field(default=True)