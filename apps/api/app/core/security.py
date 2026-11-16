import ipaddress
import re
import urllib.parse
from typing import Optional
from fastapi import HTTPException


# İzinli resmi pazaryeri kök alan adları
ALLOWED_MARKETPLACE_DOMAINS = {
    "trendyol.com",
    "hepsiburada.com",
    "amazon.com.tr",
    "n11.com",
}

# RFC 5322 basitleştirilmiş güvenli e-posta regex
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)


def is_ip_address(hostname: str) -> bool:
    """Verilen hostname'in doğrudan bir IPv4 veya IPv6 olup olmadığını kontrol eder."""
    try:
        ipaddress.ip_address(hostname)
        return True
    except ValueError:
        return False


def is_private_or_reserved_ip(hostname: str) -> bool:
    """Verilen hostname özel/dahili IP ise True döner."""
    try:
        ip = ipaddress.ip_address(hostname)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        )
    except ValueError:
        return False


def validate_marketplace_url(url: str) -> str:
    """
    SSRF (Server-Side Request Forgery) Savunması:
    Dışarıdan iletilen ürün veya sayfa URL'sinin yalnızca izinli resmi Türk e-ticaret
    pazaryerlerine ait olduğunu ve iç ağlara sızamayacağını katı biçimde doğrular.
    """
    if not url or not isinstance(url, str):
        raise HTTPException(status_code=400, detail="Geçersiz URL formatı.")

    cleaned_url = url.strip()

    try:
        parsed = urllib.parse.urlparse(cleaned_url)
    except Exception:
        raise HTTPException(status_code=400, detail="URL ayrıştırılamadı.")

    # 1. Protokol kontrolü (Yalnızca HTTPS)
    if parsed.scheme.lower() != "https":
        raise HTTPException(
            status_code=400,
            detail="Güvenlik kuralı: Yalnızca güvenli HTTPS protokolü desteklenir.",
        )

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        raise HTTPException(status_code=400, detail="URL alan adı (hostname) bulunamadı.")

    # 2. Doğrudan IP veya loopback/özel ağ kontrolü
    if hostname in {"localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"} or is_private_or_reserved_ip(hostname):
        raise HTTPException(
            status_code=400,
            detail="Güvenlik kuralı: Yerel ve dahili ağ adreslerine erişim engellendi.",
        )

    # 3. İzinli pazaryeri beyaz liste (whitelist) kontrolü
    is_allowed = False
    for allowed_domain in ALLOWED_MARKETPLACE_DOMAINS:
        if hostname == allowed_domain or hostname.endswith("." + allowed_domain):
            is_allowed = True
            break

    if not is_allowed:
        raise HTTPException(
            status_code=400,
            detail=(
                "Güvenlik kuralı: Yalnızca resmi pazaryeri linkleri kabul edilir "
                "(Trendyol, Hepsiburada, Amazon TR, N11)."
            ),
        )

    return cleaned_url


def validate_email_format(email: Optional[str]) -> bool:
    """Verilen e-postanın geçerli bir e-posta formatına uyup uymadığını doğrular."""
    if not email or not isinstance(email, str):
        return False
    clean = email.strip()
    if len(clean) > 254:
        return False
    return bool(EMAIL_REGEX.match(clean))
