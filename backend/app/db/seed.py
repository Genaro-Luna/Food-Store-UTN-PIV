"""Datos iniciales. Versión de transición: en feature/backend-catalogo se
reescribe con 3 categorías y 8 productos con stock, y pasa a correr con
`python -m app.db.seed`."""

from app.core.legacy_uow import LegacyUnitOfWork
from app.core.security import hash_password
from app.modules.categoria.model import Categoria
from app.modules.producto.model import Producto
from app.modules.usuarios.models import Usuario


def seed_initial_data() -> None:
    with LegacyUnitOfWork() as uow:
        if not uow.usuarios.get_by_username("admin"):
            uow.usuarios.add(
                Usuario(
                    username="admin",
                    full_name="Administrador del Sistema",
                    email="admin@utn.edu.ar",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                )
            )
        if not uow.usuarios.get_by_username("juan"):
            uow.usuarios.add(
                Usuario(
                    username="juan",
                    full_name="Juan Pérez",
                    email="juan@utn.edu.ar",
                    hashed_password=hash_password("Juan1234!"),
                    role="user",
                )
            )
        if not uow.categorias.get_all():
            cat_hamburguesas = uow.categorias.add(
                Categoria(nombre="Hamburguesas", descripcion="Medallones caseros en pan de papa")
            )
            cat_acompanamientos = uow.categorias.add(
                Categoria(nombre="Acompañamientos", descripcion="Papas fritas, aros de cebolla y entradas")
            )
            uow.categorias.add(
                Categoria(nombre="Bebidas", descripcion="Gaseosas, aguas saborizadas y cervezas")
            )
            if not uow.productos.get_all():
                hamburguesa = uow.productos.add(
                    Producto(
                        nombre="Hamburguesa Clásica",
                        descripcion="Medallón de carne con queso cheddar",
                        precio_base=8500.0,
                        imagen_url=["https://ejemplo.com/hamburguesa.jpg"],
                    )
                )
                papas = uow.productos.add(
                    Producto(
                        nombre="Papas Fritas",
                        descripcion="Porción mediana crocante",
                        precio_base=3500.0,
                        imagen_url=["https://ejemplo.com/papas.jpg"],
                    )
                )
                uow.productos.asociar_categoria(hamburguesa.id, cat_hamburguesas.id)
                uow.productos.asociar_categoria(papas.id, cat_acompanamientos.id)


if __name__ == "__main__":
    seed_initial_data()
