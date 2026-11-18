import React, { useState, useMemo } from 'react';
import { Search, Filter, Building2, Sparkles, MapPin } from 'lucide-react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface PropertiesCatalogProps {
  properties: Property[];
  onAskAI: (property: Property) => void;
  sourceFilter: string;
  setSourceFilter: (filter: string) => void;
}

export const PropertiesCatalog: React.FC<PropertiesCatalogProps> = ({
  properties,
  onAskAI,
  sourceFilter,
  setSourceFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set);
  }, [properties]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Source filter
      if (sourceFilter !== 'ALL' && p.source.toLowerCase() !== sourceFilter.toLowerCase()) {
        return false;
      }
      // City filter
      if (selectedCity !== 'ALL' && p.city?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesLocation = p.location.toLowerCase().includes(q);
        const matchesBrand = (p.designer_or_brand || '').toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocation && !matchesBrand && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [properties, sourceFilter, selectedCity, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-dargold-400">
            <Building2 className="w-4 h-4" />
            <span>Curated Real Estate Catalog</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">
            Explore Scraped Properties ({properties.length})
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Live database of DarGlobal luxury international residences and Wasalt Saudi Arabian listings.
          </p>
        </div>

        {/* Source Toggle Pill */}
        <div className="flex items-center bg-navy-900 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          {(['ALL', 'DarGlobal', 'Wasalt'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSourceFilter(mode)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sourceFilter === mode
                  ? 'bg-dargold-400 text-navy-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'ALL' ? 'All' : mode === 'DarGlobal' ? 'DarGlobal' : 'Wasalt (KSA)'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project name, designer (e.g. Lamborghini, Pagani, Elie Saab), district or amenities..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-dargold-400 text-sm"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCity('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-medium shrink-0 border transition-all ${
              selectedCity === 'ALL'
                ? 'bg-dargold-400 text-navy-950 border-dargold-400 font-semibold'
                : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Cities
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-2 rounded-xl text-xs font-medium shrink-0 border transition-all ${
                selectedCity === city
                  ? 'bg-dargold-400 text-navy-950 border-dargold-400 font-semibold'
                  : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onAskAI={onAskAI}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-navy-900/40 border border-slate-800">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-serif text-lg font-semibold text-white mt-3">No Properties Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or switching the source filter.
          </p>
        </div>
      )}

    </div>
  );
};
