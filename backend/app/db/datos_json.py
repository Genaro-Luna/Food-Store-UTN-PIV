"""Exporta e importa todos los datos de la base en un archivo JSON.

Desde la carpeta backend/:

    python -m app.db.datos_json exportar               # escribe datos/foodstore_datos.json
    python -m app.db.datos_json importar               # lo carga en una base vacía
    python -m app.db.datos_json importar --reemplazar  # borra los datos actuales y lo carga

El import conserva ids, fechas, contraseñas (hasheadas) y estados de los pedidos,
y se hace en una sola transacción: si algo falla, la base queda como estaba.
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.core.database import create_all_tables
from app.core.fechas import ahora_utc
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository

FORMATO = "food-store-datos"
VERSION = 1
ARCHIVO_POR_DEFECTO = Path("datos") / "foodstore_datos.json"

# Padres antes que hijos: orden de inserción. Para borrar se recorre al revés.
TABLAS = ["usuario", "categoria", "producto", "pedido", "detalle_pedido"]


class DatosUnitOfWork(UnitOfWork):
    def __enter__(self):
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)
        self.pedidos = PedidoRepository(self.session)
        self.detalles = BaseRepository(self.session, DetallePedido)
        return self


def _por_id(registros: list[Any]) -> list[Any]:
    return sorted(registros, key=lambda r: r.id)


def _fecha(valor: str) -> datetime:
    return datetime.fromisoformat(valor)


def exportar(ruta: Path) -> None:
    with DatosUnitOfWork() as uow:
        pedidos = _por_id(uow.pedidos.get_all())
        datos = {
            "formato": FORMATO,
            "version": VERSION,
            "exportado_en": ahora_utc().isoformat(),
            "usuarios": [u.model_dump(mode="json") for u in _por_id(uow.usuarios.get_all())],
            "categorias": [c.model_dump(mode="json") for c in _por_id(uow.categorias.get_all())],
            "productos": [p.model_dump(mode="json") for p in _por_id(uow.productos.get_all())],
            # Cada pedido lleva sus líneas anidadas (sin pedido_id, que es el del padre).
            "pedidos": [
                {
                    **p.model_dump(mode="json"),
                    "items": [d.model_dump(mode="json", exclude={"pedido_id"}) for d in p.items],
                }
                for p in pedidos
            ],
        }

    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Exportado en {ruta}: {_resumen(datos)}.")


def importar(ruta: Path, reemplazar: bool) -> None:
    if not ruta.is_file():
        sys.exit(f"No existe el archivo {ruta}. Ejecutá el comando desde la carpeta backend/.")
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    if datos.get("formato") != FORMATO:
        sys.exit(f"{ruta} no es un archivo de datos del Food Store.")

    create_all_tables()
    try:
        with DatosUnitOfWork() as uow:
            conexion = uow.session.connection()
            if reemplazar:
                for tabla in reversed(TABLAS):
                    conexion.execute(text(f"DELETE FROM {tabla}"))
            elif _hay_datos(uow):
                # SystemExit sale del with con rollback: no se toca nada.
                sys.exit(
                    "La base ya tiene datos (¿corriste el seed?). Usá una base vacía "
                    "o agregá --reemplazar para borrarlos y cargar el archivo."
                )

            for u in datos["usuarios"]:
                uow.usuarios.add(Usuario(**{**u, "created_at": _fecha(u["created_at"])}))
            for c in datos["categorias"]:
                uow.categorias.add(Categoria(**c))
            for p in datos["productos"]:
                uow.productos.add(Producto(**p))
            for p in datos["pedidos"]:
                campos = {k: v for k, v in p.items() if k != "items"}
                campos["created_at"] = _fecha(campos["created_at"])
                campos["updated_at"] = _fecha(campos["updated_at"])
                uow.pedidos.add(Pedido(**campos))
                for d in p["items"]:
                    uow.detalles.add(DetallePedido(**{**d, "pedido_id": p["id"]}))

            _actualizar_secuencias(uow)
    except IntegrityError as error:
        sys.exit(f"No se pudo importar: el archivo tiene datos inconsistentes.\n{error.orig}")

    print(f"Importado desde {ruta}: {_resumen(datos)}.")


def _hay_datos(uow: DatosUnitOfWork) -> bool:
    modelos = (Usuario, Categoria, Producto, Pedido)
    return any(uow.session.exec(select(m).limit(1)).first() is not None for m in modelos)


def _actualizar_secuencias(uow: DatosUnitOfWork) -> None:
    """PostgreSQL no avanza la secuencia de un id cuando se inserta con valor explícito.
    Sin esto, lo próximo que se cree desde la app chocaría con un id importado."""
    if uow.session.get_bind().dialect.name != "postgresql":
        return
    conexion = uow.session.connection()
    for tabla in TABLAS:
        conexion.execute(
            text(
                f"SELECT setval(pg_get_serial_sequence('{tabla}', 'id'), "
                f"COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM {tabla}"
            )
        )


def _resumen(datos: dict[str, Any]) -> str:
    return (
        f"{len(datos['usuarios'])} usuarios, {len(datos['categorias'])} categorías, "
        f"{len(datos['productos'])} productos y {len(datos['pedidos'])} pedidos"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="python -m app.db.datos_json",
        description="Exporta o importa los datos del Food Store en formato JSON.",
    )
    acciones = parser.add_subparsers(dest="accion", required=True)

    exp = acciones.add_parser("exportar", help="Guarda toda la base en un archivo JSON.")
    exp.add_argument("archivo", nargs="?", type=Path, default=ARCHIVO_POR_DEFECTO)

    imp = acciones.add_parser("importar", help="Carga un archivo JSON exportado.")
    imp.add_argument("archivo", nargs="?", type=Path, default=ARCHIVO_POR_DEFECTO)
    imp.add_argument(
        "--reemplazar",
        action="store_true",
        help="Borra los datos actuales antes de importar (por ejemplo, los del seed).",
    )

    args = parser.parse_args()
    if args.accion == "exportar":
        exportar(args.archivo)
    else:
        importar(args.archivo, args.reemplazar)


if __name__ == "__main__":
    main()
