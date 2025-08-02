'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { CostChartData, CostComparison } from '@/lib/cost-analysis/types';
import { CostCalculator } from '@/lib/cost-analysis/utils';

interface CostComparisonChartProps {
  data: {
    comparison: CostComparison;
    confidence: number;
    title?: string;
  };
  className?: string;
  width?: number;
  height?: number;
}

export interface CostComparisonChartHandle {
  getSvg: () => SVGSVGElement | null;
  exportSvg: (filename?: string) => void;
}

const CostComparisonChart = forwardRef<CostComparisonChartHandle, CostComparisonChartProps>(
  ({ data, className = '', width = 600, height = 400 }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getSvg: () => svgRef.current,
      exportSvg: (filename = 'cost-comparison-chart.svg') => {
        if (svgRef.current) {
          exportSvgChart(svgRef.current, filename);
        }
      },
    }));

    useEffect(() => {
      if (!data || !svgRef.current) return;

      drawChart();
    }, [data, width, height]);

    const drawChart = () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear previous chart

      const margin = { top: 60, right: 80, bottom: 80, left: 100 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      // Prepare data
      const chartData = [
        {
          category: 'Human Worker',
          total: data.comparison.human.total,
          breakdown: [
            { label: 'Base Salary', value: data.comparison.human.annualSalary, color: '#3B82F6' },
            { label: 'Benefits', value: data.comparison.human.benefits, color: '#60A5FA' },
            { label: 'Overhead', value: data.comparison.human.overhead, color: '#93C5FD' },
          ],
        },
        {
          category: 'AI Automation',
          total: data.comparison.ai.total,
          breakdown: [
            { label: 'Token Costs', value: data.comparison.ai.tokenCosts, color: '#10B981' },
            { label: 'Infrastructure', value: data.comparison.ai.infrastructure, color: '#34D399' },
            { label: 'Maintenance', value: data.comparison.ai.maintenance, color: '#6EE7B7' },
          ],
        },
      ];

      // Create main group
      const g = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales
      const xScale = d3
        .scaleBand()
        .domain(chartData.map(d => d.category))
        .range([0, chartWidth])
        .padding(0.3);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(chartData, d => d.total) * 1.1])
        .range([chartHeight, 0]);

      // Create tooltip
      const tooltip = d3
        .select(containerRef.current)
        .append('div')
        .attr('class', 'cost-chart-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000');

      // Draw bars with stacked segments
      const barGroups = g
        .selectAll('.bar-group')
        .data(chartData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', d => `translate(${xScale(d.category)},0)`);

      // Draw stacked segments
      barGroups.each(function(d) {
        const barGroup = d3.select(this);
        let yOffset = 0;

        d.breakdown.forEach((segment, i) => {
          const segmentHeight = (segment.value / d.total) * (chartHeight - yScale(d.total));
          
          barGroup
            .append('rect')
            .attr('class', 'bar-segment')
            .attr('x', 0)
            .attr('y', yScale(d.total) + yOffset)
            .attr('width', xScale.bandwidth())
            .attr('height', segmentHeight)
            .attr('fill', segment.color)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseover', function(event) {
              d3.select(this).attr('opacity', 0.8);
              
              tooltip
                .style('visibility', 'visible')
                .html(`
                  <div><strong>${d.category}</strong></div>
                  <div>${segment.label}: ${CostCalculator.formatCurrency(segment.value)}</div>
                  <div>Total: ${CostCalculator.formatCurrency(d.total)}</div>
                `);
            })
            .on('mousemove', function(event) {
              tooltip
                .style('top', (event.pageY - 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', function() {
              d3.select(this).attr('opacity', 1);
              tooltip.style('visibility', 'hidden');
            });

          yOffset += segmentHeight;
        });

        // Add total value label on top of bar
        barGroup
          .append('text')
          .attr('class', 'bar-total-label')
          .attr('x', xScale.bandwidth() / 2)
          .attr('y', yScale(d.total) - 8)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .style('fill', '#374151')
          .text(CostCalculator.formatCurrency(d.total));
      });

      // Add axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale).tickFormat(d => CostCalculator.formatCurrency(d as number));

      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('font-weight', '500');

      g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .style('font-size', '11px');

      // Add axis labels
      g.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -chartHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#6B7280')
        .text('Annual Cost (USD)');

      // Add savings indicator
      const savings = data.comparison.savings.absolute;
      if (Math.abs(savings) > 1000) {
        const savingsGroup = g.append('g').attr('class', 'savings-indicator');
        
        const savingsColor = savings > 0 ? '#10B981' : '#EF4444';
        const savingsText = savings > 0 ? 'SAVINGS' : 'ADDITIONAL COST';
        
        // Add savings arrow and text
        const arrowY = Math.min(yScale(chartData[0].total), yScale(chartData[1].total)) - 30;
        
        savingsGroup
          .append('line')
          .attr('x1', xScale(chartData[0].category) + xScale.bandwidth() / 2)
          .attr('y1', arrowY)
          .attr('x2', xScale(chartData[1].category) + xScale.bandwidth() / 2)
          .attr('y2', arrowY)
          .attr('stroke', savingsColor)
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrowhead)');

        // Add arrow marker
        svg.append('defs')
          .append('marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 8)
          .attr('refY', 0)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', savingsColor);

        // Add savings text
        savingsGroup
          .append('text')
          .attr('x', (xScale(chartData[0].category) + xScale(chartData[1].category) + xScale.bandwidth()) / 2)
          .attr('y', arrowY - 8)
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .style('font-weight', 'bold')
          .style('fill', savingsColor)
          .text(`${savingsText}: ${CostCalculator.formatCurrency(Math.abs(savings))}`);
      }

      // Add chart title
      if (data.title) {
        svg
          .append('text')
          .attr('class', 'chart-title')
          .attr('x', width / 2)
          .attr('y', 30)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .style('fill', '#111827')
          .text(data.title);
      }

      // Add confidence indicator
      const confidenceGroup = svg
        .append('g')
        .attr('class', 'confidence-indicator')
        .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);

      confidenceGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', '11px')
        .style('font-weight', '500')
        .style('fill', '#6B7280')
        .text('Confidence');

      confidenceGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 15)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', data.confidence > 0.8 ? '#10B981' : data.confidence > 0.6 ? '#F59E0B' : '#EF4444')
        .text(`${(data.confidence * 100).toFixed(0)}%`);

      // Add legend
      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${margin.left}, ${height - margin.bottom + 20})`);

      const legendData = [
        ...chartData[0].breakdown,
        ...chartData[1].breakdown,
      ];

      const legendItems = legend
        .selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(${(i % 3) * 120}, ${Math.floor(i / 3) * 20})`);

      legendItems
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', d => d.color);

      legendItems
        .append('text')
        .attr('x', 16)
        .attr('y', 9)
        .style('font-size', '11px')
        .style('fill', '#374151')
        .text(d => d.label);
    };

    const exportSvgChart = (svgElement: SVGSVGElement, filename: string) => {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgElement);
      
      // Add CSS styles for export
      const styledSource = `
        <svg xmlns="http://www.w3.org/2000/svg" ${source.substring(4)}
        <style>
          .bar-segment { transition: opacity 0.2s; }
          .chart-title { font-family: 'Inter', sans-serif; }
          .bar-total-label { font-family: 'Inter', sans-serif; }
          .y-axis-label { font-family: 'Inter', sans-serif; }
          .legend text { font-family: 'Inter', sans-serif; }
          .confidence-indicator text { font-family: 'Inter', sans-serif; }
        </style>
      `;
      
      const blob = new Blob([styledSource], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
      <div ref={containerRef} className={`cost-comparison-chart ${className}`}>
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    );
  }
);

CostComparisonChart.displayName = 'CostComparisonChart';

export default CostComparisonChart;