'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { DEFAULT_CONFIG } from '@/lib/visualization/d3-base';

export interface RiskGaugeHandle {
  getSvg: () => SVGSVGElement | null;
}

interface RiskGaugeD3Props {
  score: number; // 0-100
  level: 'Low' | 'Medium' | 'High';
  className?: string;
  width?: number;
  height?: number;
}

const RiskGaugeD3 = forwardRef<RiskGaugeHandle, RiskGaugeD3Props>(function RiskGaugeD3(
  { score, level, className = '', width = 320, height = 140 },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);

  useImperativeHandle(ref, () => ({
    getSvg: () => svgRef.current,
  }));

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const radius = Math.min(w, h * 2);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height - margin.bottom})`);

    const startAngle = -Math.PI;
    const endAngle = 0;

    const arc = d3.arc<d3.DefaultArcObject>().innerRadius(radius * 0.55).outerRadius(radius * 0.75);

    const bands: Array<{ from: number; to: number; color: string }> = [
      { from: 0, to: 40, color: '#2ecc71' },
      { from: 40, to: 70, color: '#f1c40f' },
      { from: 70, to: 100, color: '#e74c3c' },
    ];

    const scale = d3.scaleLinear().domain([0, 100]).range([startAngle, endAngle]);

    g.selectAll('.band')
      .data(bands)
      .enter()
      .append('path')
      .attr('class', 'band')
      .attr('fill', (d) => d.color)
      .attr(
        'd',
        (d) =>
          arc({
            startAngle: scale(d.from)!,
            endAngle: scale(d.to)!,
            innerRadius: radius * 0.55,
            outerRadius: radius * 0.75,
          }) as string
      )
      .attr('opacity', 0.85);

    const ticks = [0, 20, 40, 60, 80, 100];
    const tickGroup = g.append('g');
    tickGroup
      .selectAll('line')
      .data(ticks)
      .enter()
      .append('line')
      .attr('x1', (d) => Math.cos(scale(d)!) * (radius * 0.78))
      .attr('y1', (d) => Math.sin(scale(d)!) * (radius * 0.78))
      .attr('x2', (d) => Math.cos(scale(d)!) * (radius * 0.72))
      .attr('y2', (d) => Math.sin(scale(d)!) * (radius * 0.72))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2);

    tickGroup
      .selectAll('text')
      .data(ticks)
      .enter()
      .append('text')
      .attr('x', (d) => Math.cos(scale(d)!) * (radius * 0.62))
      .attr('y', (d) => Math.sin(scale(d)!) * (radius * 0.62))
      .attr('fill', '#6b7280')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text((d) => `${d}`);

    const needleAngle = scale(Math.max(0, Math.min(100, score)))!;
    const needleLen = radius * 0.7;
    const needleGroup = g.append('g').attr('class', 'needle');

    needleGroup
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', Math.cos(needleAngle) * needleLen)
      .attr('y2', Math.sin(needleAngle) * needleLen)
      .attr('stroke', '#111827')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round');

    needleGroup.append('circle').attr('r', 4).attr('fill', '#111827');

    const labelGroup = svg.append('g').attr('transform', `translate(${width / 2}, ${margin.top + 6})`).attr('text-anchor', 'middle');

    labelGroup.append('text').attr('fill', '#111827').attr('font-size', 18).attr('font-weight', 700).text(`${score}%`);

    labelGroup
      .append('text')
      .attr('y', 20)
      .attr('fill', level === 'High' ? '#e74c3c' : level === 'Medium' ? '#f1c40f' : '#2ecc71')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text(`${level} Risk`);
  }, [score, level, width, height]);

  return <svg ref={svgRef} className={className} />;
});

export default RiskGaugeD3;