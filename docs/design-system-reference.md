# Design System Reference

## Overview

This document serves as the comprehensive design system reference for the application, capturing all current design patterns, tokens, and guidelines used in the ProfileSidebar and IconDrawer components.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Component Patterns](#component-patterns)
6. [Navigation Patterns](#navigation-patterns)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Implementation Examples](#implementation-examples)

## Design Principles

### Core Values
- **Consistency**: All components follow established patterns
- **Simplicity**: Clean, minimal design with clear hierarchy
- **Accessibility**: WCAG compliant with proper focus management
- **Performance**: Optimized for smooth interactions

### Layout Principles
- **Mobile-first**: Responsive design that works across devices
- **Flexible spacing**: Consistent spacing scale for all elements
- **Visual hierarchy**: Clear information architecture through typography and spacing

## Color Palette

### Primary Colors
```tsx
// Active states and primary actions
bg-indigo-600        // Primary button background
hover:bg-indigo-500  // Primary button hover
text-white           // Primary button text
```

### Neutral Colors
```tsx
// Backgrounds and borders
bg-white/90          // Semi-transparent white backgrounds
bg-surface           // Custom surface color
bg-gray-100          // Hover states
bg-gray-200          // Badge backgrounds
ring-gray-200        // Border colors
backdrop-blur        // Frosted glass effect
```

### Semantic Colors
```tsx
// Text colors
text-primary         // Main text color
text-secondary       // Secondary text
text-gray-700        // Body text
text-gray-400        // Muted text
```

### Color Usage Guidelines
- **Primary colors**: Use for active states, primary actions, and brand elements
- **Neutral colors**: Use for backgrounds, borders, and inactive states
- **Semantic colors**: Use for text hierarchy and accessibility

## Typography

### Font Scale
```tsx
// Headers
text-sm font-semibold  // Section headers, navigation labels

// Body text
text-sm               // Primary content, buttons
text-xs               // Secondary content, badges

// Special cases
text-[10px]           // Badge text, metadata
```

### Font Families
- **Primary**: System default (optimized for performance)
- **Fallback**: Sans-serif stack for cross-platform consistency

### Typography Patterns
```tsx
// Navigation labels
<div className="text-sm font-semibold text-primary">
  Navigation Title
</div>

// Button text
<button className="text-sm font-medium text-gray-700">
  Button Text
</button>

// Badge text
<span className="text-[10px] font-semibold text-primary">
  Badge
</span>
```

## Spacing System

### Padding Scale
```tsx
// Component containers
p-3    // 12px - Cards, main containers
p-2    // 8px - Compact containers
p-1    // 4px - Small elements

// Button padding
px-3 py-2    // 12px horizontal, 8px vertical - Standard buttons
px-3 py-1.5  // 12px horizontal, 6px vertical - Compact buttons

// Internal spacing
px-1   // 4px - Small gaps within components
```

### Margin Scale
```tsx
// Vertical spacing
mt-3   // 12px - Between major sections
mt-2   // 8px - Between related elements
mt-0   // 0px - Reset margins

// Component spacing
gap-2  // 8px - Between child elements
gap-1  // 4px - Tight spacing
```

### Layout Spacing Guidelines
- **Cards**: `p-3` for main content, `p-2` for compact versions
- **Buttons**: `px-3 py-2` for standard, `px-3 py-1.5` for compact
- **Lists**: `gap-2` between items, `px-2 py-2` for list items
- **Sections**: `mt-3` between major sections

## Component Patterns

### Cards
```tsx
// Standard card pattern
<section className="rounded-2xl bg-white/90 p-3 shadow-sm backdrop-blur">
  {/* Card content */}
</section>

// Compact card pattern
<section className="rounded-2xl bg-white/90 p-2 shadow-sm ring-1 ring-gray-200 backdrop-blur">
  {/* Compact card content */}
</section>
```

### Buttons
```tsx
// Primary action button
<button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
  Action
</button>

// Secondary button (CTA)
<button className="inline-flex items-center justify-center w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
  Secondary Action
</button>

// Icon button
<button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 text-primary focus-ring transition">
  <Icon className="h-5 w-5" />
</button>
```

### Navigation Components
```tsx
// Activity bar (vertical navigation)
<nav className="flex shrink-0 flex-col items-center justify-start gap-1 border-r border-default bg-surface py-2 h-full">
  {/* Navigation items */}
</nav>

// Sidebar content
<aside className="relative overflow-hidden border-r border-default bg-surface transition-[width,opacity] duration-200 ease-in-out h-full">
  {/* Sidebar content */}
</aside>
```

## Navigation Patterns

### Activity Bar Navigation
```tsx
// Active state
<button className="bg-indigo-600 text-white">
// Inactive state
<button className="hover:bg-gray-100 text-primary">
// With badge
<button className="relative">
  <span className="absolute -right-1 -top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-gray-200 px-1 text-[10px] font-semibold text-primary">
    {badgeCount}
  </span>
</button>
```

### Sidebar States
- **Expanded**: Full width with content visible
- **Collapsed**: Zero width, content hidden
- **Transition**: Smooth width and opacity changes

### Interaction Patterns
- **Single-click**: Toggle between views
- **Active icon**: Click to collapse sidebar
- **Navigation**: Maintains active state persistence

## Accessibility Guidelines

### Focus Management
```tsx
// Focus rings
focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500

// Custom focus class
focus-ring  // Uses CSS custom property --ring-color
```

### ARIA Labels
```tsx
// Navigation landmarks
<nav aria-label="Activity Bar">
<aside aria-label="Sidebar content">

// Button states
<button aria-pressed={isActive} aria-label="Toggle navigation">

// Live regions (if needed)
<div aria-live="polite" aria-atomic="true">
```

### Keyboard Navigation
- **Tab order**: Logical focus flow through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close expanded content
- **Arrow keys**: Navigate through lists and menus

### Color Contrast
- **Text on background**: Minimum 4.5:1 contrast ratio
- **Interactive elements**: Clear focus indicators
- **Error states**: High contrast for accessibility

## Implementation Examples

### Complete ProfileSidebar Component
```tsx
// ProfileSidebar.tsx
function ProfileSettingsCard({ onToggle, isCollapsed }: { onToggle: () => void; isCollapsed: boolean }) {
  return (
    <section className="rounded-2xl bg-white/90 p-3 shadow-sm backdrop-blur">
      <div className="mt-3 px-1">
        <Link
          href="/businessidea/profile-settings"
          className="inline-flex items-center justify-center w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Open Profile Settings Tabs"
        >
          Open Profile Settings
        </Link>
      </div>
    </section>
  );
}
```

### Complete ConversationsCard Component
```tsx
// ConversationsCard.tsx
export default function ConversationsCard({ conversations = [], onNewChat, onOpenConversation }) {
  return (
    <section className="rounded-2xl bg-white/90 p-2 shadow-sm ring-1 ring-gray-200 backdrop-blur mt-3">
      <div className="flex items-center gap-1 px-1">
        <button
          onClick={onNewChat}
          className="ml-auto w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Create a Business Plan"
        >
          <div className="flex w-full items-center justify-between">
            <span>Create a Backup Plan</span>
            <PlusIcon className="h-4 w-4 font-bold" />
          </div>
        </button>
      </div>

      <div className="mt-2">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpenConversation?.(c.id)}
            className="flex w-full items-center gap-2 px-2 py-2 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Open conversation ${c.title}`}
          >
            <span className="line-clamp-1 flex-1 text-sm text-gray-800">{c.title}</span>
            {c.unread > 0 && (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                {c.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
```

### Complete IconDrawer Component
```tsx
// IconDrawer.tsx
export default function IconDrawer({ views, storageKey = "icon-drawer", widthPx = 264, activityBarWidthPx = 52, className }) {
  // State management for active view and collapsed state
  const [persist, setPersist] = usePersistentState<{ activeId: string; collapsed: boolean }>(
    `${storageKey}:state`,
    { activeId: views[0]?.id, collapsed: false }
  );

  const active = views.find((v) => v.id === persist.activeId) || views[0];

  function setActive(id: string) {
    setPersist(s => {
      if (s.activeId === id) {
        // Toggle collapsed state when clicking active icon
        return { ...s, collapsed: !s.collapsed };
      }
      // Different icon: set active and expand
      return { 
        activeId: id, 
        collapsed: false
      };
    });
  }

  return (
    <div className={["flex h-full", className || ""].join(" ")} aria-label="IDE-style drawer">
      {/* Activity Bar */}
      <nav
        className="flex shrink-0 flex-col items-center justify-start gap-1 border-r border-default bg-surface py-2 h-full"
        style={{ width: activityBarWidthPx }}
        aria-label="Activity Bar"
      >
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className={[
              "relative flex h-10 w-10 items-center justify-center rounded-lg focus-ring transition",
              v.id === active?.id ? "bg-indigo-600 text-white" : "hover:bg-gray-100 text-primary",
            ].join(" ")}
            aria-pressed={v.id === active?.id}
            aria-label={v.label}
            title={v.label}
          >
            {v.icon}
            {v.badge > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-gray-200 px-1 text-[10px] font-semibold text-primary">
                {v.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Content */}
      <aside
        className="relative overflow-hidden border-r border-default bg-surface transition-[width,opacity] duration-200 ease-in-out h-full"
        style={{ width: persist.collapsed ? 0 : widthPx, opacity: persist.collapsed ? 0 : 1 }}
        aria-label="Sidebar content"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-default bg-white/90 backdrop-blur-sm">
          <div className="flex h-11 items-center px-3">
            <div className="text-sm font-semibold text-primary">{active?.label}</div>
          </div>
        </div>

        {/* Content area */}
        <div className="h-[calc(100%-44px)] overflow-y-auto p-3">
          <div className="space-y-3">
            {active?.render()}
          </div>
        </div>
      </aside>
    </div>
  );
}
```

## Best Practices

### Development Guidelines
1. **Always use semantic classes** instead of direct color utilities
2. **Follow the spacing scale** for consistent layouts
3. **Include proper ARIA labels** for accessibility
4. **Use the established button patterns** for consistency
5. **Test across different screen sizes** for responsiveness

### Performance Considerations
1. **Use backdrop-blur sparingly** as it can impact performance
2. **Optimize icon sizes** and use consistent dimensions
3. **Minimize layout shifts** during state transitions
4. **Use CSS transitions** for smooth animations

### Maintenance Notes
- Update this document when introducing new design patterns
- Test new components against existing patterns
- Maintain consistency with the established color palette
- Keep accessibility standards current with WCAG guidelines

---

*Last updated: 2025-09-06*
*Based on ProfileSidebar and IconDrawer component implementations*
