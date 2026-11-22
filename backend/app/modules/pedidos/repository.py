from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.core.base_repository import BaseRepository
from app.modules.pedidos.model import Pedido, DetallePedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_activos(self) -> list[Pedido]:
        statement = (
            select(Pedido)
            .where(Pedido.deleted_at.is_(None), Pedido.activo == True)
            .options(selectinload(Pedido.detalles))
        )
        return list(self.session.exec(statement).all())

    def get_activo_by_id(self, pedido_id: int) -> Optional[Pedido]:
        statement = (
            select(Pedido)
            .where(
                Pedido.id == pedido_id,
                Pedido.deleted_at.is_(None),
                Pedido.activo == True,
            )
            .options(selectinload(Pedido.detalles))
        )
        return self.session.exec(statement).first()

    def soft_delete(self, pedido: Pedido) -> None:
        pedido.activo = False
        pedido.deleted_at = datetime.now(timezone.utc)
        self.session.add(pedido)
        self.session.flush()


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)