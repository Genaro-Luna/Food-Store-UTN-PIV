from typing import Generic, TypeVar, Type, Optional
from sqlmodel import SQLModel, Session, select

T = TypeVar("T", bound=SQLModel)

class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: Type[T]):
        self.session = session
        self.model = model

    def create(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def get_by_id(self, obj_id: int) -> Optional[T]:
        return self.session.get(self.model, obj_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def delete(self, obj: T) -> None:
        self.session.delete(obj)
        self.session.flush()