from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class ReviewItem(BaseModel):
    text: str
    stars: int = 5
    seller: Optional[str] = None
    date: Optional[str] = None
    sentiment: str = "POSITIVE"  # POSITIVE, NEGATIVE, NEUTRAL


class ReviewTopicMetric(BaseModel):
    topic: str
    percentage: float
    mention_count: int
    sentiment: str  # NEGATIVE, POSITIVE


class ReviewKeywordMetric(BaseModel):
    word: str
    count: int
    sentiment: str


class ReviewInsightsResponse(BaseModel):
    product_id: str
    title: str
    brand: Optional[str] = None
    rating: float = 0.0
    total_reviews_analyzed: int = 0
    satisfaction_score: float = 0.0
    top_complaint_topics: List[ReviewTopicMetric] = []
    top_praised_topics: List[ReviewTopicMetric] = []
    frequent_keywords: List[ReviewKeywordMetric] = []
    actionable_seller_advice: str
    sample_reviews: List[ReviewItem] = []
