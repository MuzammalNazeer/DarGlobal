from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Property(BaseModel):
    id: str
    source: str = Field(..., description="'DarGlobal' or 'Wasalt'")
    title: str
    slug: Optional[str] = None
    project_name: Optional[str] = None
    location: str
    city: Optional[str] = None
    country: str
    property_type: str = Field("Apartment", description="Apartment, Villa, Penthouse, etc.")
    purpose: str = Field("Sale", description="Sale or Rent")
    price_formatted: str
    price_numeric: Optional[float] = None
    currency: str = "USD"
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    area_sqm: Optional[float] = None
    area_sqft: Optional[float] = None
    description: str
    features: List[str] = []
    designer_or_brand: Optional[str] = None  # e.g. Pagani, Lamborghini, Missoni, Aston Martin, Trump
    image_url: Optional[str] = None
    source_url: str
    completion_date: Optional[str] = None
    updated_at: Optional[str] = None

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    source_filter: Optional[str] = Field("ALL", description="'ALL', 'DarGlobal', or 'Wasalt'")
    api_key: Optional[str] = None  # Optional user-provided OpenRouter API key override
    model: Optional[str] = None

class PropertySourceCitation(BaseModel):
    id: str
    title: str
    source: str
    location: str
    price: str
    bedrooms: Optional[str] = None
    area: Optional[str] = None
    property_type: str
    image_url: Optional[str] = None
    source_url: str
    relevance_score: Optional[float] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[PropertySourceCitation] = []
    model_used: str
    grounded: bool = True

class ScrapeStatusResponse(BaseModel):
    total_properties: int
    darglobal_count: int
    wasalt_count: int
    last_scraped_at: Optional[str] = None
    is_scraping: bool = False
    status_message: str

class SearchRequest(BaseModel):
    query: str
    source: Optional[str] = "ALL"
    property_type: Optional[str] = None
    max_price: Optional[float] = None
    min_bedrooms: Optional[int] = None
    city: Optional[str] = None
    limit: int = 10
