from datetime import datetime, timedelta
import random
from typing import Optional, List
from sqlalchemy import (
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    marketplace: Mapped[str] = mapped_column(String(50), default="trendyol", index=True)
    external_id: Mapped[str] = mapped_column(String(100), index=True)  # Trendyol contentId
    title: Mapped[str] = mapped_column(String(500), index=True)
    brand: Mapped[Optional[str]] = mapped_column(String(200), nullable=True, index=True)
    category_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True, index=True)
    category_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    url: Mapped[str] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Fiyat Bilgileri
    current_price: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    original_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="TRY")
    
    # Satıcı & Performans Göstergeleri
    seller_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    seller_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    favorite_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Analiz & Tahmin Verileri (Talep, Rekabet, Ekonomi & Fırsat)
    estimated_monthly_sales: Mapped[int] = mapped_column(Integer, default=0)
    estimated_monthly_revenue: Mapped[float] = mapped_column(Float, default=0.0)
    opportunity_score: Mapped[float] = mapped_column(Float, default=0.0)
    demand_score: Mapped[float] = mapped_column(Float, default=0.0)
    competition_score: Mapped[float] = mapped_column(Float, default=0.0)
    economics_score: Mapped[float] = mapped_column(Float, default=0.0)
    in_cart_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Sistem & Takip
    is_tracked: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # İlişkiler
    price_history: Mapped[List["PriceHistory"]] = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan", order_by="PriceHistory.timestamp", lazy="selectin")
    alerts: Mapped[List["PriceAlert"]] = relationship("PriceAlert", back_populates="product", cascade="all, delete-orphan", lazy="selectin")
    buybox_records: Mapped[List["BuyboxRecord"]] = relationship("BuyboxRecord", back_populates="product", cascade="all, delete-orphan", order_by="BuyboxRecord.timestamp", lazy="selectin")
    stock_records: Mapped[List["StockRecord"]] = relationship("StockRecord", back_populates="product", cascade="all, delete-orphan", order_by="StockRecord.timestamp", lazy="selectin")

    __table_args__ = (
        Index("ix_marketplace_external_id", "marketplace", "external_id", unique=True),
    )


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"), index=True)
    price: Mapped[float] = mapped_column(Float)
    seller_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    product: Mapped["Product"] = relationship("Product", back_populates="price_history")


class BuyboxRecord(Base):
    __tablename__ = "buybox_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"), index=True)
    seller_name: Mapped[str] = mapped_column(String(255))
    seller_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    price: Mapped[float] = mapped_column(Float)
    has_buybox: Mapped[bool] = mapped_column(Boolean, default=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    product: Mapped["Product"] = relationship("Product", back_populates="buybox_records")


class StockRecord(Base):
    __tablename__ = "stock_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"), index=True)
    estimated_stock: Mapped[int] = mapped_column(Integer, default=0)
    daily_sales_delta: Mapped[int] = mapped_column(Integer, default=0)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    product: Mapped["Product"] = relationship("Product", back_populates="stock_records")


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"), index=True)
    target_price: Mapped[float] = mapped_column(Float, default=0.0)
    alert_type: Mapped[str] = mapped_column(String(50), default="price_drop")  # "price_drop", "buybox_lost"
    target_seller: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    user_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_triggered: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product: Mapped["Product"] = relationship("Product", back_populates="alerts")


class ConsumerSearchSignal(Base):
    __tablename__ = "consumer_search_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    query: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    search_count: Mapped[int] = mapped_column(Integer, default=1)
    last_searched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
