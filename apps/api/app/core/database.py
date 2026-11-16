from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Engine oluşturulması
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

# Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    class_=AsyncSession,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection için veritabanı oturumu sağlayıcısı."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Tabloları veritabanında oluşturur ve gerekli sütun migrasyonlarını uygular."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        def check_and_add_columns(connection):
            from sqlalchemy import text
            try:
                res = connection.execute(text("PRAGMA table_info(price_alerts)")).fetchall()
                col_names = [r[1] for r in res]
                if "alert_type" not in col_names:
                    connection.execute(text("ALTER TABLE price_alerts ADD COLUMN alert_type VARCHAR(50) DEFAULT 'price_drop'"))
                if "target_seller" not in col_names:
                    connection.execute(text("ALTER TABLE price_alerts ADD COLUMN target_seller VARCHAR(255)"))
            except Exception:
                pass

        await conn.run_sync(check_and_add_columns)
