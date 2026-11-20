from fastapi import HTTPException, status
from app.modules.ingrediente.model import Ingrediente
from app.modules.ingrediente.schema import IngredienteCreate, IngredienteUpdate


class IngredienteService:
    def __init__(self, uow):
        self.uow = uow

    def crear(self, ingrediente_in: IngredienteCreate) -> Ingrediente:
        existente = self.uow.ingredientes.get_by_nombre(ingrediente_in.nombre)
        if existente:
            if existente.activo:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe un ingrediente con ese nombre",
                )
            
            existente.nombre = ingrediente_in.nombre
            existente.activo = True
            self.uow.session.add(existente)
            self.uow.session.flush()
            self.uow.session.refresh(existente)
            return existente

        nuevo = Ingrediente(nombre=ingrediente_in.nombre, activo=True)
        return self.uow.ingredientes.create(nuevo)

    def listar(self) -> list[Ingrediente]:
        return self.uow.ingredientes.get_activos()

    def obtener(self, ingrediente_id: int) -> Ingrediente:
        ingrediente = self.uow.ingredientes.get_activo_by_id(ingrediente_id)
        if not ingrediente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingrediente no encontrado",
            )
        return ingrediente

    def actualizar(
        self, ingrediente_id: int, ingrediente_in: IngredienteUpdate
    ) -> Ingrediente:
        db_ingrediente = self.obtener(ingrediente_id)
        ingrediente_data = ingrediente_in.model_dump(exclude_unset=True)

        if "nombre" in ingrediente_data and ingrediente_data["nombre"] is not None:
            existente = self.uow.ingredientes.get_by_nombre(ingrediente_data["nombre"])
            if existente and existente.id != ingrediente_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe otro ingrediente con ese nombre",
                )

        for key, value in ingrediente_data.items():
            setattr(db_ingrediente, key, value)

        self.uow.session.add(db_ingrediente)
        self.uow.session.flush()
        self.uow.session.refresh(db_ingrediente)
        return db_ingrediente

    def eliminar(self, ingrediente_id: int) -> None:
        db_ingrediente = self.obtener(ingrediente_id)
        self.uow.ingredientes.soft_delete(db_ingrediente)