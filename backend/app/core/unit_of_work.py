from typing import Callable, Self

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Unidad de trabajo: abre la sesión al entrar al with y, al salir,
    hace commit si no hubo excepción o rollback si la hubo. Siempre cierra.

    Cada módulo la extiende y expone sus repositorios en __enter__.
    """

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory):
        self.session_factory = session_factory

    def __enter__(self) -> Self:
        self.session: Session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
