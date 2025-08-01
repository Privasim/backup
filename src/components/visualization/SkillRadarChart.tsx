'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { D3ChartComponent, D3ChartConfig, DEFAULT_CONFIG, PROFESSIONAL_COLORS } from '@/lib/visualization/d3-base';

export interface SkillRadarData {
  skillCategory: string;
  currentLevel: number;
  requiredLevel: number;
  importance: number;
}

interface SkillRadarChartProps {
  data: SkillRadarData[];
  config?: Partial<D3ChartConfig>;
  className?: string;
}

class SkillRadarChartImpl implements D3ChartComponent {
  private svg: d3.Selection<SVGElement, unknown, null, undefined> | null = null;
  private config: D3ChartConfig;

  constructor(config: D3ChartConfig) {
    this.config = config;
  }

  render(container: SVGElement, data: SkillRadarData[]): void {
    const { width, height, margin } = this.config.dimensions;
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right, margin.bottom, margin.left);
    
    this.svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    const g = this.svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    const angleScale = d3.scaleLinear().domain([0, data.length]).range([0, 2 * Math.PI]);
    const radiusScale = d3.scaleLinear().domain([0, 10]).range([0, radius]);

    // Draw radar grid
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      g.append('circle')
        .attr('r', radius * i / levels)
        .attr('fill', 'none')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);
    }

    // Draw axes
    data.forEach((d, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius * Math.cos(angle))
        .attr('y2', radius * Math.sin(angle))
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);
    });

    // Draw data areas
    const line = d3.line<SkillRadarData>()
      .x((d, i) => radiusScale(d.currentLevel) * Math.cos(angleScale(i) - Math.PI / 2))
      .y((d, i) => radiusScale(d.currentLevel) * Math.sin(angleScale(i) - Math.PI / 2))
      .curve(d3.curveLinearClosed);

    g.append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', PROFESSIONAL_COLORS.primary[0])
      .attr('fill-opacity', 0.3)
      .attr('stroke', PROFESSIONAL_COLORS.primary[0])
      .attr('stroke-width', 2);
  }

  update(data: SkillRadarData[]): void {
    if (!this.svg) return;
    // Update implementation would go here
  }

  destroy(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }
}

export default function SkillRadarChart({ data, config = {}, className = '' }: SkillRadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<SkillRadarChartImpl | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    chartRef.current = new SkillRadarChartImpl(mergedConfig);
    chartRef.current.render(svgRef.current, data);

    return () => chartRef.current?.destroy();
  }, [data, config]);

  return <svg ref={svgRef} className={`skill-radar-chart ${className}`} />;
}