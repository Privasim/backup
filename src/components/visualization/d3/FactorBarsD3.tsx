'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { DEFAULT_CONFIG } from '@/lib/visualization/d3-base';

export interface FactorBarsHandle {
  getSvg: () => SVGSVGElement | null;
}

type Factor = { label: string; value: number; hint?: string };

interface FactorBarsD3Props {
  factors: Factor[]; // value expected 0-100
  className?: string;
  width?: number;
  height?: number;
}

const FactorBarsD3 = forwardRef<FactorBarsHandle, FactorBarsD3Props>(function FactorBarsD3(
  { factors, className = '', width = 320, height = 160 },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  useImperativeHandle(ref, () => ({ getSvg: () => svgRef.current }));

  useEffect(() => {
    if (!svgRef.current || !factors?.length) return;

    const margin = { top: 8, right: 12, bottom: 20, left: 80 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const data = factors.map((f) => ({ ...f, value: Math.max(0, Math.min(100, f.value)) }));

    const y = d3.scaleBand().domain(data.map((d) => d.label)).range([0, h]).padding(0.25);
    const x = d3.scaleLinear().domain([0, 100]).range([0, w]);

    const color = d3.scaleLinear<string>().domain([0, 50, 100]).range(['#2ecc71', '#f1c40f', '#e74c3c']);

    const yAxis = d3.axisLeft(y).tickSize(0);
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis as any)
      .selectAll('text')
      .attr('fill', '#374151')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
      .attr('font-weight', DEFAULT_CONFIG.styling.fonts.weight.bold);
    g.select('.y-axis').selectAll('path,line').remove();

    const xAxis = d3.axisBottom(x).ticks(4).tickFormat((d: any) => `${d}%`);
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(xAxis as any)
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small);

    g.selectAll('.bar-bg')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-bg')
      .attr('x', 0)
      .attr('y', (d) => y(d.label)!)
      .attr('width', w)
      .attr('height', y.bandwidth())
      .attr('fill', '#f3f4f6');

    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => y(d.label)!)
      .attr('height', y.bandwidth())
      .attr('fill', (d) => color(d.value))
      .attr('rx', 4)
      .attr('width', 0);

    bars.transition().duration(600).attr('width', (d) => x(d.value));

    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => x(d.value) + 6)
      .attr('y', (d) => y(d.label)! + y.bandwidth() / 2)
      .attr('dy', '0.32em')
      .attr('fill', '#111827')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
      .attr('font-weight', DEFAULT_CONFIG.styling.fonts.weight.bold)
      .text((d) => `${d.value}%`);
  }, [factors, width, height]);

  return <svg ref={svgRef} className={className} />;
});

export default FactorBarsD3;