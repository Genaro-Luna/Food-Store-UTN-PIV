from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"
    pedido_id: int = Field(foreign_key="pedido.id", primary_key=True)
    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    cantidad: int = Field(ge=1)
    precio_unitario: float

    pedido: Optional["Pedido"] = Relationship(back_populates="detalles")


class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    estado: str = Field(default="PENDIENTE")
    total: float = Field(default=0.0)
    activo: bool = Field(default=True)
    deleted_at: Optional[datetime] = Field(default=None)

    detalles: list[DetallePedido] = Relationship(back_populates="pedido")