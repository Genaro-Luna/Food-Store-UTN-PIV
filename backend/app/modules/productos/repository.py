from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_activo_by_id(self, producto_id: int) -> Optional[Producto]:
        statement = (
            select(Producto)
            .where(Producto.id == producto_id, Producto.activo == True)  # noqa: E712
            .options(selectinload(Producto.categoria))
        )
        return self.session.exec(statement).first()

    def get_by_nombre(self, nombre: str) -> Optional[Producto]:
        statement = select(Producto).where(func.lower(Producto.nombre) == nombre.lower())
        return self.session.exec(statement).first()

    def search(
        self,
        *,
        skip: int,
        limit: int,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[int, list[Producto]]:
        """Listado paginado de productos activos. Devuelve (total, página)."""
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        statement = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(statement).all())
