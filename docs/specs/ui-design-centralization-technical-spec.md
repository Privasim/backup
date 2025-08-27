# UI Design Centralization Technical Spec

## Current State
UI design is fragmented across multiple files:
- `src/app/globals.css`: Contains CSS variables and some global styles
- Individual component files: Have inline styles or component-specific CSS
- No centralized design system
- Inconsistent spacing and typography
- Missing `tailwind.config.js` for centralized design tokens
- Limited theme provider integration

## Goal
Create unified design system with:
- Compact, modern aesthetic
- Consistent spacing system
- Standardized typography (dark text colors only)
- White/blue branding theme enforcement
- Highly responsive and accessible design

## Key Requirements
1. Centralized design tokens using CSS custom properties
2. Component-level style enforcement through Tailwind utilities
3. Theme provider for consistent theming across light/dark modes
4. Typography system with hierarchical font scales
5. Spacing system using consistent scale (4px base)
6. Color palette enforcing white background with blue accents
7. Compact layout optimizations for all components

## Design Tokens
### Colors
- Primary: Blue accents (`--color-primary: #2563eb`)
- Background: White (`--color-background: #ffffff`)
- Text: Dark gray/black (`--color-text-primary: #1f2937`, `--color-text-secondary: #6b7280`)
- Borders: Light gray (`--color-border: #e5e7eb`)

### Spacing Scale
- Base unit: 4px
- Scale: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), etc.

### Typography
- Font family: Inter (system font stack with Inter as primary)
- Font weights: 400 (regular), 500 (medium), 600 (semibold)
- Text colors: Only dark variants allowed (no light text except for special cases)

## Files to Create

### 1. `src/styles/design-tokens.css`
```css
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-background: #ffffff;
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-accent: #dbeafe;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### 2. `src/styles/theme.css`
```css
/* Theme-specific overrides */
[data-theme="dark"] {
  --color-background: #0f172a;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #cbd5e1;
  --color-border: #334155;
  --color-accent: #1e40af;
}
```

### 3. `src/styles/typography.css`
```css
/* Typography system */
.text-heading-1 { font-size: var(--font-size-3xl); font-weight: 600; color: var(--color-text-primary); }
.text-heading-2 { font-size: var(--font-size-2xl); font-weight: 600; color: var(--color-text-primary); }
.text-heading-3 { font-size: var(--font-size-xl); font-weight: 600; color: var(--color-text-primary); }
.text-body { font-size: var(--font-size-base); font-weight: 400; color: var(--color-text-primary); }
.text-caption { font-size: var(--font-size-sm); font-weight: 400; color: var(--color-text-secondary); }

/* Ensure all text uses dark colors */
* {
  color: var(--color-text-primary);
}

/* Override any light text */
.text-white,
.text-gray-100,
.text-gray-200 {
  color: var(--color-text-primary) !important;
}
```

### 4. `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-background)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      fontFamily: {
        sans: ['var(--font-family)', 'sans-serif'],
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}
```

### 5. `src/providers/ThemeProvider.tsx`
```tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

## Files to Modify

### 1. `src/app/globals.css`
```css
// REPLACE entire file
@import "tailwindcss";
@import "./styles/design-tokens.css";
@import "./styles/theme.css";
@import "./styles/typography.css";

/* Remove existing CSS variables and replace with imports */
/* Keep only essential global styles that don't conflict */
body {
  background: var(--color-background);
  font-family: var(--font-family);
  color: var(--color-text-primary);
}
```

### 2. `src/app/layout.tsx`
```tsx
// INSERT BELOW import statements
import { ThemeProvider } from '@/providers/ThemeProvider';

// REPLACE body content
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <ThemeProvider>
    <ChatboxProvider>
      <ChatboxLayout position="right" width="24rem">
        {children}
      </ChatboxLayout>
    </ChatboxProvider>
  </ThemeProvider>
</body>
```

### 3. Component Files (All)
- Replace hardcoded colors with design token variables
- Use Tailwind utilities instead of custom CSS
- Ensure all text uses dark colors
- Apply consistent spacing using design tokens
- Update class names to use new typography system

## Rationale
Centralizing design ensures:
- Visual consistency across all components
- Easier theme modifications
- Reduced CSS duplication
- Faster onboarding for new developers

Using CSS variables + design tokens provides:
- Dynamic theme switching
- Consistent spacing/sizing system
- Brand alignment enforcement

## Implementation Steps
1. Create design token files
2. Set up Tailwind configuration
3. Create theme provider
4. Update globals.css to import new files
5. Modify layout to include ThemeProvider
6. Refactor components incrementally:
   - Start with core components (buttons, inputs, cards)
   - Move to complex components (tabs, forms)
   - Update pages last
7. Test theme switching and responsiveness
8. Validate accessibility (WCAG compliance)

## Performance Considerations
- CSS variables are performant and support dynamic updates
- Minimize CSS bundle size by removing unused styles
- Use CSS-in-JS only for dynamic styles, prefer Tailwind for static

## Accessibility Requirements
- Ensure sufficient color contrast (WCAG AA)
- Support keyboard navigation
- Maintain focus indicators
- Test with screen readers

## Browser Support
- CSS custom properties: IE 11+
- Modern browsers for full support
- Graceful degradation for older browsers

## Migration Strategy
1. Phase 1: Create design system (design tokens, theme provider)
2. Phase 2: Update core components
3. Phase 3: Update remaining components
4. Phase 4: Remove old CSS and validate
