import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import create_jwt_token, decode_jwt_token
from app.models.user import User
from app.schemas.user import UserMeResponse, UserQuota, UserResponse

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://urunbul.me").rstrip("/")


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Aktif kullanıcının JWT token'ını başlık üzerinden doğrular."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bu işlem için oturum açmanız gerekmektedir.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ")[1].strip()
    payload = decode_jwt_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş oturum anahtarı.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı kimliği.",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı veya hesabı devre dışı bırakılmış.",
        )

    user.check_and_reset_daily_quotas()
    await db.commit()
    return user


async def get_optional_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User | None:
    """Oturum opsiyonel olan yerlerde kullanıcıyı döndürür; oturum yoksa None döner."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1].strip()
    payload = decode_jwt_token(token)
    if not payload or "sub" not in payload:
        return None

    try:
        user_id = int(payload["sub"])
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user and user.is_active:
            user.check_and_reset_daily_quotas()
            await db.commit()
            return user
    except Exception:
        pass

    return None


async def consume_search_quota(user: User, db: AsyncSession) -> None:
    """Günlük 200 arama kotasını denetler ve tüketir."""
    if not user.can_search():
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Bugünkü ücretsiz 200 arama kotanızı doldurdunuz. Kotanız gece 00:00'da sıfırlanacaktır.",
        )
    user.daily_searches_count += 1
    if db is not None:
        db.add(user)
        await db.commit()


async def consume_keyword_quota(user: User, db: AsyncSession) -> None:
    """Günlük 50 anahtar kelime analiz kotasını denetler ve tüketir."""
    if not user.can_analyze_keyword():
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Bugünkü ücretsiz 50 anahtar kelime analizi kotanızı doldurdunuz. Kotanız gece 00:00'da sıfırlanacaktır.",
        )
    user.daily_keywords_count += 1
    if db is not None:
        db.add(user)
        await db.commit()



def get_redirect_base(request: Request) -> str:
    """Backend'in çalıştığı tam alan adını türetir."""
    forwarded_proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    forwarded_host = request.headers.get("x-forwarded-host", request.url.netloc)
    return f"{forwarded_proto}://{forwarded_host}"


# =====================================================================
# GOOGLE OAUTH
# =====================================================================

@router.get("/google/login", summary="Google OAuth ile Giriş Başlat")
async def google_login(request: Request):
    if not GOOGLE_CLIENT_ID:
        # Eğer henüz Render'a Google Client ID girilmediyse kullanıcı dostu demo/yönlendirme mesajı
        return RedirectResponse(
            f"{FRONTEND_URL}/?auth_error=google_not_configured&mode=demo_fallback"
        )

    base = get_redirect_base(request)
    redirect_uri = f"{base}/api/v1/auth/google/callback"
    google_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&prompt=select_account"
    )
    return RedirectResponse(google_url)


@router.get("/google/callback", summary="Google OAuth Callback Yanıtı")
async def google_callback(
    request: Request,
    code: str = Query(None),
    error: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if error or not code:
        return RedirectResponse(f"{FRONTEND_URL}/?auth_error=google_cancelled")

    base = get_redirect_base(request)
    redirect_uri = f"{base}/api/v1/auth/google/callback"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_res = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": redirect_uri,
                },
            )
            token_data = token_res.json()
            access_token = token_data.get("access_token")
            if not access_token:
                return RedirectResponse(f"{FRONTEND_URL}/?auth_error=token_exchange_failed")

            user_res = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            profile = user_res.json()

        email = profile.get("email")
        if not email:
            return RedirectResponse(f"{FRONTEND_URL}/?auth_error=email_not_provided")

        provider_id = profile.get("sub")
        name = profile.get("name") or email.split("@")[0]
        avatar_url = profile.get("picture")

        # DB'de kullanıcıyı bul veya yeni oluştur
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                email=email,
                name=name,
                avatar_url=avatar_url,
                provider="google",
                provider_id=provider_id,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            user.name = name
            if avatar_url:
                user.avatar_url = avatar_url
            user.provider = "google"
            user.provider_id = provider_id
            await db.commit()

        jwt_token = create_jwt_token({"sub": str(user.id), "email": user.email, "name": user.name})
        return RedirectResponse(f"{FRONTEND_URL}/?token={jwt_token}")
    except Exception as e:
        return RedirectResponse(f"{FRONTEND_URL}/?auth_error=oauth_internal_error")


# =====================================================================
# GITHUB OAUTH
# =====================================================================

@router.get("/github/login", summary="GitHub OAuth ile Giriş Başlat")
async def github_login(request: Request):
    if not GITHUB_CLIENT_ID:
        return RedirectResponse(
            f"{FRONTEND_URL}/?auth_error=github_not_configured&mode=demo_fallback"
        )

    base = get_redirect_base(request)
    redirect_uri = f"{base}/api/v1/auth/github/callback"
    github_url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        "&scope=read:user%20user:email"
    )
    return RedirectResponse(github_url)


@router.get("/github/callback", summary="GitHub OAuth Callback Yanıtı")
async def github_callback(
    request: Request,
    code: str = Query(None),
    error: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if error or not code:
        return RedirectResponse(f"{FRONTEND_URL}/?auth_error=github_cancelled")

    base = get_redirect_base(request)
    redirect_uri = f"{base}/api/v1/auth/github/callback"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_res = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": GITHUB_CLIENT_ID,
                    "client_secret": GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
            )
            token_data = token_res.json()
            access_token = token_data.get("access_token")
            if not access_token:
                return RedirectResponse(f"{FRONTEND_URL}/?auth_error=token_exchange_failed")

            # Kullanıcı profilini al
            user_res = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                    "User-Agent": "Urunbul-OAuth",
                },
            )
            profile = user_res.json()

            # E-posta gizli olabileceği için /user/emails endpoint'ini sorgula
            email = profile.get("email")
            if not email:
                emails_res = await client.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json",
                        "User-Agent": "Urunbul-OAuth",
                    },
                )
                if emails_res.status_code == 200:
                    emails_data = emails_res.json()
                    for em in emails_data:
                        if em.get("primary") and em.get("verified"):
                            email = em.get("email")
                            break
                    if not email and len(emails_data) > 0:
                        email = emails_data[0].get("email")

        if not email:
            email = f"{profile.get('login', 'github_user')}@users.noreply.github.com"

        provider_id = str(profile.get("id"))
        name = profile.get("name") or profile.get("login") or email.split("@")[0]
        avatar_url = profile.get("avatar_url")

        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                email=email,
                name=name,
                avatar_url=avatar_url,
                provider="github",
                provider_id=provider_id,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            user.name = name
            if avatar_url:
                user.avatar_url = avatar_url
            user.provider = "github"
            user.provider_id = provider_id
            await db.commit()

        jwt_token = create_jwt_token({"sub": str(user.id), "email": user.email, "name": user.name})
        return RedirectResponse(f"{FRONTEND_URL}/?token={jwt_token}")
    except Exception:
        return RedirectResponse(f"{FRONTEND_URL}/?auth_error=oauth_internal_error")


# =====================================================================
# DEMO / TEST GİRİŞİ (OAuth Anahtarları Henüz Girilmemiş Ortamlar İçin)
# =====================================================================

@router.post("/demo", summary="Hızlı Demo / Test Oturumu Aç")
async def demo_login(db: AsyncSession = Depends(get_db)):
    """Geliştirme ve OAuth anahtarlarının henüz tanımlanmadığı ortamlarda anında test oturumu açar."""
    demo_email = "demo@urunbul.me"
    result = await db.execute(select(User).where(User.email == demo_email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=demo_email,
            name="Ulubey E-Ticaret Üyesi",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            provider="demo",
            provider_id="demo_user_1",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    user.check_and_reset_daily_quotas()
    await db.commit()

    jwt_token = create_jwt_token({"sub": str(user.id), "email": user.email, "name": user.name})
    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


# =====================================================================
# AKTİF KULLANICI & KOTA BİLGİSİ
# =====================================================================

@router.get("/me", response_model=UserMeResponse, summary="Giriş Yapan Kullanıcı Profil ve Kota Bilgisi")
async def get_me(current_user: User = Depends(get_current_user)):
    searches_remaining = max(0, 200 - current_user.daily_searches_count)
    keywords_remaining = max(0, 50 - current_user.daily_keywords_count)

    quota = UserQuota(
        daily_searches_limit=200,
        daily_searches_used=current_user.daily_searches_count,
        daily_searches_remaining=searches_remaining,
        daily_keywords_limit=50,
        daily_keywords_used=current_user.daily_keywords_count,
        daily_keywords_remaining=keywords_remaining,
    )

    return UserMeResponse(
        user=UserResponse.model_validate(current_user),
        quota=quota,
    )
