from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    # La baja lógica no libera el nombre: sigue siendo único entre activas e inactivas.
    nombre: str = Field(unique=True, index=True, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
