// File: src/modules/job-loss-viz/components/RolesList.tsx
'use client';

import React from 'react';
import type { RoleAggregate } from '../types';

interface Props {
  roles: RoleAggregate[];
  maxItems?: number;
  className?: string;
}

export function RolesList({ roles, maxItems = 6, className }: Props) {
  const items = (roles || []).filter((r) => r.count > 0).sort((a, b) => b.count - a.count).slice(0, maxItems);

  if (items.length === 0) {
    return <div className={className}><div className="text-xs text-gray-400">No role-level figures yet</div></div>;
  }

  return (
    <div className={className} aria-label="Roles affected by AI-related job losses">
      <div className="text-xs font-medium text-gray-600 mb-1">Roles impacted</div>
      <ul className="divide-y divide-gray-100">
        {items.map((r) => (
          <li key={r.role} className="py-1.5 flex items-center justify-between">
            <span className="text-sm text-gray-700 truncate" title={r.role}>{r.role}</span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">{r.count.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      {/* Note: links to sources available per role; can be integrated as a disclosure later */}
    </div>
  );
}
