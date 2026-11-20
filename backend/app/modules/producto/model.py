from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON

if TYPE_CHECKING:
    from app.modules.categoria.model import Categoria


class ProductoCategoria(SQLModel, table=True):
    __tablename__ = "producto_categoria"
    producto_id: Optional[int] = Field(
        default=None, foreign_key="producto.id", primary_key=True
    )
    categoria_id: Optional[int] = Field(
        default=None, foreign_key="categoria.id", primary_key=True
    )


class ProductoBase(SQLModel):
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str = Field(default="")
    precio_base: float = Field(ge=0)
    disponible: bool = Field(default=True)
    imagen_url: List[str] = Field(default=[], sa_column=Column(JSON))


class Producto(ProductoBase, table=True):
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    activo: bool = Field(default=True)
    categorias: list["Categoria"] = Relationship(
        back_populates="productos",
        link_model=ProductoCategoria,
    )