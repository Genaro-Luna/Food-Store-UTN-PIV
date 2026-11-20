from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from app.modules.producto.model import ProductoCategoria

if TYPE_CHECKING:
    from app.modules.producto.model import Producto


class CategoriaBase(SQLModel):
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str = Field(default="")


class Categoria(CategoriaBase, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    activo: bool = Field(default=True)
    productos: list["Producto"] = Relationship(
        back_populates="categorias",
        link_model=ProductoCategoria,
    )