import React from 'react';
import { ExternalLink, Bed, Bath, Maximize2, MapPin, Sparkles, Award } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onAskAI?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onAskAI }) => {
  const isDarGlobal = property.source === 'DarGlobal';

  return (
    <div className="group relative bg-navy-900/90 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-dargold-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-dargold-500/5 flex flex-col h-full">
      
      {/* Property Image Container */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={property.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-black/30"></div>

        {/* Source Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {isDarGlobal ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-dargold-400 text-navy-950 shadow-md">
              <Sparkles className="w-3 h-3 mr-1" />
              DarGlobal Luxury
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white shadow-md">
              <Award className="w-3 h-3 mr-1" />
              Wasalt Saudi Arabia
            </span>
          )}
        </div>

        {/* Purpose Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
            For {property.purpose}
          </span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">Starting Guide</p>
            <p className="text-lg font-bold text-white tracking-tight drop-shadow-md">
              {property.price_formatted}
            </p>
          </div>
          {property.designer_or_brand && (
            <span className="text-[11px] font-semibold text-dargold-300 bg-navy-950/80 px-2 py-0.5 rounded border border-dargold-400/30">
              {property.designer_or_brand}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-white group-hover:text-dargold-300 transition-colors line-clamp-1">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-xs text-slate-400 mt-1.5 space-x-1">
            <MapPin className="w-3.5 h-3.5 text-dargold-400 shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Specifications Pills */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5 bg-navy-950/50 p-2 rounded-lg">
              <Bed className="w-4 h-4 text-dargold-400" />
              <span className="truncate">{property.bedrooms || 'Studio - 3BR'}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-navy-950/50 p-2 rounded-lg">
              <Bath className="w-4 h-4 text-dargold-400" />
              <span className="truncate">{property.bathrooms || '2-3 Baths'}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-navy-950/50 p-2 rounded-lg">
              <Maximize2 className="w-4 h-4 text-dargold-400" />
              <span className="truncate">{property.area_sqm ? `${property.area_sqm} m²` : 'Spacious'}</span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {onAskAI && (
            <button
              onClick={() => onAskAI(property)}
              className="flex-1 flex items-center justify-center space-x-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-navy-800 text-dargold-300 hover:bg-dargold-400 hover:text-navy-950 transition-all border border-dargold-400/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI About This</span>
            </button>
          )}

          <a
            href={property.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-navy-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="View Original Listing"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>

    </div>
  );
};
