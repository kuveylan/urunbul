import os
import sys
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[4]
PACKAGES_DIR = (ROOT_DIR / "packages").resolve().as_posix()
if PACKAGES_DIR not in sys.path:
    sys.path.insert(0, PACKAGES_DIR)

DEFAULT_DB_FILE = (ROOT_DIR / "urunbul.db").resolve().as_posix()


class Settings(BaseSettings):
    PROJECT_NAME: str = "ÜrünBul API"
    VERSION: str = "0.2.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origin listesi
    ALLOWED_ORIGINS: List[str] = [
        "https://urunbul.me",
        "https://www.urunbul.me",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Veritabanı (Mutlak yol ile tekil SQLite konfigürasyonu)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DEFAULT_DB_FILE}")
    
    # Trendyol İstek Başlıkları (Gerçek kullanıcı taklidi için)
    USER_AGENT: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")


settings = Settings()
