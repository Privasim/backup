import * as d3 from 'd3';

export interface D3ChartComponent {
  render(container: SVGElement, data: any[], config: D3ChartConfig): void;
  update(data: any[]): void;
  destroy(): void;
}

export interface D3ChartConfig {
  dimensions: { width: number; height: number; margin: Margin };
  scales: { x?: d3.ScaleLinear<number, number>; y?: d3.ScaleLinear<number, number>; color?: d3.ScaleOrdinal<string, string> };
  animations: { duration: number; easing: string };
  interactions: { zoom: boolean; brush: boolean; tooltip: boolean };
  styling: { colorScheme: string[]; fonts: FontConfig };
}

export interface Margin {
  top: number; right: number; bottom: number; left: number;
}

export interface FontConfig {
  family: string;
  size: { small: number; medium: number; large: number };
  weight: { normal: number; bold: number };
}

export const PROFESSIONAL_COLORS = {
  primary: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
  risk: ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#8e44ad'],
  categorical: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
  neutral: ['#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d', '#34495e', '#2c3e50']
};

export const DEFAULT_CONFIG: D3ChartConfig = {
  dimensions: { width: 800, height: 400, margin: { top: 20, right: 30, bottom: 40, left: 50 } },
  scales: {},
  animations: { duration: 750, easing: 'cubic-in-out' },
  interactions: { zoom: false, brush: false, tooltip: true },
  styling: { 
    colorScheme: PROFESSIONAL_COLORS.primary,
    fonts: { family: 'Inter, sans-serif', size: { small: 10, medium: 12, large: 16 }, weight: { normal: 400, bold: 600 } }
  }
};