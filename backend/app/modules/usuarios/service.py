from fastapi import HTTPException, status
from app.core.security import hash_password, verify_password, create_access_token
from app.modules.usuarios.model import Usuario, UserCreate, UserPublic, Token


class UsuarioService:
    def __init__(self, uow):
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        if self.uow.usuarios.get_by_username(data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El nombre de usuario ya está registrado",
            )
        if self.uow.usuarios.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado",
            )

        nuevo_usuario = Usuario(
            username=data.username,
            full_name=data.full_name,
            email=data.email,
            hashed_password=hash_password(data.password),
            role="user",
            disabled=False,
        )
        creado = self.uow.usuarios.create(nuevo_usuario)
        return UserPublic.model_validate(creado)

    def authenticate(self, username: str, password: str) -> Token:
        user = self.uow.usuarios.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if user.disabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cuenta de usuario desactivada",
            )

        access_token = create_access_token(
            data={"sub": user.username, "role": user.role}
        )
        return Token(access_token=access_token)

    def list_all(self) -> list[UserPublic]:
        usuarios = self.uow.usuarios.get_all()
        return [UserPublic.model_validate(u) for u in usuarios]

    def set_disabled(self, user_id: int, disabled: bool) -> UserPublic:
        user = self.uow.usuarios.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )
        user.disabled = disabled
        self.uow.session.add(user)
        self.uow.session.flush()
        self.uow.session.refresh(user)
        return UserPublic.model_validate(user)