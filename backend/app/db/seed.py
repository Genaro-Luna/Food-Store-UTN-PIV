from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.model import Usuario
from app.modules.categoria.model import Categoria
from app.modules.producto.model import Producto
from app.modules.ingrediente.model import Ingrediente


def seed_initial_data() -> None:
    with UnitOfWork() as uow:
        if not uow.usuarios.get_by_username("admin"):
            uow.usuarios.create(
                Usuario(
                    username="admin",
                    full_name="Administrador del Sistema",
                    email="admin@utn.edu.ar",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                    disabled=False,
                )
            )
        if not uow.usuarios.get_by_username("juan"):
            uow.usuarios.create(
                Usuario(
                    username="juan",
                    full_name="Juan Pérez",
                    email="juan@utn.edu.ar",
                    hashed_password=hash_password("Juan1234!"),
                    role="user",
                    disabled=False,
                )
            )
        if not uow.categorias.get_all():
            cat_hamburguesas = uow.categorias.create(
                Categoria(
                    nombre="Hamburguesas",
                    descripcion="Medallones caseros en pan de papa",
                    activo=True,
                )
            )
            cat_acompanamientos = uow.categorias.create(
                Categoria(
                    nombre="Acompañamientos",
                    descripcion="Papas fritas, aros de cebolla y entradas",
                    activo=True,
                )
            )
            uow.categorias.create(
                Categoria(
                    nombre="Bebidas",
                    descripcion="Gaseosas, aguas saborizadas y cervezas",
                    activo=True,
                )
            )
            cat_acompanamientos = uow.categorias.create(
                Categoria(
                    nombre="Acompañamientos",
                    descripcion="Papas fritas, aros de cebolla y entradas",
                    activo=True,
                )
            )
            uow.categorias.create(
                Categoria(
                    nombre="Bebidas",
                    descripcion="Gaseosas, aguas saborizadas y cervezas",
                    activo=True,
                )
            )
        if not uow.productos.get_all():
            prod_hamburguesa = uow.productos.create(
                Producto(
                    nombre="Hamburguesa Clásica",
                    descripcion="Medallón de carne con queso cheddar",
                    precio_base=8500.0,
                    disponible=True,
                    imagen_url=["https://ejemplo.com/hamburguesa.jpg"],
                    activo=True,
                )
            )
            prod_papas = uow.productos.create(
                Producto(
                    nombre="Papas Fritas",
                    descripcion="Porción mediana crocante",
                    precio_base=3500.0,
                    disponible=True,
                    imagen_url=["https://ejemplo.com/papas.jpg"],
                    activo=True,
                )
            )
            if prod_hamburguesa.id and cat_hamburguesas.id:
                uow.productos.asociar_categoria(
                    prod_hamburguesa.id, cat_hamburguesas.id
                )
            if prod_papas.id and cat_acompanamientos.id:
                uow.productos.asociar_categoria(
                    prod_papas.id, cat_acompanamientos.id
                )
                
        if not uow.ingredientes.get_all():
            for nombre_ing in ["Queso Cheddar", "Panceta Ahumada", "Lechuga Criolla", "Pan de Papa"]:
                uow.ingredientes.create(
                    Ingrediente(nombre=nombre_ing, activo=True)
                )


if __name__ == "__main__":
    seed_initial_data()
