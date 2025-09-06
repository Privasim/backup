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
  width = '100%',
  height = 422, // Increased by 30% for better visibility
  className = '',
  config
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
    
    // Chart dimensions with proper margins for legend space
    const margin = { top: 40, right: 140, bottom: 60, left: 70 };
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
    
    // Draw cost difference area if enabled (renamed from cumulative savings)
    if (config?.showCumulativeSavings !== false) {
      chart.append('path')
        .datum(data)
        .attr('fill', d => {
          // More alarming colors to reflect job replacement message
          // Red for all cost differences to emphasize job replacement threat
          const lastValue = d[d.length - 1].cumulativeSavings;
          return lastValue >= 0 ? 'rgba(220, 38, 38, 0.15)' : 'rgba(239, 68, 68, 0.25)';
        })
        .attr('stroke', 'none')
        .attr('d', savingsArea);
    }
    
    // Draw human cost line with updated colors
    chart.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6') // Blue for human labor
      .attr('stroke-width', 3) // Thicker for better visibility
      .attr('d', humanLine);
    
    // Draw AI cost line with more alarming color
    chart.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#dc2626') // More intense red for AI replacement
      .attr('stroke-width', 3) // Thicker for better visibility
      .attr('d', aiLine);
    
    // Add dots for each data point with updated colors and sizes
    chart.selectAll('.human-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'human-dot')
      .attr('cx', d => (x(d.period) || 0) + x.bandwidth() / 2)
      .attr('cy', d => y(d.humanCost))
      .attr('r', 6) // Larger for better visibility
      .attr('fill', '#3b82f6') // Blue for human labor
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);
    
    chart.selectAll('.ai-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'ai-dot')
      .attr('cx', d => (x(d.period) || 0) + x.bandwidth() / 2)
      .attr('cy', d => y(d.aiCost))
      .attr('r', 6) // Larger for better visibility
      .attr('fill', '#dc2626') // More intense red for AI replacement
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);
    
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
        
        // Add milestone background with more alarming colors
        chart.append('rect')
          .attr('x', mx - 40)
          .attr('y', my - 35)
          .attr('width', 80)
          .attr('height', 20)
          .attr('rx', 4)
          .attr('fill', milestone.type === 'break-even' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(234, 88, 12, 0.1)')
          .attr('stroke', milestone.type === 'break-even' ? '#b91c1c' : '#c2410c')
          .attr('stroke-width', 1);
        
        // Add milestone marker with updated colors
        chart.append('circle')
          .attr('cx', mx)
          .attr('cy', my)
          .attr('r', 8) // Even larger radius for better visibility
          .attr('fill', milestone.type === 'break-even' ? '#b91c1c' : '#c2410c') // More alarming colors
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
        
        // Add milestone label with improved positioning and visibility
        chart.append('text')
          .attr('x', mx)
          .attr('y', my - 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', milestone.type === 'break-even' ? '#b91c1c' : '#c2410c') // More alarming colors
          .text(milestone.label);
      });
    }
    
    // Add legend positioned within the margin area
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left + width + 10}, ${margin.top + 10})`);
    
    // Add legend background with proper sizing
    legend.append('rect')
      .attr('x', -5)
      .attr('y', -5)
      .attr('width', 120)
      .attr('height', 80)
      .attr('rx', 4)
      .attr('fill', 'rgba(255, 255, 255, 0.95)')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1);
    
    // Legend items with proper spacing
    legend.append('line')
      .attr('x1', 5)
      .attr('y1', 15)
      .attr('x2', 20)
      .attr('y2', 15)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3);
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 18)
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text('Human Labor');
    
    legend.append('line')
      .attr('x1', 5)
      .attr('y1', 35)
      .attr('x2', 20)
      .attr('y2', 35)
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 3);
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 38)
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text('AI Replacement');
    
    if (config?.showCumulativeSavings !== false) {
      legend.append('rect')
        .attr('x', 5)
        .attr('y', 50)
        .attr('width', 15)
        .attr('height', 8)
        .attr('fill', 'rgba(220, 38, 38, 0.15)');
      
      legend.append('text')
        .attr('x', 25)
        .attr('y', 57)
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .text('Cost Difference');
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
                <div class="text-red-600 font-medium mt-1">
                  Cost Difference: $${d3.format(',.0f')(Math.abs(d.cumulativeSavings))}
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
    <div className={`relative w-full ${className}`} style={{ width, height }}>
      <svg 
        ref={svgRef}
        width="100%"
        height="100%"
        className="overflow-hidden"
        viewBox={dimensions.width > 0 ? `0 0 ${dimensions.width} ${dimensions.height}` : "0 0 100 100"}
        preserveAspectRatio="xMidYMid meet"
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
