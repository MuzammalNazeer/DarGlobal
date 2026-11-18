export interface Property {
  id: string;
  source: 'DarGlobal' | 'Wasalt';
  title: string;
  slug?: string;
  project_name?: string;
  location: string;
  city?: string;
  country: string;
  property_type: string;
  purpose: string;
  price_formatted: string;
  price_numeric?: number;
  currency: string;
  bedrooms?: string;
  bathrooms?: string;
  area_sqm?: number;
  area_sqft?: number;
  description: string;
  features: string[];
  designer_or_brand?: string;
  image_url?: string;
  source_url: string;
  completion_date?: string;
  updated_at?: string;
}

export interface PropertyCitation {
  id: string;
  title: string;
  source: 'DarGlobal' | 'Wasalt';
  location: string;
  price: string;
  bedrooms?: string;
  area?: string;
  property_type: string;
  image_url?: string;
  source_url: string;
  relevance_score?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: PropertyCitation[];
  model_used?: string;
  timestamp: string;
}

export interface ScrapeStatus {
  total_properties: number;
  darglobal_count: number;
  wasalt_count: number;
  last_scraped_at?: string;
  is_scraping: boolean;
  status_message: string;
}

export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  database: {
    total_properties: number;
    darglobal_count: number;
    wasalt_count: number;
    use_chroma: boolean;
  };
  openrouter: {
    api_key_configured: boolean;
    default_model: string;
  };
}
