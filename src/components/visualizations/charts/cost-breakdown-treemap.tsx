"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { CostBreakdownTreemapProps, TreemapNode } from './types/treemap.types';
import { useCostBreakdown } from '@/hooks/use-cost-breakdown';

// Extended d3 hierarchy node type with treemap layout properties
interface TreemapHierarchyNode extends d3.HierarchyNode<TreemapNode> {
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
}

export const CostBreakdownTreemap: React.FC<CostBreakdownTreemapProps> = ({
  humanCosts,
  aiCosts,
  width = '100%',
  height = 550, // Further increased for better visibility
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Get treemap data from hook
  const treemapData = useCostBreakdown(humanCosts, aiCosts);
  
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
    if (!svgRef.current || dimensions.width === 0 || !treemapData) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous rendering
    
    // Chart dimensions with adjusted margins to maximize chart area and increase chart size by 20%
    const margin = { top: 15, right: 10, bottom: 10, left: 10 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    
    // Create chart group with margins
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create hierarchical data structure
    const root = d3.hierarchy(treemapData.root)
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));
    
    // Create treemap layout with improved padding
    const treemap = d3.treemap<TreemapNode>()
      .size([width, height])
      .paddingTop(28)
      .paddingRight(10)
      .paddingLeft(5)
      .paddingBottom(10)
      .paddingInner(5) // Increased inner padding for better separation
      .round(true);
    
    // Apply treemap layout
    treemap(root);
    
    // Color scale for risk levels - more intense to reflect job replacement message
    const colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([0, 1]);
      
    // Define more alarming color scheme
    const jobReplacementColors = {
      humanLabor: '#3b82f6',   // Blue for human labor
      aiReplacement: '#dc2626', // More intense red for AI replacement
      highRisk: '#991b1b',     // Dark red for high risk
      mediumRisk: '#dc2626',   // Medium red for medium risk
      lowRisk: '#ef4444'       // Light red for low risk
    };
    
    // Draw cells for each node
    const cell = chart
      .selectAll('g')
      .data(root.descendants() as TreemapHierarchyNode[])
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0 || 0},${d.y0 || 0})`);
    
    // Add rectangles for each cell with updated colors to reflect job replacement message
    cell
      .append('rect')
      .attr('width', d => (d.x1 || 0) - (d.x0 || 0))
      .attr('height', d => (d.y1 || 0) - (d.y0 || 0))
      .attr('fill', d => {
        // Color based on risk level with more alarming colors
        const risk = d.data.risk || 0;
        if (d.depth === 0) return '#ffffff'; // Root is white
        if (d.depth === 1) {
          return d.data.name === 'Human Labor' ? jobReplacementColors.humanLabor : jobReplacementColors.aiReplacement;
        }
        // Deeper levels: more intense risk-based color
        if (risk > 0.7) return jobReplacementColors.highRisk;
        if (risk > 0.4) return jobReplacementColors.mediumRisk;
        return jobReplacementColors.lowRisk;
      })
      .attr('stroke', d => d.depth < 2 ? '#ffffff' : '#e5e7eb')
      .attr('stroke-width', d => d.depth < 2 ? 2 : 1)
      .style('opacity', d => d.depth === 0 ? 0 : 1) // Hide root
      .on('mouseover', (event, d) => {
        // Show tooltip
        const tooltip = d3.select(tooltipRef.current);
        const data = d.data;
        
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 30}px`)
          .html(`
            <div class="p-2">
              <div class="font-medium">${data.name}</div>
              <div class="text-sm">Cost: $${d3.format(',.0f')(data.value)}</div>
              ${data.description ? `<div class="text-xs text-gray-600">${data.description}</div>` : ''}
              ${data.risk !== undefined ? `<div class="text-xs ${data.risk > 0.6 ? 'text-red-600' : data.risk > 0.3 ? 'text-amber-600' : 'text-green-600'}">
                Automation Risk: ${(data.risk * 100).toFixed(0)}%
              </div>` : ''}
            </div>
          `);
      })
      .on('mouseout', () => {
        d3.select(tooltipRef.current).style('opacity', 0);
      });
    
    // Add text labels for cells with improved text handling
    cell
      .filter(d => ((d.x1 || 0) - (d.x0 || 0)) > 50 && ((d.y1 || 0) - (d.y0 || 0)) > 25) // Increased minimum width
      .append('text')
      .attr('x', 5)
      .attr('y', 15)
      .attr('fill', d => d.depth === 1 ? '#ffffff' : '#000000')
      .attr('font-size', d => d.depth === 1 ? '14px' : '11px') // Smaller font for deeper levels
      .attr('font-weight', d => d.depth === 1 ? 'bold' : '500')
      .text(d => {
        // Truncate text if cell is too small
        const cellWidth = (d.x1 || 0) - (d.x0 || 0);
        const name = d.data.name;
        const maxChars = Math.floor(cellWidth / 6.5); // Approximate chars that fit
        return name.length > maxChars ? name.substring(0, maxChars - 2) + '...' : name;
      });
    
    // Add value labels for cells with improved positioning
    cell
      .filter(d => ((d.x1 || 0) - (d.x0 || 0)) > 50 && ((d.y1 || 0) - (d.y0 || 0)) > 40) // Increased minimum width
      .append('text')
      .attr('x', 5)
      .attr('y', 30)
      .attr('fill', d => d.depth === 1 ? '#ffffff' : '#4b5563')
      .attr('font-size', '11px') // Smaller font size
      .attr('font-weight', '500')
      .text(d => `$${d3.format(',.0f')(d.value || 0)}`);
    
    // Add risk indicator for leaf nodes with improved sizing
    cell
      .filter(d => !d.children && ((d.x1 || 0) - (d.x0 || 0)) > 70 && ((d.y1 || 0) - (d.y0 || 0)) > 70) // Increased minimum size
      .append('g')
      .attr('transform', d => `translate(5, ${((d.y1 || 0) - (d.y0 || 0)) - 20})`)
      .each(function(d) {
        const g = d3.select(this);
        const data = d.data;
        
        if (data.risk !== undefined) {
          // Risk level bar background
          g.append('rect')
            .attr('width', 50)
            .attr('height', 6)
            .attr('rx', 3)
            .attr('fill', '#e5e7eb');
          
          // Risk level bar fill
          g.append('rect')
            .attr('width', data.risk * 50)
            .attr('height', 6)
            .attr('rx', 3)
            .attr('fill', colorScale(data.risk));
          
          // Risk label
          g.append('text')
            .attr('x', 0)
            .attr('y', -5)
            .attr('font-size', '10px')
            .attr('fill', '#4b5563')
            .text('Risk');
        }
      });
    
    // Add title with improved styling and updated terminology
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 15)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Job Replacement Cost Analysis');
    
    // Create a combined legend group for more compact display in upper right corner
    const combinedLegend = svg
      .append('g')
      .attr('class', 'combined-legend')
      .attr('transform', `translate(${dimensions.width - 120}, 5)`);
    
    // Add combined legend background with improved styling
    combinedLegend.append('rect')
      .attr('x', -6)
      .attr('y', -5)
      .attr('width', 115)
      .attr('height', 80)
      .attr('rx', 4)
      .attr('fill', 'rgba(255, 255, 255, 0.95)')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1);
    
    // First row: Human Labor with updated colors
    combinedLegend.append('rect')
      .attr('width', 8)
      .attr('height', 8)
      .attr('fill', jobReplacementColors.humanLabor);
    
    combinedLegend.append('text')
      .attr('x', 14)
      .attr('y', 7)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text('Human Labor');
    
    // Second row: AI Replacement with updated colors
    combinedLegend.append('rect')
      .attr('width', 8)
      .attr('height', 8)
      .attr('y', 16)
      .attr('fill', jobReplacementColors.aiReplacement);
    
    combinedLegend.append('text')
      .attr('x', 14)
      .attr('y', 23)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text('AI Replacement');
    
    // Third row: Job Replacement Risk label (changed terminology)
    combinedLegend.append('text')
      .attr('x', 0)
      .attr('y', 38)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text('Job Replacement Risk');
    
    // Create risk gradient with unique ID to prevent conflicts
    const gradientId = `risk-gradient-${Math.random().toString(36).substring(2, 9)}`;
    const riskGradient = combinedLegend.append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');
    
    riskGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScale(0));
    
    riskGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScale(1));
    
    // Risk gradient bar with updated positioning
    combinedLegend.append('rect')
      .attr('y', 45)
      .attr('width', 90)
      .attr('height', 6)
      .attr('rx', 2)
      .attr('fill', `url(#${gradientId})`);
    
    // Risk labels with updated positioning
    combinedLegend.append('text')
      .attr('x', 0)
      .attr('y', 60)
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .text('Low');
    
    combinedLegend.append('text')
      .attr('x', 75)
      .attr('y', 60)
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .text('High');
    
  }, [treemapData, dimensions]);

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
