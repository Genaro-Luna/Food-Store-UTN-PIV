from fastapi import HTTPException, status
from app.modules.producto.model import Producto
from app.modules.producto.schema import ProductoCreate, ProductoUpdate


class ProductoService:
    def __init__(self, uow):
        self.uow = uow

    def crear(self, producto_in: ProductoCreate) -> Producto:
        existente = self.uow.productos.get_by_nombre(producto_in.nombre)
        if existente:
            if existente.activo:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe un producto con ese nombre",
                )
            
            existente.nombre = producto_in.nombre
            existente.descripcion = producto_in.descripcion
            existente.precio_base = producto_in.precio_base
            existente.disponible = producto_in.disponible
            existente.imagen_url = producto_in.imagen_url
            existente.activo = True
            self.uow.session.add(existente)
            self.uow.session.flush()
            self.uow.session.refresh(existente)
            return existente

        db_producto = Producto.model_validate(producto_in)
        db_producto.activo = True
        return self.uow.productos.add(db_producto)

    def listar(self) -> list[Producto]:
        return self.uow.productos.get_activos()

    def obtener(self, producto_id: int) -> Producto:
        producto = self.uow.productos.get_activo_by_id(producto_id)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )
        return producto

    def actualizar(self, producto_id: int, producto_in: ProductoUpdate) -> Producto:
        db_producto = self.obtener(producto_id)
        producto_data = producto_in.model_dump(exclude_unset=True, exclude_none=True)

        if "nombre" in producto_data:
            existente = self.uow.productos.get_by_nombre(producto_data["nombre"])
            if existente and existente.id != producto_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe otro producto con ese nombre",
                )

        for key, value in producto_data.items():
            setattr(db_producto, key, value)

        self.uow.session.add(db_producto)
        self.uow.session.flush()
        self.uow.session.refresh(db_producto)
        return db_producto

    def eliminar(self, producto_id: int) -> None:
        db_producto = self.obtener(producto_id)
        self.uow.productos.soft_delete(db_producto)

    def vincular_categoria(self, producto_id: int, categoria_id: int) -> dict:
        self.obtener(producto_id)
        categoria = self.uow.categorias.get_activa_by_id(categoria_id)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada",
            )

        enlace_existente = self.uow.productos.get_enlace_categoria(
            producto_id, categoria_id
        )
        if enlace_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El producto ya está asociado a esta categoría",
            )

        self.uow.productos.asociar_categoria(producto_id, categoria_id)
        return {"mensaje": "Producto vinculado a la categoría exitosamente"}