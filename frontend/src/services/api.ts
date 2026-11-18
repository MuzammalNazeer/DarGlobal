import { Property, Message, ScrapeStatus, HealthStatus, PropertyCitation } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async sendChat(
    message: string,
    history: Message[],
    sourceFilter: string = 'ALL',
    apiKey?: string,
    model?: string
  ): Promise<{ answer: string; sources: PropertyCitation[]; model_used: string }> {
    const formattedHistory = history.map(h => ({
      role: h.role,
      content: h.content
    }));

    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: formattedHistory,
        source_filter: sourceFilter,
        api_key: apiKey || undefined,
        model: model || undefined
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(err.detail || 'Chat request failed');
    }

    return res.json();
  },

  async getProperties(
    source: string = 'ALL',
    city?: string,
    search?: string,
    limit: number = 50
  ): Promise<{ count: number; total: number; properties: Property[] }> {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (city) params.append('city', city);
    if (search) params.append('q', search);
    params.append('limit', limit.toString());

    const res = await fetch(`${API_BASE}/api/properties?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load properties');
    return res.json();
  },

  async getScrapeStatus(): Promise<ScrapeStatus> {
    const res = await fetch(`${API_BASE}/api/scrape/status`);
    if (!res.ok) throw new Error('Failed to fetch scrape status');
    return res.json();
  },

  async triggerScrape(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/api/scrape/run`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to trigger scraper');
    return res.json();
  }
};
