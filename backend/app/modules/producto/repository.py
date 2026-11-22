from typing import Optional
from sqlmodel import Session, select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from app.core.base_repository import BaseRepository
from app.modules.producto.model import Producto, ProductoCategoria


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_activos(self) -> list[Producto]:
        statement = (
            select(Producto)
            .where(Producto.activo == True)
            .options(selectinload(Producto.categorias))
        )
        return list(self.session.exec(statement).all())

    def get_activo_by_id(self, producto_id: int) -> Optional[Producto]:
        statement = (
            select(Producto)
            .where(Producto.id == producto_id, Producto.activo == True)
            .options(selectinload(Producto.categorias))
        )
        return self.session.exec(statement).first()

    def get_by_nombre(self, nombre: str) -> Optional[Producto]:
        statement = select(Producto).where(
            func.lower(Producto.nombre) == nombre.lower()
        )
        return self.session.exec(statement).first()

    def get_enlace_categoria(
        self, producto_id: int, categoria_id: int
    ) -> Optional[ProductoCategoria]:
        statement = select(ProductoCategoria).where(
            ProductoCategoria.producto_id == producto_id,
            ProductoCategoria.categoria_id == categoria_id,
        )
        return self.session.exec(statement).first()

    def asociar_categoria(
        self, producto_id: int, categoria_id: int
    ) -> ProductoCategoria:
        enlace = ProductoCategoria(
            producto_id=producto_id, categoria_id=categoria_id
        )
        self.session.add(enlace)
        self.session.flush()
        return enlace

    def soft_delete(self, producto: Producto) -> None:
        producto.activo = False
        self.session.add(producto)
        self.session.flush()