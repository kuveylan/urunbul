import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from loguru import logger

from app.core.database import AsyncSessionLocal
from app.services.tracker_service import TrackerService

scheduler = AsyncIOScheduler()


async def scheduled_tracking_job():
    """Periyodik arka plan pazar ve alarm takip görevi."""
    logger.info("⏰ Zamanlanmış arka plan takip görevi çalışıyor...")
    async with AsyncSessionLocal() as session:
        try:
            await TrackerService.run_tracking_cycle(session)
        except Exception as e:
            logger.error(f"Zamanlanmış takip görevinde hata: {e}")


def start_scheduler():
    """Scheduler'ı başlatır ve 15 dakikada bir çalışacak görevi kaydeder."""
    if not scheduler.running:
        scheduler.add_job(
            scheduled_tracking_job,
            "interval",
            minutes=15,
            id="market_tracker_job",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("🚀 APScheduler pazar takip servisi başarıyla başlatıldı (15 dk aralıkla).")


def shutdown_scheduler():
    """Scheduler'ı kapatır."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("🛑 APScheduler pazar takip servisi durduruldu.")
