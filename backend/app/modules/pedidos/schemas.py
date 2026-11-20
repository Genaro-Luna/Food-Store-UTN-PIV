from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator

EstadoPedidoLiteral = Literal["PENDIENTE", "CONFIRMADO", "ENTREGADO", "CANCELADO"]


class DetallePedidoCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(BaseModel):
    detalles: list[DetallePedidoCreate] = Field(min_length=1)

    @field_validator("detalles")
    @classmethod
    def validar_productos_no_repetidos(
        cls, detalles: list[DetallePedidoCreate]
    ) -> list[DetallePedidoCreate]:
        ids = [item.producto_id for item in detalles]
        if len(ids) != len(set(ids)):
            raise ValueError(
                "No se puede repetir el mismo producto_id en dos detalles del mismo pedido"
            )
        return detalles


class PedidoUpdate(BaseModel):
    estado: EstadoPedidoLiteral


class DetallePedidoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    pedido_id: int
    producto_id: int
    cantidad: int
    precio_unitario: float


class PedidoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fecha: datetime
    estado: str
    total: float
    detalles: list[DetallePedidoRead] = []


class PedidoReadWithDetalles(PedidoRead):
    detalles: list[DetallePedidoRead] = []