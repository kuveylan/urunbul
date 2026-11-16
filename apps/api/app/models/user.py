import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    avatar_url = Column(String(1024), nullable=True)
    provider = Column(String(50), nullable=False, default="google")  # "google" | "github" | "demo"
    provider_id = Column(String(255), nullable=True, index=True)
    
    # Günlük Kota Takibi (DDoS & Kazıma Koruması)
    daily_searches_count = Column(Integer, default=0, nullable=False)
    daily_keywords_count = Column(Integer, default=0, nullable=False)
    last_active_date = Column(
        String(20),
        default=lambda: datetime.date.today().isoformat(),
        nullable=False
    )
    
    is_active = Column(Boolean, default=True, nullable=False)
    is_pro = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False
    )

    def check_and_reset_daily_quotas(self) -> None:
        """Gün dönümünde sayaçları otomatik sıfırlar."""
        today_str = datetime.date.today().isoformat()
        if self.last_active_date != today_str:
            self.daily_searches_count = 0
            self.daily_keywords_count = 0
            self.last_active_date = today_str

    def can_search(self) -> bool:
        """Kullanıcının bugün arama yapma hakkı var mı?"""
        self.check_and_reset_daily_quotas()
        return self.is_pro or self.daily_searches_count < 200

    def can_analyze_keyword(self) -> bool:
        """Kullanıcının bugün kelime analizi yapma hakkı var mı?"""
        self.check_and_reset_daily_quotas()
        return self.is_pro or self.daily_keywords_count < 50
