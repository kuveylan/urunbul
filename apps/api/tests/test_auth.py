import datetime
from app.core.security import create_jwt_token, decode_jwt_token
from app.models.user import User


def test_jwt_create_and_decode():
    payload = {"sub": "123", "email": "test@urunbul.me", "name": "Test User"}
    token = create_jwt_token(payload, expires_in=3600)
    assert token is not None
    assert len(token.split(".")) == 3

    decoded = decode_jwt_token(token)
    assert decoded is not None
    assert decoded["sub"] == "123"
    assert decoded["email"] == "test@urunbul.me"
    assert decoded["name"] == "Test User"
    assert "exp" in decoded


def test_jwt_tampered_fails():
    payload = {"sub": "123"}
    token = create_jwt_token(payload, expires_in=3600)
    parts = token.split(".")
    tampered = f"{parts[0]}.eyJob2d1bXMiOiAiZmFrZSJ9.{parts[2]}"
    assert decode_jwt_token(tampered) is None


def test_jwt_expired_fails():
    payload = {"sub": "123"}
    token = create_jwt_token(payload, expires_in=-10)
    assert decode_jwt_token(token) is None


def test_user_daily_quota_reset():
    user = User(
        email="test@urunbul.me",
        name="Test",
        provider="google",
        daily_searches_count=180,
        daily_keywords_count=45,
        last_active_date="2020-01-01",
    )
    user.check_and_reset_daily_quotas()
    assert user.daily_searches_count == 0
    assert user.daily_keywords_count == 0
    assert user.last_active_date == datetime.date.today().isoformat()


def test_user_can_search_limit():
    today_str = datetime.date.today().isoformat()
    user = User(
        email="searcher@urunbul.me",
        name="Searcher",
        provider="google",
        daily_searches_count=199,
        last_active_date=today_str,
        is_pro=False,
    )
    # 199 iken izin verilmeli
    assert user.can_search() is True

    # 200'e ulaştığında
    user.daily_searches_count = 200
    assert user.can_search() is False


def test_user_can_analyze_keyword_limit():
    today_str = datetime.date.today().isoformat()
    user = User(
        email="keyword@urunbul.me",
        name="Keyword User",
        provider="github",
        daily_keywords_count=49,
        last_active_date=today_str,
        is_pro=False,
    )
    # 49 iken izin verilmeli
    assert user.can_analyze_keyword() is True

    # 50'ye ulaştığında
    user.daily_keywords_count = 50
    assert user.can_analyze_keyword() is False


def test_user_pro_bypasses_quota():
    today_str = datetime.date.today().isoformat()
    user = User(
        email="pro@urunbul.me",
        name="Pro VIP User",
        provider="google",
        daily_searches_count=999,
        daily_keywords_count=999,
        last_active_date=today_str,
        is_pro=True,
    )
    assert user.can_search() is True
    assert user.can_analyze_keyword() is True
