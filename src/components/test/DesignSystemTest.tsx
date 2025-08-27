'use client';

import React from 'react';

/**
 * Test component to verify the centralized UI design system
 * Showcases all design tokens, typography styles, and component patterns
 */
export const DesignSystemTest: React.FC = () => {
  return (
    <div className="p-8 bg-background">
      <h1 className="text-heading-1 mb-6">Design System Test</h1>
      
      <section className="mb-8">
        <h2 className="text-heading-2 mb-4">Color Tokens</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Primary" className="bg-primary text-white" />
          <ColorSwatch name="Primary Hover" className="bg-primary-hover text-white" />
          <ColorSwatch name="Background" className="bg-background border border-border" />
          <ColorSwatch name="Text Primary" className="bg-text-primary text-white" />
          <ColorSwatch name="Text Secondary" className="bg-text-secondary text-white" />
          <ColorSwatch name="Border" className="bg-border" />
          <ColorSwatch name="Accent" className="bg-accent" />
          <ColorSwatch name="Success" className="bg-success text-white" />
          <ColorSwatch name="Warning" className="bg-warning text-white" />
          <ColorSwatch name="Error" className="bg-error text-white" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-heading-2 mb-4">Typography</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-heading-1">Heading 1</h1>
            <p className="text-caption">font-size: var(--font-size-3xl); font-weight: 600;</p>
          </div>
          <div>
            <h2 className="text-heading-2">Heading 2</h2>
            <p className="text-caption">font-size: var(--font-size-2xl); font-weight: 600;</p>
          </div>
          <div>
            <h3 className="text-heading-3">Heading 3</h3>
            <p className="text-caption">font-size: var(--font-size-xl); font-weight: 600;</p>
          </div>
          <div>
            <h4 className="text-heading-4">Heading 4</h4>
            <p className="text-caption">font-size: var(--font-size-lg); font-weight: 600;</p>
          </div>
          <div>
            <p className="text-body">Body Text - The quick brown fox jumps over the lazy dog.</p>
            <p className="text-caption">font-size: var(--font-size-base); font-weight: 400;</p>
          </div>
          <div>
            <p className="text-body-sm">Small Body Text - The quick brown fox jumps over the lazy dog.</p>
            <p className="text-caption">font-size: var(--font-size-sm); font-weight: 400;</p>
          </div>
          <div>
            <p className="text-caption">Caption Text - The quick brown fox jumps over the lazy dog.</p>
            <p className="text-caption-sm">font-size: var(--font-size-sm); font-weight: 400; color: var(--color-text-secondary);</p>
          </div>
          <div>
            <a href="#" className="text-link">Link Text - Click me</a>
            <p className="text-caption">color: var(--color-primary); text-decoration: none; font-weight: 500;</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-heading-2 mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-base p-6">
            <h3 className="text-heading-3 mb-2">Basic Card</h3>
            <p className="text-body mb-4">This is a basic card component using our design tokens.</p>
            <div className="flex gap-2">
              <button className="btn-primary">Primary Action</button>
              <button className="btn-secondary">Secondary</button>
            </div>
          </div>
          
          <div className="card-interactive p-6">
            <h3 className="text-heading-3 mb-2">Interactive Card</h3>
            <p className="text-body mb-4">This card has hover effects. Try hovering over it.</p>
            <div className="flex gap-2">
              <button className="btn-primary">Primary Action</button>
              <button className="btn-secondary">Secondary</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-heading-2 mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4 p-6 bg-white rounded-lg shadow-sm">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-primary" disabled>Primary Disabled</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-secondary" disabled>Secondary Disabled</button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-heading-2 mb-4">Shadows & Radius</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <p className="text-body">Shadow Small</p>
            <p className="text-caption">border-radius: var(--radius-sm)</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-body">Shadow Medium</p>
            <p className="text-caption">border-radius: var(--radius-md)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-body">Shadow Large</p>
            <p className="text-caption">border-radius: var(--radius-lg)</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper component for color swatches
const ColorSwatch: React.FC<{ name: string; className: string }> = ({ name, className }) => {
  return (
    <div className="flex flex-col">
      <div className={`h-16 rounded-md ${className} flex items-center justify-center`}>
        {name}
      </div>
      <p className="text-caption mt-1">{name}</p>
    </div>
  );
};

export default DesignSystemTest;
