'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { D3ChartComponent, D3ChartConfig, DEFAULT_CONFIG, PROFESSIONAL_COLORS } from '@/lib/visualization/d3-base';

export interface RiskHeatmapData {
  occupation: string;
  industry: string;
  riskScore: number;
  employment: number;
  confidence: number;
}

interface RiskHeatmapProps {
  data: RiskHeatmapData[];
  config?: Partial<D3ChartConfig>;
  className?: string;
}

class RiskHeatmapChart implements D3ChartComponent {
  private svg: d3.Selection<SVGElement, unknown, null, undefined> | null = null;
  private config: D3ChartConfig;

  constructor(config: D3ChartConfig) {
    this.config = config;
  }

  render(container: SVGElement, data: RiskHeatmapData[]): void {
    const { width, height, margin } = this.config.dimensions;
    
    this.svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const occupations = Array.from(new Set(data.map(d => d.occupation)));
    const industries = Array.from(new Set(data.map(d => d.industry)));

    const xScale = d3.scaleBand().domain(occupations).range([0, width - margin.left - margin.right]).padding(0.1);
    const yScale = d3.scaleBand().domain(industries).range([0, height - margin.top - margin.bottom]).padding(0.1);
    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([1, 0]);

    g.selectAll('.cell')
      .data(data)
      .enter().append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.occupation) || 0)
      .attr('y', d => yScale(d.industry) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.riskScore))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);
  }

  update(data: RiskHeatmapData[]): void {
    if (!this.svg) return;
    // Update implementation would go here
  }

  destroy(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }
}

export default function RiskHeatmap({ data, config = {}, className = '' }: RiskHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<RiskHeatmapChart | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    chartRef.current = new RiskHeatmapChart(mergedConfig);
    chartRef.current.render(svgRef.current, data);

    return () => chartRef.current?.destroy();
  }, [data, config]);

  return <svg ref={svgRef} className={`risk-heatmap ${className}`} />;
}