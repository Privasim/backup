// File: src/modules/job-loss-viz/components/RolesList.tsx
'use client';

import React from 'react';
import type { RoleAggregate } from '../types';

interface Props {
  roles: RoleAggregate[];
  maxItems?: number;
  className?: string;
  standalone?: boolean;
}

export function RolesList({ roles, maxItems = 6, className, standalone = false }: Props) {
  const items = (roles || []).filter((r) => r.count > 0).sort((a, b) => b.count - a.count).slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div className={`${className} ${standalone ? 'card-base p-4' : ''}`}>
        <div className="text-secondary">No role-level figures yet</div>
      </div>
    );
  }

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-primary font-semibold">
          {standalone ? 'Most Impacted Roles' : 'Roles impacted'}
        </h3>
        {standalone && (
          <span className="badge-base badge-neutral">
            Top {maxItems}
          </span>
        )}
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map((r) => (
          <li key={r.role} className="py-2 flex items-center justify-between">
            <span className="text-sm text-secondary truncate" title={r.role}>{r.role}</span>
            <span className="text-sm font-semibold text-primary tabular-nums">{r.count.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      {standalone && items.length === maxItems && roles.length > maxItems && (
        <div className="mt-3 text-xs text-secondary text-right">
          +{roles.length - maxItems} more roles affected
        </div>
      )}
    </>
  );

  if (standalone) {
    return (
      <div 
        className={`${className} card-base p-4`}
        aria-label="Roles affected by AI-related job losses"
      >
        {content}
      </div>
    );
  }

  return (
    <div 
      className={className} 
      aria-label="Roles affected by AI-related job losses"
    >
      {content}
    </div>
  );
}
