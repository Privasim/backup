import React from 'react';
import { ToolSummary } from '../../../features/tools-registry/types';
import { ChatBubbleLeftRightIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

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
  
  // Generate vendor icon or initials
  const getVendorIcon = () => {
    // Handle case where vendor might be undefined
    const vendorName = tool.vendor || 'Unknown';
    const initials = vendorName
      .split(' ')
      .map(word => word[0] || '')
      .slice(0, 2)
      .join('')
      .toUpperCase();
      
    return (
      <div className="flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium">
        {initials}
      </div>
    );
  };
  
  if (variant === 'grid') {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden flex flex-col">
        {/* Card header with vendor icon */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10">{getVendorIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{tool.name}</h3>
            <p className="text-xs text-gray-500 truncate">{tool.vendor}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceColor()}`}>
            {formatPrice()}
          </div>
        </div>
        
        {/* Card body */}
        <div className="px-4 pb-2 flex-1">
          <p className="text-sm text-gray-600 line-clamp-2">{tool.description}</p>
        </div>
        
        {/* Capabilities */}
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {tool.capabilities.slice(0, 3).map(capability => (
            <span 
              key={capability} 
              className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
            >
              {capability}
            </span>
          ))}
          {tool.capabilities.length > 3 && (
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{tool.capabilities.length - 3} more
            </span>
          )}
        </div>
        
        {/* Card actions */}
        <div className="px-4 py-3 border-t border-gray-100 flex justify-between">
          <button 
            onClick={() => onDiscuss(tool.id)}
            className="text-xs flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
            Discuss
          </button>
          <button 
            onClick={() => onAddToPlan(tool.id)}
            className="text-xs flex items-center text-blue-600 hover:text-blue-800 transition-colors"
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
    <div className="bg-white hover:bg-gray-50 transition-all border-b border-gray-100 py-3 px-4">
      <div className="flex items-center gap-3">
        {/* Vendor icon */}
        <div className="w-8 h-8">{getVendorIcon()}</div>
        
        {/* Tool info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate">{tool.name}</h3>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriceColor()}`}>
              {formatPrice()}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 truncate">{tool.vendor}</p>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => onDiscuss(tool.id)}
                className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                <span>Discuss</span>
              </button>
              <button
                onClick={() => onAddToPlan(tool.id)}
                className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <PlusCircleIcon className="h-3.5 w-3.5" />
                <span>Add to Plan</span>
              </button>
            </div>
          </div>
          
          {/* Description and capabilities */}
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{tool.description}</p>
          
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tool.capabilities.slice(0, 3).map(capability => (
              <span 
                key={capability} 
                className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {capability}
              </span>
            ))}
            {tool.capabilities.length > 3 && (
              <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{tool.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
