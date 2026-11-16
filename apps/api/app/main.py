from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from loguru import logger

from app.core.config import settings
from app.core.database import init_db
from app.core.scheduler import start_scheduler, shutdown_scheduler
from app.core.rate_limiter import RateLimitMiddleware
from app.api.v1.api import api_router


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Kapsamlı HTTP Güvenlik Başlıkları Middleware'i:
    Clickjacking, MIME sniffing, XSS ve HTTPS düşürme (downgrade) saldırılarına karşı korur.
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


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

# 1. HTTP Güvenlik Başlıkları
app.add_middleware(SecurityHeadersMiddleware)

# 2. IP Bazlı Kayan Pencere Hız Sınırlayıcı (Rate Limiter: Genel 60 req/dk, Scraper 15 req/dk)
app.add_middleware(RateLimitMiddleware)

# 3. CORS Middleware (Yalnızca Pinned Resmi Alan Adları ve Extension)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"^chrome-extension://.*",
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
