from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.db.seed import seed_initial_data
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categoria.router import router as categorias_router
from app.modules.producto.router import router as productos_router
from app.modules.ingrediente.router import router as ingredientes_router
from app.modules.pedidos.router import router as pedidos_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    seed_initial_data()
    yield


app = FastAPI(title="Food Store API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(ingredientes_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)
