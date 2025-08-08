// Minimal JSON DSL for rendering a mobile wireframe safely

export type WireframeNodeType =
  | 'Screen'
  | 'Header'
  | 'Text'
  | 'Button'
  | 'List'
  | 'Card'
  | 'Form';

export interface WireframeBaseNode {
  type: WireframeNodeType;
  props?: Record<string, any>;
  children?: WireframeNode[];
}

export interface WireframeScreen extends WireframeBaseNode {
  type: 'Screen';
  props?: {
    title?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
  };
  children?: WireframeNode[];
}

export type WireframeNode =
  | WireframeScreen
  | WireframeBaseNode;
