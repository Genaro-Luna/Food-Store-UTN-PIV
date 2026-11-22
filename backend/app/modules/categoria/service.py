from fastapi import HTTPException, status
from app.modules.categoria.model import Categoria
from app.modules.categoria.schema import CategoriaCreate, CategoriaUpdate


class CategoriaService:
    def __init__(self, uow):
        self.uow = uow

    def crear(self, categoria_in: CategoriaCreate) -> Categoria:
        existente = self.uow.categorias.get_by_nombre(categoria_in.nombre)
        if existente:
            if existente.activo:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe una categoría con ese nombre",
                )
    
            existente.nombre = categoria_in.nombre
            existente.descripcion = categoria_in.descripcion
            existente.activo = True
            self.uow.session.add(existente)
            self.uow.session.flush()
            self.uow.session.refresh(existente)
            return existente

        nueva = Categoria(
            nombre=categoria_in.nombre,
            descripcion=categoria_in.descripcion,
            activo=True,
        )
        return self.uow.categorias.add(nueva)

    def listar(self) -> list[Categoria]:
        return self.uow.categorias.get_activas()

    def obtener(self, categoria_id: int) -> Categoria:
        categoria = self.uow.categorias.get_activa_by_id(categoria_id)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada",
            )
        return categoria

    def actualizar(self, categoria_id: int, categoria_in: CategoriaUpdate) -> Categoria:
        db_categoria = self.obtener(categoria_id)
        categoria_data = categoria_in.model_dump(exclude_unset=True)

        if "nombre" in categoria_data and categoria_data["nombre"] is not None:
            existente = self.uow.categorias.get_by_nombre(categoria_data["nombre"])
            if existente and existente.id != categoria_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe otra categoría con ese nombre",
                )

        for key, value in categoria_data.items():
            setattr(db_categoria, key, value)

        self.uow.session.add(db_categoria)
        self.uow.session.flush()
        self.uow.session.refresh(db_categoria)
        return db_categoria

    def eliminar(self, categoria_id: int) -> None:
        db_categoria = self.obtener(categoria_id)
        productos_activos = [p for p in db_categoria.productos if p.activo]
        if productos_activos:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar una categoría que tiene productos activos asociados",
            )
        self.uow.categorias.soft_delete(db_categoria)