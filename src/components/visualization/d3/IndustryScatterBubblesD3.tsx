'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { DEFAULT_CONFIG } from '@/lib/visualization/d3-base';

export interface IndustryScatterHandle {
  getSvg: () => SVGSVGElement | null;
}

type IndustryBubble = {
  industry: string;
  exposureScore: number; // 0..1
  employment: number;    // millions (numeric)
  naicsCode: string;
};

interface IndustryScatterBubblesD3Props {
  data: IndustryBubble[];
  className?: string;
  width?: number;
  height?: number;
}

const IndustryScatterBubblesD3 = forwardRef<IndustryScatterHandle, IndustryScatterBubblesD3Props>(function IndustryScatterBubblesD3(
  { data, className = '', width = 320, height = 220 },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  useImperativeHandle(ref, () => ({ getSvg: () => svgRef.current }));

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const margin = { top: 16, right: 16, bottom: 36, left: 46 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, d3.max(data, (d) => d.exposureScore)! || 1]).nice().range([0, w]);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.employment)! || 1]).nice().range([h, 0]);

    const r = d3.scaleSqrt().domain(d3.extent(data, (d) => d.employment) as [number, number]).range([4, 16]);
    const color = d3.scaleQuantile<string>().domain(data.map((d) => d.exposureScore)).range(['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c']);

    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(4))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small);
    g.append('g')
      .call(d3.axisLeft(y).ticks(4))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small);

    g.append('text')
      .attr('x', w / 2)
      .attr('y', h + 28)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
      .text('Exposure Score');

    g.append('text')
      .attr('x', -h / 2)
      .attr('y', -34)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
      .text('Employment (millions)');

    const tooltip = d3.select(svgRef.current.parentElement).style('position', 'relative').append('div').attr('class', 'd3-tooltip').style('opacity', 0);

    const bubbles = g
      .selectAll('.bubble')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('cx', (d) => x(d.exposureScore))
      .attr('cy', (d) => y(d.employment))
      .attr('r', (d) => r(d.employment))
      .attr('fill', (d) => color(d.exposureScore))
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    bubbles
      .on('mouseenter', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(
            `<div>
              <div style="font-weight:600;margin-bottom:4px;">${d.industry}</div>
              <div>Exposure: ${(d.exposureScore * 100).toFixed(1)}%</div>
              <div>Employment: ${d.employment.toFixed(1)}M</div>
              <div>NAICS: ${d.naicsCode}</div>
            </div>`
          );
      })
      .on('mousemove', function (event) {
        tooltip.style('left', `${event.offsetX + 12}px`).style('top', `${event.offsetY - 12}px`);
      })
      .on('mouseleave', function () {
        tooltip.style('opacity', 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height]);

  return <svg ref={svgRef} className={className} />;
});

export default IndustryScatterBubblesD3;