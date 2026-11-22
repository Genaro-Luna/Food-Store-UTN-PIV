from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def listar_activas(self) -> list[Categoria]:
        statement = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        return list(self.session.exec(statement).all())

    def get_activa_by_id(self, categoria_id: int) -> Optional[Categoria]:
        categoria = self.session.get(Categoria, categoria_id)
        return categoria if categoria is not None and categoria.activo else None

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca sin distinguir mayúsculas, incluidas las dadas de baja."""
        statement = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        return self.session.exec(statement).first()
