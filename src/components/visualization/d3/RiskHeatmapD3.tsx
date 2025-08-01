'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { DEFAULT_CONFIG } from '@/lib/visualization/d3-base';

export interface RiskHeatmapHandle {
  getSvg: () => SVGSVGElement | null;
}

type HeatmapDatum = {
  occupation: string;
  industry: string;
  riskScore: number;   // 0..1
  employment: number;  // numeric
  confidence: number;  // 0..1
};

interface RiskHeatmapD3Props {
  data: HeatmapDatum[];
  className?: string;
  width?: number;
  height?: number;
}

const RiskHeatmapD3 = forwardRef<RiskHeatmapHandle, RiskHeatmapD3Props>(function RiskHeatmapD3(
  { data, className = '', width = 320, height = 220 },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);

  useImperativeHandle(ref, () => ({
    getSvg: () => svgRef.current,
  }));

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const margin = { top: 24, right: 16, bottom: 72, left: 120 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    // Derive axes domains
    const industries = Array.from(new Set(data.map(d => d.industry)));
    const occupations = Array.from(new Set(data.map(d => d.occupation)));

    const x = d3.scaleBand().domain(industries).range([0, w]).padding(0.05);
    const y = d3.scaleBand().domain(occupations).range([0, h]).padding(0.05);

    const color = d3.scaleLinear<string>()
      .domain([0, 0.4, 0.7, 1.0])
      .range(['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c']);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Axes
    const xAxis = d3.axisBottom(x).tickSize(0);
    const yAxis = d3.axisLeft(y).tickSize(0);

    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(xAxis as any)
      .selectAll('text')
      .attr('fill', '#374151')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
      .attr('transform', 'rotate(-35)')
      .style('text-anchor', 'end');
    g.selectAll('g .domain, g .tick line').attr('stroke', '#e5e7eb');

    g.append('g')
      .call(yAxis as any)
      .selectAll('text')
      .attr('fill', '#374151')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small);
    g.selectAll('g .domain, g .tick line').attr('stroke', '#e5e7eb');

    // Tooltip
    const container = d3.select(svgRef.current.parentElement as HTMLElement).style('position', 'relative');
    const tooltip = container.append('div')
      .attr('class', 'd3-tooltip')
      .style('opacity', 0);

    // Cells
    g.selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => x(d.industry) ?? 0)
      .attr('y', d => y(d.occupation) ?? 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 2)
      .attr('fill', d => color(d.riskScore))
      .attr('opacity', d => 0.7 + 0.3 * (d.confidence ?? 0.8))
      .on('mouseenter', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(
            `<div>
              <div style="font-weight:600;margin-bottom:4px;">${d.occupation}</div>
              <div>Industry: ${d.industry}</div>
              <div>Risk: ${(d.riskScore * 100).toFixed(1)}%</div>
              <div>Employment: ${Number.isFinite(d.employment) ? d.employment.toLocaleString() : '—'}</div>
              <div>Confidence: ${((d.confidence ?? 0) * 100).toFixed(0)}%</div>
            </div>`
          );
      })
      .on('mousemove', function (event) {
        tooltip
          .style('left', `${event.offsetX + 12}px`)
          .style('top', `${event.offsetY - 12}px`);
      })
      .on('mouseleave', function () {
        tooltip.style('opacity', 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height]);

  return <svg ref={svgRef} className={`risk-heatmap ${className}`} />;
});

export default RiskHeatmapD3;