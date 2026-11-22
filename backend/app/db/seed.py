"""Datos iniciales del Food Store. Idempotente: se puede correr varias veces
sin duplicar nada (busca cada registro por nombre antes de crearlo).

Uso, desde la carpeta backend/:  python -m app.db.seed
"""

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401  (registra las relaciones)
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository

USUARIOS = [
    # username, nombre completo, email, contraseña, rol
    ("admin", "Administrador del Sistema", "admin@foodstore.com", "Admin1234!", "admin"),
    ("juan", "Juan Pérez", "juan@foodstore.com", "Juan1234!", "user"),
]

CATEGORIAS = [
    ("Hamburguesas", "Medallones caseros en pan de papa"),
    ("Acompañamientos", "Papas fritas, aros de cebolla y entradas"),
    ("Bebidas", "Gaseosas, aguas saborizadas y limonadas"),
]

PRODUCTOS = [
    # categoría, nombre, descripción, precio, stock
    ("Hamburguesas", "Hamburguesa Clásica", "Medallón de carne, cheddar, lechuga y tomate", 8500.0, 20),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble medallón, doble cheddar y panceta", 11200.0, 15),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de garbanzos con vegetales grillados", 9800.0, 10),
    ("Acompañamientos", "Papas Fritas", "Porción mediana, crocantes", 3500.0, 30),
    ("Acompañamientos", "Aros de Cebolla", "Rebozados en cerveza, con salsa barbacoa", 4200.0, 25),
    ("Acompañamientos", "Nuggets de Pollo", "Seis unidades con salsa a elección", 5200.0, 18),
    ("Bebidas", "Gaseosa 500 ml", "Línea Coca-Cola, bien fría", 2200.0, 40),
    ("Bebidas", "Limonada Casera", "Con menta y jengibre (stock bajo para probar RN-01)", 2800.0, 3),
]


class SeedUnitOfWork(UnitOfWork):
    def __enter__(self):
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self


def _imagen(nombre: str) -> str:
    return f"https://placehold.co/600x400?text={nombre.replace(' ', '+')}"


def seed_initial_data() -> None:
    create_all_tables()  # el seed se corre antes que uvicorn: las tablas pueden no existir
    with SeedUnitOfWork() as uow:
        for username, full_name, email, password, role in USUARIOS:
            if uow.usuarios.get_by_username(username) is None:
                uow.usuarios.add(
                    Usuario(
                        username=username,
                        full_name=full_name,
                        email=email,
                        hashed_password=hash_password(password),
                        role=role,
                    )
                )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = uow.categorias.get_by_nombre(nombre)
            if categoria is None:
                categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))
            categorias[nombre] = categoria

        for nombre_categoria, nombre, descripcion, precio, stock in PRODUCTOS:
            if uow.productos.get_by_nombre(nombre) is None:
                uow.productos.add(
                    Producto(
                        categoria_id=categorias[nombre_categoria].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=_imagen(nombre),
                        stock=stock,
                    )
                )
    print("Seed completo: admin, juan, 3 categorías y 8 productos.")


if __name__ == "__main__":
    seed_initial_data()
