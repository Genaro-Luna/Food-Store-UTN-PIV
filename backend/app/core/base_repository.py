from typing import Generic, Optional, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones comunes sobre una tabla. Sin reglas de negocio ni commit:
    el commit lo hace el Unit of Work al salir del bloque with."""

    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, obj_id: int) -> Optional[T]:
        return self.session.get(self.model, obj_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, obj: T) -> T:
        """Inserta o actualiza: flush para obtener el id y refresh para leer los defaults."""
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: T) -> None:
        self.session.delete(obj)
        self.session.flush()
