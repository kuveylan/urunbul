import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import HTTPException

from app.main import app
from app.core.security import validate_marketplace_url, validate_email_format


def test_ssrf_allowed_marketplaces():
    """İzinli resmi pazaryeri URL'lerinin başarıyla doğrulandığını test eder."""
    allowed = [
        "https://www.trendyol.com/apple/iphone-15-p-7561829",
        "https://trendyol.com/sr?q=kahve",
        "https://www.hepsiburada.com/dyson-v15-p-HBCV000123",
        "https://hepsiburada.com/ara?q=kulaklik",
        "https://www.amazon.com.tr/dp/B08N5WRWNW",
        "https://amazon.com.tr/s?k=laptop",
        "https://www.n11.com/urun/xiaomi-redmi-12345",
        "https://n11.com/arama?q=telefon",
    ]
    for url in allowed:
        assert validate_marketplace_url(url) == url


def test_ssrf_blocked_attacks():
    """SSRF ve iç ağa sızma girişimlerinin 400 ile engellendiğini test eder."""
    attacks = [
        "http://localhost:8000/internal",
        "http://127.0.0.1:8000/secret",
        "http://0.0.0.0:8000",
        "http://169.254.169.254/latest/meta-data/",
        "https://169.254.169.254/latest/meta-data/",
        "http://10.0.0.1/admin",
        "http://192.168.1.1/router",
        "http://172.16.0.5/api",
        "http://metadata.google.internal/computeMetadata/v1/",
        "ftp://trendyol.com/malicious",
        "file:///etc/passwd",
        "https://evil-hacker.com/trendyol.com",
        "https://trendyol.com.fake-phishing.org/product",
    ]
    for url in attacks:
        with pytest.raises(HTTPException) as exc_info:
            validate_marketplace_url(url)
        assert exc_info.value.status_code == 400


def test_email_validation():
    """E-posta formatı doğrulayıcısını test eder."""
    valid_emails = [
        "user@example.com",
        "contact@urunbul.me",
        "test.user+alerts@domain.co.uk",
        "info@kuveylan.github.io",
    ]
    for email in valid_emails:
        assert validate_email_format(email) is True

    invalid_emails = [
        "not-an-email",
        "@missing-username.com",
        "missing-domain@",
        "spaces in@email.com",
        "",
        None,
    ]
    for email in invalid_emails:
        assert validate_email_format(email) is False


@pytest.mark.asyncio
async def test_security_headers_present():
    """HTTP yanıtlarında güvenlik başlıklarının eksiksiz yer aldığını test eder."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        headers = res.headers
        assert headers.get("x-content-type-options") == "nosniff"
        assert headers.get("x-frame-options") == "SAMEORIGIN"
        assert headers.get("x-xss-protection") == "1; mode=block"
        assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"
        assert "max-age=" in headers.get("strict-transport-security", "")


@pytest.mark.asyncio
async def test_rate_limiter_blocks_excessive_requests():
    """Kayan pencere hız sınırlayıcısının ağır uç noktalarda limit aşımında 429 döndürdüğünü test eder."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"x-forwarded-for": "198.51.100.99"}) as client:
        # Ağır endpoint limiti 15 istek. 16. istekte 429 alınmalı
        status_codes = []
        for _ in range(17):
            res = await client.get("/api/v1/products/inspect")
            status_codes.append(res.status_code)

        assert 429 in status_codes
        idx_429 = status_codes.index(429)
        assert idx_429 <= 16
