'use client';

import { useState } from 'react';
import { ArrowTopRightOnSquareIcon, ChatBubbleLeftIcon, PlusIcon, CheckBadgeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { ToolSummary } from '@/features/tools-registry/types';

interface ToolCardProps {
  tool: ToolSummary;
  onDiscuss: () => void;
  onAddToPlan: () => void;
  className?: string;
}

export function ToolCard({ tool, onDiscuss, onAddToPlan, className }: ToolCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (pricing: ToolSummary['pricing']) => {
    if (!pricing) return null;
    
    const { model, minUSD, maxUSD } = pricing;
    
    if (model === 'free') return 'Free';
    if (model === 'freemium') return 'Freemium';
    
    if (minUSD !== undefined || maxUSD !== undefined) {
      if (minUSD && maxUSD) {
        return `$${minUSD} - $${maxUSD}`;
      } else if (minUSD) {
        return `From $${minUSD}`;
      } else if (maxUSD) {
        return `Up to $${maxUSD}`;
      }
    }
    
    return model.charAt(0).toUpperCase() + model.slice(1);
  };

  const getComplianceIcons = (compliance: ToolSummary['compliance']) => {
    if (!compliance) return [];
    
    const icons = [];
    if (compliance.gdpr) icons.push({ name: 'GDPR', icon: ShieldCheckIcon });
    if (compliance.soc2) icons.push({ name: 'SOC2', icon: CheckBadgeIcon });
    if (compliance.hipaa) icons.push({ name: 'HIPAA', icon: ShieldCheckIcon });
    
    return icons;
  };

  const price = formatPrice(tool.pricing);
  const complianceIcons = getComplianceIcons(tool.compliance);

  return (
    <div className={cn(
      "group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              by {tool.vendor}
            </p>
          </div>
          
          {price && (
            <div className="ml-3 flex-shrink-0">
              <span className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                tool.pricing?.model === 'free' || tool.pricing?.model === 'freemium'
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              )}>
                {price}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
          {tool.description}
        </p>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tool.capabilities.slice(0, 3).map((capability) => (
            <span
              key={capability}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {capability.replace(/-/g, ' ')}
            </span>
          ))}
          {tool.capabilities.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              +{tool.capabilities.length - 3} more
            </span>
          )}
        </div>

        {/* Compliance and Last Verified */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {complianceIcons.map(({ name, icon: Icon }) => (
              <div key={name} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                <span>{name}</span>
              </div>
            ))}
          </div>
          
          {tool.lastVerifiedAt && (
            <span>
              Updated {new Date(tool.lastVerifiedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={onDiscuss}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <ChatBubbleLeftIcon className="h-4 w-4" />
            Discuss
          </button>
          
          <button
            onClick={onAddToPlan}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add to Plan
          </button>
          
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
            title="Visit website"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
