from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.database import init_db
from app.core.scheduler import start_scheduler, shutdown_scheduler
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Başlangıç: Tabloları oluştur ve periyodik takip motorunu başlat
    logger.info("Veritabanı başlatılıyor...")
    await init_db()
    logger.info("ÜrünBul API veritabanı hazırlandı.")
    
    start_scheduler()
    logger.info("ÜrünBul API ve Otomatik Takip Motoru başarıyla hazırlandı.")
    yield
    logger.info("ÜrünBul API kapatılıyor...")
    shutdown_scheduler()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Türkiye Pazaryerleri için yeni nesil E-Ticaret Pazar Zekası, Satıcı Analitiği ve "
        "Akıllı Fiyat Karşılaştırma API Platformu."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware (Next.js frontend, urunbul.me, GitHub Pages ve Extension erişimi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*(\.github\.io|\.urunbul\.me)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ana API Router'ı bağla
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Sistem"])
async def health_check():
    """Sistem sağlık kontrolü endpoint'i."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }
