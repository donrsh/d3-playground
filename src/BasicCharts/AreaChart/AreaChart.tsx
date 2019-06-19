import * as d3 from 'd3';
import * as React from 'react';

const { useRef, useEffect } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 500;
const margin = { top: 20, right: 20, bottom: 30, left: 30 };

type Datum = {
  date: Date;
  close: number;
};

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const data = await d3.csv(
          'https://gist.githubusercontent.com/mbostock/14613fb82f32f40119009c94f5a46d72/raw/d0d70ffb7b749714e4ba1dece761f6502b2bdea2/aapl.csv',
          d3.autoType,
        );

        console.log(data);

        if (data) {
          return { ok: true, data };
        }

        return { ok: false, error: 'Null data' };
      } catch (error) {
        return { ok: false, error };
      }
    },
  });

  useEffect(() => {
    const rootEl = rootRef.current;
    const data: any = dataFetch.data;

    if (!rootEl || !data) {
      return;
    }

    const svg = d3
      .select(rootEl)
      .append('svg')
      .attr('viewBox', `0,0,${width},${height}`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data as [Datum], d => d.date) as any)
      .range([margin.left, width - margin.right]);

    const xAxis = (g: d3.Selection<any, any, any, any>) =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0),
      );

    const y = d3
      .scaleLinear()
      .domain([0, d3.max<Datum>(data, d => d.close as any) as any])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const yAxis = (g: d3.Selection<any, any, any, any>) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(a => a.select('.domain').remove())
        .call(a =>
          a
            .select('.tick:last-of-type text')
            .clone()
            .attr('x', 3)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text('$ Close'),
        );

    console.log('y0', y(0));

    const area = d3
      .area()
      .x((d: any) => x(d.date))
      .y0(y(0))
      .y1((d: any) => y(d.close));

    const line = d3
      .line()
      .x((d: any) => x(d.date))
      .y((d: any) => y(d.close));

    svg
      .append('path')
      .datum(data as [Datum])
      .attr('fill', 'steelblue')
      .attr('d', area as any);

    svg
      .append('path')
      .datum(data as [Datum])
      .attr('stroke', 'orange')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('d', line as any);

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    svg.node();
  }, [dataFetch]);

  return (
    <div ref={rootRef}>{/* <button onClick={onClick}>Fetch</button> */}</div>
  );
};
