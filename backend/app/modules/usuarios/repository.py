from typing import Optional
from sqlmodel import Session, select
from sqlalchemy import func
from app.core.repository import BaseRepository
from app.modules.usuarios.model import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Optional[Usuario]:
        statement = select(Usuario).where(
            func.lower(Usuario.username) == username.lower()
        )
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        statement = select(Usuario).where(
            func.lower(Usuario.email) == email.lower()
        )
        return self.session.exec(statement).first()