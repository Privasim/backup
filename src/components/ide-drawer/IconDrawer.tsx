"use client";

import React from "react";

export interface DrawerView {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  render: () => React.ReactNode;
}

export interface IconDrawerProps {
  views: DrawerView[];
  initialViewId?: string;
  storageKey?: string; // used for persisting active view and collapsed state
  defaultCollapsed?: boolean;
  widthPx?: number; // sidebar width when expanded
  activityBarWidthPx?: number; // width of the icon bar
  className?: string;
}

function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = React.useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* no-op */
    }
  }, [key, state]);

  return [state, setState] as const;
}

export default function IconDrawer({
  views,
  initialViewId,
  storageKey = "icon-drawer",
  defaultCollapsed = false,
  widthPx = 264,
  activityBarWidthPx = 52,
  className,
}: IconDrawerProps) {
  const firstId = views[0]?.id;

  const [persist, setPersist] = usePersistentState<{ activeId: string; collapsed: boolean }>(
    `${storageKey}:state`,
    { activeId: initialViewId || firstId, collapsed: defaultCollapsed }
  );

  const active = views.find((v) => v.id === persist.activeId) || views[0];
  const collapsed = persist.collapsed;

  function setActive(id: string) {
    setPersist((s) => ({ ...s, activeId: id }));
  }

  function toggleCollapsed() {
    setPersist((s) => ({ ...s, collapsed: !s.collapsed }));
  }

  return (
    <div className={[
      "flex h-full min-h-[200px]",
      className || "",
    ].join(" ")}
      aria-label="IDE-style drawer"
    >
      {/* Activity Bar */}
      <nav
        className="flex shrink-0 flex-col items-center justify-start gap-1 border-r border-default bg-surface py-2"
        style={{ width: activityBarWidthPx }}
        aria-label="Activity Bar"
      >
        {views.map((v) => {
          const isActive = v.id === active?.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setActive(v.id)}
              className={[
                "relative flex h-10 w-10 items-center justify-center rounded-lg focus-ring transition",
                isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-100 text-primary",
              ].join(" ")}
              aria-pressed={isActive}
              aria-label={v.label}
              title={v.label}
            >
              {v.icon}
              {typeof v.badge === "number" && v.badge > 0 && (
                <span
                  className="absolute -right-1 -top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-gray-200 px-1 text-[10px] font-semibold text-primary"
                  aria-label={`${v.badge} unread`}
                >
                  {v.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Spacer and collapse control at bottom */}
        <div className="flex-1" />
        <button
          type="button"
          onClick={toggleCollapsed}
          className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-gray-100 focus-ring"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            {collapsed ? (
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0L5.293 10l6.293-6.293a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </nav>

      {/* Sidebar Content */}
      <aside
        className="relative overflow-hidden border-r border-default bg-surface transition-[width,opacity] duration-200 ease-in-out"
        style={{ width: collapsed ? 0 : widthPx, opacity: collapsed ? 0 : 1 }}
        aria-label="Sidebar content"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-default bg-white/90 backdrop-blur-sm">
          <div className="flex h-11 items-center gap-2 px-3">
            <div className="text-sm font-semibold text-primary">{active?.label}</div>
            <div className="ml-auto">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="rounded-md p-1 text-secondary hover:bg-gray-100 focus-ring"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0L5.293 10l6.293-6.293a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="h-full overflow-y-auto p-3">
          <div className="space-y-3">
            {active?.render()}
          </div>
        </div>
      </aside>
    </div>
  );
}
