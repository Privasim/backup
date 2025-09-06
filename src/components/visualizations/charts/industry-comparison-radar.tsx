"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { IndustryComparisonRadarProps } from './types/radar-chart.types';
import { useIndustryComparison } from '@/hooks/use-industry-comparison';

export const IndustryComparisonRadar: React.FC<IndustryComparisonRadarProps> = ({
  userProfile,
  industryData,
  width = '100%',
  height = 585, // Increased by 30% for better visibility
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Get comparison data from hook
  const radarData = useIndustryComparison(userProfile, industryData);
  
  // Define more alarming color scheme to reflect job replacement message
  const colorScheme = {
    userProfile: '#3b82f6', // Keep user profile blue
    technology: '#dc2626', // More intense red for technology
    finance: '#ea580c',    // Orange for finance
    healthcare: '#059669'  // Green for healthcare
  };
  
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
    if (!svgRef.current || dimensions.width === 0 || !radarData) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous rendering
    
    // Chart dimensions with proper margins for legend space
    const margin = { top: 40, right: 120, bottom: 40, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2.5; // Reduced to prevent overflow
    
    // Create chart group with margins
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left + width / 2}, ${margin.top + height / 2})`);
    
    // Extract metrics and all series
    const metrics = Object.keys(radarData.metrics);
    const allSeries = [radarData.userProfile, ...radarData.industryProfiles];
    
    // Angle scale
    const angleScale = d3.scalePoint()
      .domain(metrics)
      .range([0, 2 * Math.PI]);
    
    // Radius scale with proper padding
    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([radius * 0.1, radius * 0.9]); // Proper scaling within bounds
    
    // Draw radar grid with improved styling
    const gridLevels = 4; // Reduced to 4 levels for cleaner look
    for (let i = 1; i <= gridLevels; i++) {
      const gridRadius = radiusScale.range()[1] * i / gridLevels;
      
      chart.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', gridRadius)
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3'); // Smaller dash pattern
      
      // Add value labels for grid levels
      if (i < gridLevels) { // Skip the outermost to prevent overlap with axis labels
        chart.append('text')
          .attr('x', 0)
          .attr('y', -gridRadius)
          .attr('dy', -2)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#9ca3af')
          .text(`${Math.round(i / gridLevels * 100)}%`);
      }
    }
    
    // Draw axis lines with improved styling
    metrics.forEach(metric => {
      const angle = angleScale(metric) || 0;
      const x = radiusScale.range()[1] * Math.sin(angle);
      const y = -radiusScale.range()[1] * Math.cos(angle);
      
      chart.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 1.5); // Slightly thicker for better visibility
      
      // Calculate label position with proper spacing
      const labelDistance = 1.1; // Proper distance for labels
      const labelX = labelDistance * x;
      const labelY = labelDistance * y;
      
      // Add background for axis labels to improve readability
      chart.append('rect')
        .attr('x', labelX - 40)
        .attr('y', labelY - 10)
        .attr('width', 80)
        .attr('height', 20)
        .attr('transform', `rotate(${angle * 180 / Math.PI}, ${labelX}, ${labelY})`)
        .attr('fill', 'rgba(255, 255, 255, 0.8)')
        .attr('rx', 4)
        .style('opacity', 0.8);
      
      // Add axis labels with improved positioning
      chart.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .attr('fill', '#4b5563')
        .text(radarData.metrics[metric].label);
    });
    
    // Create line generator for radar paths with smoother curve
    const radarLine = d3.lineRadial<any>()
      .angle(d => angleScale(d.metric) || 0)
      .radius(d => radiusScale(d.value))
      .curve(d3.curveCardinalClosed.tension(0.6)); // Smoother curve
    
    // Draw radar paths for each series with improved styling and updated colors
    allSeries.forEach(series => {
      // Determine color based on series name
      const color = series.name === 'Your Profile' ? colorScheme.userProfile :
                   series.name === 'Technology' ? colorScheme.technology :
                   series.name === 'Finance' ? colorScheme.finance :
                   colorScheme.healthcare;
      
      // Draw filled area
      chart.append('path')
        .datum(series.data)
        .attr('d', radarLine as any)
        .attr('fill', color)
        .attr('fill-opacity', series.name === 'Your Profile' ? 0.2 : 0.15) // Highlight user profile
        .attr('stroke', color)
        .attr('stroke-width', series.name === 'Your Profile' ? 3 : 2.5); // Emphasize user profile
      
      // Draw data points with improved styling and updated colors
      series.data.forEach(point => {
        const angle = angleScale(point.metric) || 0;
        const r = radiusScale(point.value);
        const x = r * Math.sin(angle);
        const y = -r * Math.cos(angle);
        
        // Determine color based on series name
        const color = series.name === 'Your Profile' ? colorScheme.userProfile :
                     series.name === 'Technology' ? colorScheme.technology :
                     series.name === 'Finance' ? colorScheme.finance :
                     colorScheme.healthcare;
        
        chart.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', series.name === 'Your Profile' ? 6 : 5) // Larger for user profile
          .attr('fill', color)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', series.name === 'Your Profile' ? 2.5 : 2) // Thicker for user profile
          .on('mouseover', (event) => {
            const tooltip = d3.select(tooltipRef.current);
            const metricInfo = radarData.metrics[point.metric];
            
            tooltip
              .style('opacity', 1)
              .style('left', `${event.pageX + 15}px`)
              .style('top', `${event.pageY - 30}px`)
              .html(`
                <div class="p-3 rounded-md">
                  <div class="font-medium text-base mb-1">${series.name}</div>
                  <div class="text-sm font-medium">${metricInfo.label}: ${formatValue(point.value, metricInfo.format)}</div>
                  <div class="text-xs text-gray-600 mt-1">${metricInfo.description}</div>
                </div>
              `);
          })
          .on('mouseout', () => {
            d3.select(tooltipRef.current).style('opacity', 0);
          });
      });
    });
    
    // Add legend positioned within the margin area
    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left + width + 10}, ${margin.top + 10})`);
    
    // Add legend background with proper sizing
    const legendWidth = 100;
    const legendHeight = allSeries.length * 20 + 10;
    
    legend.append('rect')
      .attr('x', -5)
      .attr('y', -5)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('rx', 4)
      .attr('fill', 'rgba(255, 255, 255, 0.95)')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1);
    
    // Add legend items with proper spacing
    allSeries.forEach((series, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(5, ${5 + i * 20})`);
      
      legendItem.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', series.color);
      
      legendItem.append('text')
        .attr('x', 15)
        .attr('y', 8)
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .text(series.name);
    });
    
  }, [radarData, dimensions]);
  
  // Helper function to format values
  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'percent':
        return `${(value * 100).toFixed(0)}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      default:
        return value.toString();
    }
  };

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
