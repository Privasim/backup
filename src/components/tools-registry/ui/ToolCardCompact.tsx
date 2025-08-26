import React from 'react';
import { ToolSummary } from '../../../features/tools-registry/types';
import { ChatBubbleLeftRightIcon, PlusCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ToolCardCompactProps {
  tool: ToolSummary;
  variant: 'grid' | 'list';
  onDiscuss: (toolId: string) => void;
  onAddToPlan: (toolId: string) => void;
}

export const ToolCardCompact: React.FC<ToolCardCompactProps> = ({
  tool,
  variant,
  onDiscuss,
  onAddToPlan,
}) => {
  // Format price display
  const formatPrice = () => {
    if (!tool.pricing) return 'Free';
    
    const minUSD = tool.pricing.minUSD || 0;
    const maxUSD = tool.pricing.maxUSD || 0;
    
    if (minUSD === 0 && maxUSD === 0) {
      return 'Free';
    }
    
    if (minUSD === 0) {
      return `Free - $${maxUSD}/mo`;
    }
    
    if (minUSD === maxUSD) {
      return `$${minUSD}/mo`;
    }
    
    return `$${minUSD} - $${maxUSD}/mo`;
  };
  
  // Get pricing color based on price range
  const getPriceColor = () => {
    if (!tool.pricing) return 'bg-green-100 text-green-700';
    
    const minUSD = tool.pricing.minUSD || 0;
    const maxUSD = tool.pricing.maxUSD || 0;
    
    if (minUSD === 0 && maxUSD === 0) {
      return 'bg-green-100 text-green-700';
    }
    
    if (maxUSD <= 10) {
      return 'bg-blue-100 text-blue-700';
    }
    
    if (maxUSD <= 50) {
      return 'bg-purple-100 text-purple-700';
    }
    
    return 'bg-amber-100 text-amber-700';
  };
  
  // Generate vendor icon initials with deterministic pastel color
  const getVendorIcon = () => {
    const vendorName = tool.vendor || 'Unknown';
    const initials = vendorName
      .split(' ')
      .map((word) => word[0] || '')
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const palette = [
      'bg-blue-100 text-blue-700 ring-blue-200',
      'bg-emerald-100 text-emerald-700 ring-emerald-200',
      'bg-rose-100 text-rose-700 ring-rose-200',
      'bg-amber-100 text-amber-700 ring-amber-200',
      'bg-purple-100 text-purple-700 ring-purple-200',
      'bg-cyan-100 text-cyan-700 ring-cyan-200',
      'bg-indigo-100 text-indigo-700 ring-indigo-200',
      'bg-pink-100 text-pink-700 ring-pink-200',
    ];
    let hash = 0;
    for (let i = 0; i < vendorName.length; i++) hash = (hash * 31 + vendorName.charCodeAt(i)) >>> 0;
    const color = palette[hash % palette.length];

    return (
      <div className={`flex items-center justify-center rounded-full ring-2 ring-inset ${color}`}>
        {initials}
      </div>
    );
  };
  
  if (variant === 'grid') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* Card header with vendor icon */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10">{getVendorIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{tool.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{tool.vendor}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceColor()}`}>
            {formatPrice()}
          </div>
        </div>
        
        {/* Card body */}
        <div className="px-4 pb-2 flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{tool.description}</p>
        </div>
        
        {/* Capabilities */}
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {tool.capabilities.slice(0, 3).map(capability => (
            <span 
              key={capability} 
              className="inline-block px-2 py-0.5 rounded-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {capability}
            </span>
          ))}
          {tool.capabilities.length > 3 && (
            <span className="inline-block px-2 py-0.5 rounded-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              +{tool.capabilities.length - 3} more
            </span>
          )}
        </div>
        
        {/* Card actions */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
          <button 
            onClick={() => onDiscuss(tool.id)}
            className="text-xs flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
            Discuss
          </button>
          <button 
            onClick={() => onAddToPlan(tool.id)}
            className="text-xs flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <PlusCircleIcon className="w-4 h-4 mr-1" />
            Add to Plan
          </button>
        </div>
      </div>
    );
  }
  
  // List variant
  return (
    <div className="relative bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border-b border-gray-100 dark:border-gray-800 py-3 px-4">
      <div className="flex items-center gap-3">
        {/* Vendor icon */}
        <div className="w-8 h-8">{getVendorIcon()}</div>

        {/* Tool info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{tool.name}</h3>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriceColor()}`}>
              {formatPrice()}
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{tool.vendor}</p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => onDiscuss(tool.id)}
                className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                <span>Discuss</span>
              </button>
              <button
                onClick={() => onAddToPlan(tool.id)}
                className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <PlusCircleIcon className="h-3.5 w-3.5" />
                <span>Add to Plan</span>
              </button>
            </div>
          </div>

          {/* Description and capabilities */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">{tool.description}</p>

          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {tool.capabilities.slice(0, 3).map((capability) => (
              <span
                key={capability}
                className="inline-block px-1.5 py-0.5 rounded-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              >
                {capability}
              </span>
            ))}
            {tool.capabilities.length > 3 && (
              <span className="inline-block px-1.5 py-0.5 rounded-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                +{tool.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Right chevron */}
        <ChevronRightIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
      </div>
    </div>
  );
};
