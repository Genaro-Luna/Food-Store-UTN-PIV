from typing import Optional
from sqlmodel import Session, select
from sqlalchemy import func
from app.core.repository import BaseRepository
from app.modules.ingrediente.model import Ingrediente


class IngredienteRepository(BaseRepository[Ingrediente]):
    def __init__(self, session: Session):
        super().__init__(session, Ingrediente)

    def get_activos(self) -> list[Ingrediente]:
        statement = select(Ingrediente).where(Ingrediente.activo == True)
        return list(self.session.exec(statement).all())

    def get_activo_by_id(self, ingrediente_id: int) -> Optional[Ingrediente]:
        statement = select(Ingrediente).where(
            Ingrediente.id == ingrediente_id,
            Ingrediente.activo == True,
        )
        return self.session.exec(statement).first()

    def get_by_nombre(self, nombre: str) -> Optional[Ingrediente]:
        statement = select(Ingrediente).where(
            func.lower(Ingrediente.nombre) == nombre.lower()
        )
        return self.session.exec(statement).first()

    def soft_delete(self, ingrediente: Ingrediente) -> None:
        ingrediente.activo = False
        self.session.add(ingrediente)
        self.session.flush()