"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { CostProjectionChartProps, CostProjectionDataPoint, CostProjectionMilestone } from './types/cost-projection.types';
import { useCostProjection } from '@/hooks/use-cost-projection';

export const CostProjectionChart: React.FC<CostProjectionChartProps> = ({
  humanHourlyCost,
  aiHourlyCost,
  hoursPerWeek,
  weeksPerYear,
  config,
  width = '100%',
  height = 300,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Get projection data from hook
  const { data, milestones } = useCostProjection(
    humanHourlyCost,
    aiHourlyCost,
    hoursPerWeek,
    weeksPerYear,
    config
  );
  
  // Set up resize observer for responsive behavior
  useEffect(() => {
    if (!svgRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    
    resizeObserver.observe(svgRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || !data.length || dimensions.width === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous rendering
    
    // Chart dimensions - increased margins to prevent overlapping
    const margin = { top: 40, right: 40, bottom: 60, left: 70 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    
    // Create chart group with margins
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // X scale (time periods)
    const x = d3.scaleBand()
      .domain(data.map(d => d.period))
      .range([0, width])
      .padding(0.4); // Increased padding for better spacing
    
    // Y scale (costs)
    const maxCost = d3.max(data, d => Math.max(d.humanCost, d.aiCost)) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxCost * 1.15]) // Increased padding to 15%
      .range([height, 0]);
    
    // Y scale for cumulative savings (can be negative)
    const maxSavings = d3.max(data, d => d.cumulativeSavings) || 0;
    const minSavings = d3.min(data, d => d.cumulativeSavings) || 0;
    const savingsExtent = Math.max(Math.abs(minSavings), Math.abs(maxSavings));
    
    const ySavings = d3.scaleLinear()
      .domain([-savingsExtent * 1.1, savingsExtent * 1.1]) // Added padding
      .range([height, 0]);
    
    // Line generators with curve interpolation for smoother lines
    const humanLine = d3.line<CostProjectionDataPoint>()
      .x(d => (x(d.period) || 0) + x.bandwidth() / 2)
      .y(d => y(d.humanCost))
      .curve(d3.curveMonotoneX); // Smoother curve
    
    const aiLine = d3.line<CostProjectionDataPoint>()
      .x(d => (x(d.period) || 0) + x.bandwidth() / 2)
      .y(d => y(d.aiCost))
      .curve(d3.curveMonotoneX); // Smoother curve
    
    // Area generator for cumulative savings
    const savingsArea = d3.area<CostProjectionDataPoint>()
      .x(d => (x(d.period) || 0) + x.bandwidth() / 2)
      .y0(ySavings(0))
      .y1(d => ySavings(d.cumulativeSavings))
      .curve(d3.curveMonotoneX); // Smoother curve
    
    // Add grid lines for better readability
    chart.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '4,4');
    
    // Draw axes with improved styling
    chart.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-30)') // Less rotation for better readability
      .style('text-anchor', 'end')
      .attr('dx', '-.5em')
      .attr('dy', '.5em')
      .style('font-size', '12px')
      .style('font-weight', '500'); // Slightly bolder
    
    chart.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => `$${d3.format(',.0f')(d as number)}`))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '500'); // Slightly bolder
    
    // Draw cumulative savings area if enabled
    if (config?.showCumulativeSavings !== false) {
      chart.append('path')
        .datum(data)
        .attr('fill', d => {
          // Green for positive savings, red for negative
          const lastValue = d[d.length - 1].cumulativeSavings;
          return lastValue >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        })
        .attr('stroke', 'none')
        .attr('d', savingsArea);
    }
    
    // Draw human cost line
    chart.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6') // Blue
      .attr('stroke-width', 2.5) // Slightly thicker
      .attr('d', humanLine);
    
    // Draw AI cost line
    chart.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444') // Red
      .attr('stroke-width', 2.5) // Slightly thicker
      .attr('d', aiLine);
    
    // Add dots for each data point
    chart.selectAll('.human-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'human-dot')
      .attr('cx', d => (x(d.period) || 0) + x.bandwidth() / 2)
      .attr('cy', d => y(d.humanCost))
      .attr('r', 5) // Slightly larger
      .attr('fill', '#3b82f6')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);
    
    chart.selectAll('.ai-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'ai-dot')
      .attr('cx', d => (x(d.period) || 0) + x.bandwidth() / 2)
      .attr('cy', d => y(d.aiCost))
      .attr('r', 5) // Slightly larger
      .attr('fill', '#ef4444')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);
    
    // Add milestone annotations if enabled with improved visibility
    if (config?.showAnnotations !== false && milestones.length > 0) {
      milestones.forEach(milestone => {
        // Find the closest data point
        const closestPoint = data.find(d => d.period === milestone.period);
        if (!closestPoint) return;
        
        const mx = (x(milestone.period) || 0) + x.bandwidth() / 2;
        const my = milestone.type === 'break-even' 
          ? ySavings(0) 
          : y(closestPoint.aiCost);
        
        // Add milestone background for better visibility
        chart.append('rect')
          .attr('x', mx - 40)
          .attr('y', my - 35)
          .attr('width', 80)
          .attr('height', 20)
          .attr('rx', 4)
          .attr('fill', milestone.type === 'break-even' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)')
          .attr('stroke', milestone.type === 'break-even' ? '#10b981' : '#f59e0b')
          .attr('stroke-width', 1);
        
        // Add milestone marker with improved visibility
        chart.append('circle')
          .attr('cx', mx)
          .attr('cy', my)
          .attr('r', 7) // Larger radius
          .attr('fill', milestone.type === 'break-even' ? '#10b981' : '#f59e0b')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
        
        // Add milestone label with improved positioning and visibility
        chart.append('text')
          .attr('x', mx)
          .attr('y', my - 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', milestone.type === 'break-even' ? '#10b981' : '#f59e0b')
          .text(milestone.label);
      });
    }
    
    // Add legend with improved styling
    const legend = chart.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 10)`);
    
    // Add legend background
    legend.append('rect')
      .attr('x', -10)
      .attr('y', -5)
      .attr('width', 160)
      .attr('height', 80)
      .attr('rx', 4)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);
    
    // Human cost legend
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 15)
      .attr('x2', 20)
      .attr('y2', 15)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5);
    
    legend.append('text')
      .attr('x', 30)
      .attr('y', 19)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text('Human Labor');
    
    // AI cost legend
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 40)
      .attr('x2', 20)
      .attr('y2', 40)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2.5);
    
    legend.append('text')
      .attr('x', 30)
      .attr('y', 44)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text('AI Replacement');
    
    // Savings area legend
    if (config?.showCumulativeSavings !== false) {
      legend.append('rect')
        .attr('x', 0)
        .attr('y', 55)
        .attr('width', 20)
        .attr('height', 10)
        .attr('fill', 'rgba(34, 197, 94, 0.2)');
      
      legend.append('text')
        .attr('x', 30)
        .attr('y', 64)
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text('Cumulative Savings');
    }
    
    // Add axis labels with improved positioning
    chart.append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text('Time Period');
    
    chart.append('text')
      .attr('class', 'y-axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${-margin.left + 20}, ${height / 2}) rotate(-90)`)
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text('Cost ($)');
    
    // Add tooltip functionality with improved styling
    const tooltip = d3.select(tooltipRef.current);
    
    // Create invisible overlay for better tooltip tracking
    const overlay = chart.append('g')
      .attr('class', 'overlay');
    
    data.forEach((d, i) => {
      const barWidth = x.bandwidth();
      const barX = (x(d.period) || 0);
      
      overlay.append('rect')
        .attr('x', barX)
        .attr('y', 0)
        .attr('width', barWidth)
        .attr('height', height)
        .attr('fill', 'transparent')
        .on('mouseover', (event) => {
          tooltip
            .style('opacity', 1)
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 30}px`)
            .html(`
              <div class="p-3 rounded-md">
                <div class="font-medium text-base mb-1">${d.period}</div>
                <div class="text-blue-600 font-medium">Human: $${d3.format(',.0f')(d.humanCost)}</div>
                <div class="text-red-600 font-medium">AI: $${d3.format(',.0f')(d.aiCost)}</div>
                <div class="${d.cumulativeSavings >= 0 ? 'text-green-600' : 'text-red-600'} font-medium mt-1">
                  Cumulative ${d.cumulativeSavings >= 0 ? 'Savings' : 'Loss'}: $${d3.format(',.0f')(Math.abs(d.cumulativeSavings))}
                </div>
              </div>
            `);
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    });
    
  }, [data, milestones, dimensions, config]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg 
        ref={svgRef}
        width="100%"
        height="100%"
        className="overflow-visible"
      />
      <div 
        ref={tooltipRef}
        className="absolute pointer-events-none bg-white shadow-md rounded-md text-xs z-10 transition-opacity duration-300 opacity-0"
        style={{ 
          transform: 'translate(-50%, -100%)',
          border: '1px solid #e2e8f0'
        }}
      />
    </div>
  );
};
