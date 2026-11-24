from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class AutoDesactivacion(Exception):
    pass


class UsuarioService:
    """Gestión de usuarios por el admin: listar, activar y desactivar."""

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.listar()]

    def activar(self, user_id: int) -> UserPublic:
        return self._cambiar_estado(user_id, disabled=False)

    def desactivar(self, user_id: int, admin_id: int) -> UserPublic:
        if user_id == admin_id:
            raise AutoDesactivacion("Un administrador no puede desactivar su propia cuenta")
        return self._cambiar_estado(user_id, disabled=True)

    def _cambiar_estado(self, user_id: int, disabled: bool) -> UserPublic:
        # Idempotente: si el usuario ya está en ese estado, responde 200 igual.
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(user_id)
            if usuario is None:
                raise UsuarioNoEncontrado(f"Usuario {user_id} no encontrado")
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
