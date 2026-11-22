from typing import Optional
from sqlmodel import Session, select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from app.core.base_repository import BaseRepository
from app.modules.categoria.model import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_activas(self) -> list[Categoria]:
        statement = select(Categoria).where(Categoria.activo == True)
        return list(self.session.exec(statement).all())

    def get_activa_by_id(self, categoria_id: int) -> Optional[Categoria]:
        statement = (
            select(Categoria)
            .where(Categoria.id == categoria_id, Categoria.activo == True)
            .options(selectinload(Categoria.productos))
        )
        return self.session.exec(statement).first()

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        statement = select(Categoria).where(
            func.lower(Categoria.nombre) == nombre.lower()
        )
        return self.session.exec(statement).first()

    def soft_delete(self, categoria: Categoria) -> None:
        categoria.activo = False
        self.session.add(categoria)
        self.session.flush()