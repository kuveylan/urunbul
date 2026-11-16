import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from loguru import logger


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Hafif Bellek-İçi Kayan Pencere (Sliding Window) Hız Sınırlayıcı Middleware.
    Harici Redis ihtiyacı olmadan Render ve bulut sunucuları üzerinde IP bazlı
    DoS, brute-force ve scraper suistimalini engeller.
    """

    def __init__(
        self,
        app,
        general_limit: int = 60,
        heavy_limit: int = 15,
        window_seconds: int = 60,
    ):
        super().__init__(app)
        self.general_limit = general_limit
        self.heavy_limit = heavy_limit
        self.window_seconds = window_seconds

        # IP -> [timestamp1, timestamp2, ...]
        self._general_requests: Dict[str, List[float]] = defaultdict(list)
        self._heavy_requests: Dict[str, List[float]] = defaultdict(list)
        self._last_cleanup = time.time()

        # Ağır scraper/arama endpoint'leri
        self.heavy_prefixes = (
            "/api/v1/products/search",
            "/api/v1/products/inspect",
            "/api/v1/compare",
            "/api/v1/keywords/cerebro",
            "/api/v1/keywords/analyze",
            "/api/v1/reviews/analyze",
        )

        # Muaf tutulan sistem endpoint'leri
        self.exempt_paths = {
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/favicon.ico",
        }

    def _get_client_ip(self, request: Request) -> str:
        """İstemcinin gerçek IP adresini Proxy ve Load Balancer başlıklarını gözeterek çözer."""
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            parts = [p.strip() for p in forwarded.split(",") if p.strip()]
            if parts:
                return parts[0]
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    def _cleanup_old_records(self, now: float) -> None:
        """Bellek sızıntısını önlemek için pencere dışındaki eski IP kayıtlarını periyodik temizler."""
        if now - self._last_cleanup < 120:
            return

        cutoff = now - self.window_seconds
        for records in (self._general_requests, self._heavy_requests):
            dead_ips = []
            for ip, timestamps in records.items():
                # Süresi geçmişleri at
                valid = [t for t in timestamps if t > cutoff]
                if valid:
                    records[ip] = valid
                else:
                    dead_ips.append(ip)
            for ip in dead_ips:
                records.pop(ip, None)

        self._last_cleanup = now

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        path = request.url.path

        # Muaf rotalar
        if path in self.exempt_paths:
            return await call_next(request)

        # OPTIONS istekleri (CORS preflight) sınırlanmaz
        if request.method == "OPTIONS":
            return await call_next(request)

        now = time.time()
        self._cleanup_old_records(now)

        client_ip = self._get_client_ip(request)
        cutoff = now - self.window_seconds

        # 1. Ağır Scraper / Canlı Arama Sınırı Kontrolü
        is_heavy = any(path.startswith(prefix) for prefix in self.heavy_prefixes)
        if is_heavy:
            timestamps = self._heavy_requests[client_ip]
            valid_heavy = [t for t in timestamps if t > cutoff]
            if len(valid_heavy) >= self.heavy_limit:
                retry_after = max(1, int(cutoff - valid_heavy[0] + self.window_seconds))
                logger.warning(
                    f"Rate limit aşıldı (Ağır Scraper Endpoint): IP={client_ip}, Path={path}"
                )
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": (
                            "Çok fazla canlı tarama/arama isteği gönderdiniz. "
                            f"Lütfen {retry_after} saniye sonra tekrar deneyin."
                        ),
                        "error_code": "RATE_LIMIT_EXCEEDED",
                    },
                    headers={"Retry-After": str(retry_after)},
                )
            valid_heavy.append(now)
            self._heavy_requests[client_ip] = valid_heavy

        # 2. Genel API Sınırı Kontrolü
        gen_timestamps = self._general_requests[client_ip]
        valid_general = [t for t in gen_timestamps if t > cutoff]
        if len(valid_general) >= self.general_limit:
            retry_after = max(1, int(cutoff - valid_general[0] + self.window_seconds))
            logger.warning(
                f"Rate limit aşıldı (Genel API): IP={client_ip}, Path={path}"
            )
            return JSONResponse(
                status_code=429,
                content={
                    "detail": (
                        "Dakikalık genel istek limitini aştınız. "
                        f"Lütfen {retry_after} saniye bekleyin."
                    ),
                    "error_code": "GENERAL_RATE_LIMIT_EXCEEDED",
                },
                headers={"Retry-After": str(retry_after)},
            )

        valid_general.append(now)
        self._general_requests[client_ip] = valid_general

        return await call_next(request)
