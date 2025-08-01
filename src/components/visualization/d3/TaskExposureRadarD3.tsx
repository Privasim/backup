'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { DEFAULT_CONFIG, PROFESSIONAL_COLORS } from '@/lib/visualization/d3-base';

export interface TaskExposureRadarHandle {
  getSvg: () => SVGSVGElement | null;
}

type TaskExposure = {
  taskCategory: string;
  automationPotential: number; // 0..1
  humanComplementarity?: string;
  timeline?: string;
  description?: string;
};

interface TaskExposureRadarD3Props {
  data: TaskExposure[];
  className?: string;
  width?: number;
  height?: number;
}

const TaskExposureRadarD3 = forwardRef<TaskExposureRadarHandle, TaskExposureRadarD3Props>(function TaskExposureRadarD3(
  { data, className = '', width = 320, height = 220 },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  useImperativeHandle(ref, () => ({ getSvg: () => svgRef.current }));

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const margin = { top: 16, right: 16, bottom: 16, left: 16 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const radius = Math.min(w, h) / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const root = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    const axes = data.map((d) => d.taskCategory);
    const angle = d3.scaleLinear().domain([0, axes.length]).range([0, 2 * Math.PI]);
    const r = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    const levels = 5;
    const grid = root.append('g').attr('class', 'grid');
    for (let i = 1; i <= levels; i++) {
      grid
        .append('circle')
        .attr('r', (radius * i) / levels)
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);
    }

    const axesGroup = root.append('g').attr('class', 'axes');
    axes.forEach((label, i) => {
      const a = angle(i) - Math.PI / 2;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;

      axesGroup.append('line').attr('x1', 0).attr('y1', 0).attr('x2', x).attr('y2', y).attr('stroke', '#e5e7eb').attr('stroke-width', 1);

      axesGroup
        .append('text')
        .attr('x', Math.cos(a) * (radius + 10))
        .attr('y', Math.sin(a) * (radius + 10))
        .attr('text-anchor', Math.cos(a) > 0.1 ? 'start' : Math.cos(a) < -0.1 ? 'end' : 'middle')
        .attr('dominant-baseline', Math.sin(a) > 0 ? 'hanging' : Math.sin(a) < 0 ? 'ideographic' : 'middle')
        .attr('font-size', DEFAULT_CONFIG.styling.fonts.size.small)
        .attr('fill', '#374151')
        .text(label);
    });

    const area = d3
      .lineRadial<TaskExposure>()
      .angle((_, i) => angle(i))
      .radius((d) => r(Math.max(0, Math.min(1, d.automationPotential))))
      .curve(d3.curveLinearClosed);

    root
      .append('path')
      .datum(data)
      .attr('d', area as any)
      .attr('fill', PROFESSIONAL_COLORS.primary[0])
      .attr('fill-opacity', 0.25)
      .attr('stroke', PROFESSIONAL_COLORS.primary[0])
      .attr('stroke-width', 2);

    const points = root
      .selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('r', 3)
      .attr('cx', (_, i) => Math.cos(angle(i) - Math.PI / 2) * r(data[i].automationPotential))
      .attr('cy', (_, i) => Math.sin(angle(i) - Math.PI / 2) * r(data[i].automationPotential))
      .attr('fill', PROFESSIONAL_COLORS.primary[0])
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    const tooltip = d3.select(svgRef.current.parentElement).style('position', 'relative').append('div').attr('class', 'd3-tooltip').style('opacity', 0);

    points
      .on('mouseenter', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(
            `<div>
              <div style="font-weight:600;margin-bottom:4px;">${d.taskCategory}</div>
              <div>Automation Potential: ${(d.automationPotential * 100).toFixed(0)}%</div>
              ${d.humanComplementarity ? `<div>Complementarity: ${d.humanComplementarity}</div>` : ''}
              ${d.timeline ? `<div>Timeline: ${d.timeline}</div>` : ''}
              ${d.description ? `<div style="max-width:240px;margin-top:4px;">${d.description}</div>` : ''}
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

export default TaskExposureRadarD3;