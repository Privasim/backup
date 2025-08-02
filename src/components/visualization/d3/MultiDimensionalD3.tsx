'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { DEFAULT_CONFIG, PROFESSIONAL_COLORS } from '@/lib/visualization/d3-base';

export interface MultiDimensionalHandle {
  getSvg: () => SVGSVGElement | null;
}

interface MultiDimensionalData {
  id: string;
  name: string;
  riskScore: number;      // x-axis (0-1)
  employment: number;     // y-axis (millions)
  automationPotential: number; // size (0-1)
  growthRate: number;     // color (-0.1 to 0.1)
  category: 'occupation' | 'industry';
  metadata?: any;
}

interface MultiDimensionalD3Props {
  data: MultiDimensionalData[];
  mode: 'scatter' | 'parallel' | 'treemap';
  onDrillDown?: (item: MultiDimensionalData) => void;
  className?: string;
  width?: number;
  height?: number;
}

const MultiDimensionalD3 = forwardRef<MultiDimensionalHandle, MultiDimensionalD3Props>(function MultiDimensionalD3(
  { data, mode = 'scatter', onDrillDown, className = '', width = 480, height = 320 },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getSvg: () => svgRef.current,
  }));

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    if (mode === 'scatter') {
      renderScatterPlot(g, data, w, h);
    } else if (mode === 'parallel') {
      renderParallelCoordinates(g, data, w, h);
    } else if (mode === 'treemap') {
      renderTreemap(g, data, w, h);
    }

    // Add tooltip
    const tooltip = d3.select(containerRef.current)
      .selectAll('.d3-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'd3-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    // Add interactions
    svg.selectAll('.data-point')
      .on('mouseenter', function(event, d: MultiDimensionalData) {
        tooltip
          .style('opacity', 1)
          .html(`
            <div>
              <div style="font-weight:600;margin-bottom:4px;">${d.name}</div>
              <div>Risk Score: ${(d.riskScore * 100).toFixed(1)}%</div>
              <div>Employment: ${d.employment.toFixed(1)}M</div>
              <div>Automation: ${(d.automationPotential * 100).toFixed(1)}%</div>
              <div>Growth: ${(d.growthRate * 100).toFixed(1)}%</div>
            </div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.offsetX + 12}px`)
          .style('top', `${event.offsetY - 12}px`);
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
      })
      .on('click', function(event, d: MultiDimensionalData) {
        if (onDrillDown) {
          onDrillDown(d);
        }
      });

    return () => {
      tooltip.remove();
    };
  }, [data, mode, width, height, onDrillDown]);

  const renderScatterPlot = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: MultiDimensionalData[], w: number, h: number) => {
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.riskScore) || 1])
      .range([0, w])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.employment) || 1])
      .range([h, 0])
      .nice();

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.automationPotential) || 1])
      .range([4, 20]);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([d3.min(data, d => d.growthRate) || -0.1, d3.max(data, d => d.growthRate) || 0.1]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${(d as number * 100).toFixed(0)}%`))
      .selectAll('text')
      .style('font-size', DEFAULT_CONFIG.styling.fonts.size.small);

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}M`))
      .selectAll('text')
      .style('font-size', DEFAULT_CONFIG.styling.fonts.size.small);

    // Axis labels
    g.append('text')
      .attr('x', w / 2)
      .attr('y', h + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
      .style('fill', '#374151')
      .text('Risk Score');

    g.append('text')
      .attr('x', -h / 2)
      .attr('y', -40)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .style('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
      .style('fill', '#374151')
      .text('Employment (millions)');

    // Data points
    g.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.riskScore))
      .attr('cy', d => yScale(d.employment))
      .attr('r', d => sizeScale(d.automationPotential))
      .attr('fill', d => colorScale(d.growthRate))
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .transition()
      .duration(750)
      .attr('r', d => sizeScale(d.automationPotential));
  };

  const renderParallelCoordinates = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: MultiDimensionalData[], w: number, h: number) => {
    const dimensions = ['riskScore', 'employment', 'automationPotential', 'growthRate'];
    const xScale = d3.scalePoint().domain(dimensions).range([0, w]);

    const scales: { [key: string]: d3.ScaleLinear<number, number> } = {};
    dimensions.forEach(dim => {
      scales[dim] = d3.scaleLinear()
        .domain(d3.extent(data, d => d[dim as keyof MultiDimensionalData] as number) as [number, number])
        .range([h, 0])
        .nice();
    });

    // Draw axes
    dimensions.forEach(dim => {
      const axis = g.append('g')
        .attr('transform', `translate(${xScale(dim)},0)`)
        .call(d3.axisLeft(scales[dim]).ticks(5));

      axis.append('text')
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
        .style('fill', '#374151')
        .text(dim.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
    });

    // Draw lines
    const line = d3.line<[string, number]>()
      .x(d => xScale(d[0])!)
      .y(d => scales[d[0]](d[1]));

    g.selectAll('.data-point')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'data-point')
      .attr('d', d => line(dimensions.map(dim => [dim, d[dim as keyof MultiDimensionalData] as number])))
      .attr('fill', 'none')
      .attr('stroke', PROFESSIONAL_COLORS.primary[0])
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.6)
      .style('cursor', 'pointer');
  };

  const renderTreemap = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: MultiDimensionalData[], w: number, h: number) => {
    const hierarchy = d3.hierarchy({ children: data } as any)
      .sum(d => (d as MultiDimensionalData).employment || 0);

    const treemap = d3.treemap<MultiDimensionalData>()
      .size([w, h])
      .padding(2);

    const root = treemap(hierarchy);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain([0, d3.max(data, d => d.riskScore) || 1]);

    const cells = g.selectAll('.cell')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'cell data-point')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    cells.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale(d.data.riskScore))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    cells.append('text')
      .attr('x', 4)
      .attr('y', 16)
      .style('font-size', '10px')
      .style('fill', '#fff')
      .style('font-weight', 'bold')
      .text(d => d.data.name.length > 15 ? d.data.name.substring(0, 15) + '...' : d.data.name);
  };

  return (
    <div ref={containerRef} className={`multi-dimensional-chart ${className}`} style={{ position: 'relative' }}>
      <svg ref={svgRef} />
    </div>
  );
});

export default MultiDimensionalD3;