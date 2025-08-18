import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BarItem {
  label: string;
  value: number;
}

interface AutomationExposureBarProps {
  items: BarItem[];
  width?: number;
  height?: number;
  maxBars?: number;
  ariaLabel?: string;
  className?: string;
}

export function AutomationExposureBar({
  items = [],
  width = 640,
  height = 240,
  maxBars = 8,
  ariaLabel = 'Automation exposure by task',
  className = ''
}: AutomationExposureBarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Clamp values to 0-100 range
  const clampedItems = items.map(item => ({
    ...item,
    value: Math.max(0, Math.min(100, item.value))
  })).slice(0, maxBars);

  useEffect(() => {
    if (!svgRef.current || clampedItems.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render
    
    const margin = { top: 20, right: 30, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const yScale = d3.scaleBand()
      .domain(clampedItems.map((d, i) => i.toString()))
      .range([0, innerHeight])
      .padding(0.1);
      
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);
    
    // Color scale (red for high exposure)
    const colorScale = d3.scaleSequential([0, 100], d3.interpolateOranges);
    
    // Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Bars
    const bars = g.selectAll('.bar')
      .data(clampedItems)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d, i) => yScale(i.toString()) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', d => colorScale(d.value))
      .attr('rx', 4) // Rounded corners
      .attr('ry', 4);
    
    // Animate bars if not reduced motion
    if (!prefersReducedMotion) {
      bars.transition()
        .duration(800)
        .attr('width', d => xScale(d.value));
    } else {
      bars.attr('width', d => xScale(d.value));
    }
    
    // Labels (task names, left side)
    g.selectAll('.label')
      .data(clampedItems)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', -10)
      .attr('y', (d, i) => (yScale(i.toString()) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text(d => {
        // Truncate long labels
        if (d.label.length > 25) {
          return d.label.substring(0, 22) + '...';
        }
        return d.label;
      })
      .style('font-size', '12px')
      .style('fill', '#374151'); // gray-700 for good contrast
    
    // Value labels (percentages, right side)
    g.selectAll('.value')
      .data(clampedItems)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', d => xScale(d.value) + 5)
      .attr('y', (d, i) => (yScale(i.toString()) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .text(d => `${Math.round(d.value)}%`)
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#111827'); // gray-900 for strong contrast
    
    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);
      
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#6B7280'); // gray-600 for axis ticks

    // Style axis line and ticks for visibility
    g.select('.x-axis')
      .selectAll('path, line')
      .style('stroke', '#E5E7EB'); // gray-200 grid/axis
      
    // X-axis label
    g.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .text('Automation Risk')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#4B5563'); // gray-600/700 label
      
  }, [clampedItems, width, height]);
  
  return (
    <div className={`w-full ${className}`}>
      <svg 
        ref={svgRef}
        width="100%" 
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="overflow-visible"
      />
    </div>
  );
}
