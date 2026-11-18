import React from 'react';
import { Sparkles, Building2, Database, Settings, ShieldCheck, Compass } from 'lucide-react';
import { HealthStatus } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'catalog' | 'scraper';
  setActiveTab: (tab: 'chat' | 'catalog' | 'scraper') => void;
  health: HealthStatus | null;
  onOpenSettings: () => void;
  sourceFilter: string;
  setSourceFilter: (filter: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  onOpenSettings,
  sourceFilter,
  setSourceFilter
}) => {
  return (
    <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dargold-400 to-dargold-600 flex items-center justify-center shadow-lg shadow-dargold-500/20">
              <Building2 className="w-6 h-6 text-navy-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-xl tracking-tight text-white">DAR<span className="text-dargold-400">GLOBAL</span></span>
                <span className="text-slate-500 font-light">×</span>
                <span className="font-sans font-semibold text-sm tracking-wide text-emerald-400 uppercase">WASALT</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">AI Real Estate Intelligence</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-navy-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-dargold-400 text-navy-950 font-semibold shadow-md shadow-dargold-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Advisor</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'catalog'
                  ? 'bg-dargold-400 text-navy-950 font-semibold shadow-md shadow-dargold-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Properties ({health?.database.total_properties || 16})</span>
            </button>
            <button
              onClick={() => setActiveTab('scraper')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'scraper'
                  ? 'bg-dargold-400 text-navy-950 font-semibold shadow-md shadow-dargold-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Scraper Engine</span>
            </button>
          </nav>

          {/* Right Controls: Filter & Settings */}
          <div className="flex items-center space-x-3">
            {/* Quick Source Filter Pill */}
            <div className="hidden lg:flex items-center text-xs bg-navy-850 px-2.5 py-1.5 rounded-lg border border-slate-800 space-x-2">
              <span className="text-slate-400 font-medium">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-transparent text-dargold-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-navy-900 text-white">All Sources</option>
                <option value="DarGlobal" className="bg-navy-900 text-white">DarGlobal Luxury</option>
                <option value="Wasalt" className="bg-navy-900 text-white">Wasalt KSA</option>
              </select>
            </div>

            {/* System Health Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">RAG Synced</span>
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-navy-850 text-slate-300 hover:text-dargold-400 hover:bg-slate-800/70 border border-slate-800 transition-colors"
              title="OpenRouter Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
