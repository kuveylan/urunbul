import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.review_service import ReviewService
from app.schemas.review import ReviewItem


@pytest.mark.asyncio
async def test_ai_listing_generator_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "brand": "Arzum",
            "product_type": "Türk Kahvesi Makinesi",
            "category": "Küçük Ev Aletleri",
            "color_or_variant": "Krom Siyah",
            "keywords": ["közde", "bol köpüklü", "otomatik"],
            "key_features": ["5 Fincan Kapasiteli", "Taşma Önleyici Sensör"]
        }
        res = await client.post("/api/v1/optimizer/generate-ai-listing", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "generated_title" in data
        assert "Arzum" in data["generated_title"]
        assert len(data["bullet_points"]) == 5
        assert len(data["backend_search_terms"]) > 0
        assert data["predicted_seo_score"] >= 90


def test_review_service_aspect_classification():
    reviews = [
        ReviewItem(text="Kargolama berbattı, ürün kutusu ezik ve kırık geldi iade ediyorum", stars=1, sentiment="NEGATIVE"),
        ReviewItem(text="Plastik malzemesi çok kalitesiz ve soyuluyor, dayanaksız", stars=2, sentiment="NEGATIVE"),
        ReviewItem(text="Harika lezzetli ve köpüklü yapıyor, çok memnun kaldım tavsiye ederim", stars=5, sentiment="POSITIVE"),
    ]
    complaints = ReviewService._classify_complaints(reviews)
    assert len(complaints) > 0
    top_complaint = complaints[0]
    assert top_complaint.percentage > 0

    advice = ReviewService._generate_seller_advice(complaints, satisfaction=65.0, brand="TestRakip")
    assert "Pazar Fırsat Stratejisi" in advice
    assert "TestRakip" in advice
