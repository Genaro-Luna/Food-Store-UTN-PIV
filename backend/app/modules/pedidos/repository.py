from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_con_items(self, pedido_id: int) -> Optional[Pedido]:
        statement = select(Pedido).where(Pedido.id == pedido_id).options(selectinload(Pedido.items))
        return self.session.exec(statement).first()

    def buscar(
        self,
        *,
        skip: int,
        limit: int,
        usuario_id: Optional[int] = None,
        estado: Optional[str] = None,
    ) -> tuple[int, list[Pedido]]:
        """Pedidos paginados, del más nuevo al más viejo. Devuelve (total, página)."""
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        statement = (
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(statement).all())

    def contar_por_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return {estado: cantidad for estado, cantidad in self.session.exec(statement).all()}

    def contar_creados_entre(self, desde: datetime, hasta: datetime) -> int:
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= desde, Pedido.created_at < hasta)
        )
        return self.session.exec(statement).one()

    def sumar_total(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(statement).one())
