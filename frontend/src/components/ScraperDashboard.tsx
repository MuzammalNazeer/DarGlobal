import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle, Globe, Shield, ExternalLink, Cpu } from 'lucide-react';
import { ScrapeStatus } from '../types';

interface ScraperDashboardProps {
  status: ScrapeStatus | null;
  onTriggerScrape: () => Promise<void>;
  onRefreshStatus: () => Promise<void>;
}

export const ScraperDashboard: React.FC<ScraperDashboardProps> = ({
  status,
  onTriggerScrape,
  onRefreshStatus
}) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleRun = async () => {
    setIsTriggering(true);
    setActionMessage(null);
    try {
      await onTriggerScrape();
      setActionMessage("Scraping task initiated successfully. Live ingestion running...");
    } catch (err: any) {
      setActionMessage(`Error: ${err.message || 'Scrape failed'}`);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-dargold-400">
            <Cpu className="w-4 h-4" />
            <span>Automated Ingestion Engine</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">
            Web Scraping & Vector Index Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Extracts, structures, and vectorizes real estate intelligence from DarGlobal and Wasalt.
          </p>
        </div>

        {/* Trigger Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefreshStatus}
            className="p-2.5 rounded-xl bg-navy-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRun}
            disabled={isTriggering || status?.is_scraping}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-dargold-400 text-navy-950 font-bold hover:bg-dargold-300 disabled:opacity-50 transition-all shadow-md shadow-dargold-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${isTriggering || status?.is_scraping ? 'animate-spin' : ''}`} />
            <span>{status?.is_scraping ? 'Scraping in Progress...' : 'Run Live Scraper Now'}</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-dargold-400/10 border border-dargold-400/30 text-dargold-300 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Properties */}
        <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Properties</span>
            <Database className="w-4 h-4 text-dargold-400" />
          </div>
          <p className="font-serif text-4xl font-bold text-white">
            {status?.total_properties || 0}
          </p>
          <p className="text-xs text-slate-400">Indexed in vector space & database</p>
        </div>

        {/* DarGlobal Developments */}
        <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>DarGlobal Luxury</span>
            <span className="w-2.5 h-2.5 rounded-full bg-dargold-400"></span>
          </div>
          <p className="font-serif text-4xl font-bold text-dargold-400">
            {status?.darglobal_count || 0}
          </p>
          <p className="text-xs text-slate-400">Flagship branded residences & towers</p>
        </div>

        {/* Wasalt Listings */}
        <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Wasalt KSA</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <p className="font-serif text-4xl font-bold text-emerald-400">
            {status?.wasalt_count || 0}
          </p>
          <p className="text-xs text-slate-400">Saudi villas & apartments across KSA</p>
        </div>

      </div>

      {/* Source Details & Pipeline Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DarGlobal Source Box */}
        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-dargold-400/20 text-dargold-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">DarGlobal Scraping Engine</h3>
                <p className="text-xs text-slate-400">darglobal.co.uk</p>
              </div>
            </div>
            <a
              href="https://darglobal.co.uk"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="space-y-2 text-xs text-slate-300 bg-navy-950 p-4 rounded-xl border border-slate-800/80">
            <p className="font-semibold text-dargold-300">Scraping Strategy:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Inspects project pages across Dubai, Spain, Oman, and Qatar.</li>
              <li>Extracts architectural details, designer partnerships (Lamborghini, Pagani, Missoni, Aston Martin, Gensler).</li>
              <li>Extracts published prices, unit bedroom configurations, and completion timelines.</li>
              <li>Employs anti-bot resilience and grounded high-fidelity fallback.</li>
            </ul>
          </div>
        </div>

        {/* Wasalt Source Box */}
        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Wasalt Scraping Engine</h3>
                <p className="text-xs text-slate-400">wasalt.com</p>
              </div>
            </div>
            <a
              href="https://wasalt.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="space-y-2 text-xs text-slate-300 bg-navy-950 p-4 rounded-xl border border-slate-800/80">
            <p className="font-semibold text-emerald-300">Scraping Strategy:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Direct Next.js SSR hydration parser (<code className="text-emerald-400">__NEXT_DATA__</code>).</li>
              <li>Scrapes listings across Riyadh, Jeddah, Al Khobar, Dammam, and Makkah.</li>
              <li>Parses exact prices in SAR, REGA license credentials, and built-up areas (SQM).</li>
              <li>Enriches property metadata with verified geo-coordinates and high-res imagery.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Status Log Console */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
        <h3 className="font-serif text-lg font-semibold text-white">Engine Pipeline Status</h3>
        <div className="bg-navy-950 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-1 border border-slate-800/80">
          <p><span className="text-slate-500">[STATUS]</span> {status?.status_message || 'System ready'}</p>
          <p><span className="text-slate-500">[TIMESTAMP]</span> Last Scraped: {status?.last_scraped_at || 'Recently'}</p>
          <p><span className="text-slate-500">[VECTOR_STORE]</span> HNSW Cosine Index active with 384-dimensional embeddings</p>
          <p><span className="text-slate-500">[RAG_RETRIEVAL]</span> Top-K reranking with lexical boost active</p>
        </div>
      </div>

    </div>
  );
};
