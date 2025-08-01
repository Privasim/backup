'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { D3ChartComponent, D3ChartConfig, DEFAULT_CONFIG, PROFESSIONAL_COLORS } from '@/lib/visualization/d3-base';

export interface IndustryBubbleData {
  industry: string;
  exposureScore: number;
  employment: number;
  growthRate: number;
  naicsCode: string;
}

interface IndustryBubbleChartProps {
  data: IndustryBubbleData[];
  config?: Partial<D3ChartConfig>;
  className?: string;
}

class IndustryBubbleChartImpl implements D3ChartComponent {
  private svg: d3.Selection<SVGElement, unknown, null, undefined> | null = null;
  private config: D3ChartConfig;

  constructor(config: D3ChartConfig) {
    this.config = config;
  }

  render(container: SVGElement, data: IndustryBubbleData[]): void {
    const { width, height, margin } = this.config.dimensions;
    
    this.svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain(d3.extent(data, d => d.exposureScore) as [number, number]).range([0, width - margin.left - margin.right]);
    const yScale = d3.scaleLinear().domain(d3.extent(data, d => d.growthRate) as [number, number]).range([height - margin.top - margin.bottom, 0]);
    const sizeScale = d3.scaleSqrt().domain(d3.extent(data, d => d.employment) as [number, number]).range([5, 30]);
    const colorScale = d3.scaleOrdinal(PROFESSIONAL_COLORS.categorical);

    g.selectAll('.bubble')
      .data(data)
      .enter().append('circle')
      .attr('class', 'bubble')
      .attr('cx', d => xScale(d.exposureScore))
      .attr('cy', d => yScale(d.growthRate))
      .attr('r', d => sizeScale(d.employment))
      .attr('fill', d => colorScale(d.industry))
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add axes
    g.append('g').attr('transform', `translate(0,${height - margin.top - margin.bottom})`).call(d3.axisBottom(xScale));
    g.append('g').call(d3.axisLeft(yScale));
  }

  update(data: IndustryBubbleData[]): void {
    if (!this.svg) return;
    // Update implementation would go here
  }

  destroy(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }
}

export default function IndustryBubbleChart({ data, config = {}, className = '' }: IndustryBubbleChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<IndustryBubbleChartImpl | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    chartRef.current = new IndustryBubbleChartImpl(mergedConfig);
    chartRef.current.render(svgRef.current, data);

    return () => chartRef.current?.destroy();
  }, [data, config]);

  return <svg ref={svgRef} className={`industry-bubble-chart ${className}`} />;
}