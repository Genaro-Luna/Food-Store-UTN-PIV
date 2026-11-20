from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import create_db_and_tables
from app.db.seed import seed_initial_data
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categoria.router import router as categorias_router
from app.modules.producto.router import router as productos_router
from app.modules.ingrediente.router import router as ingredientes_router
from app.modules.pedidos.router import router as pedidos_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_initial_data()
    yield


app = FastAPI(title="API Gestión de Inventario y Pedidos", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios_router)
app.include_router(categorias_router)
app.include_router(productos_router)
app.include_router(ingredientes_router)
app.include_router(pedidos_router)