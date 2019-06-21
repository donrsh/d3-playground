import * as d3 from 'd3';
import * as React from 'react';

const { useRef, useEffect } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 600;
const margin = { top: 20, right: 20, bottom: 30, left: 30 };

type RawDatum = {
  'New York': string;
  'San Francisco': string;
  date: string;
};

type Datum = {
  date: Date;
  value0: number;
  value1: number;
};

type Data = [Datum] & {
  y: string;
};

const aboveUid = 'above-clip-path';
const belowUid = 'below-clip-path';
const curve = d3.curveStep;

const colors = [d3.schemeRdYlBu[3][2], d3.schemeRdYlBu[3][0]];

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const rawData: any = await d3.tsv(
          'https://gist.githubusercontent.com/mbostock/3894205/raw/dd88ef2f77aea337e0ebbe74c0615e14ec80e616/data.tsv',
        );

        const parseDate = d3.timeParse('%Y%m%d');

        const data: Data = rawData.map((d: RawDatum) => ({
          date: parseDate(d.date) as Date,
          value0: +d['New York'],
          value1: +d['San Francisco'],
        }));

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
    const data = dataFetch.data;

    if (!rootEl || !data) {
      return;
    }

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.value0, d.value1)) as number,
        d3.max(data, d => Math.max(d.value0, d.value1)) as number,
      ])
      .nice(5)
      .range([height - margin.bottom, margin.top]);

    const xAxis = (g: d3.Selection<any, any, any, any>) =>
      g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0),
        )
        .call(a => a.select('.domain').remove());

    const yAxis = (g: d3.Selection<any, any, any, any>) =>
      g
        .append('g')
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
            .text(data.y),
        );

    const svg = d3
      .select(rootEl)
      .append('svg')
      .attr('viewBox', `0,0,${width},${height}`)
      .datum(data);

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    /* Warmer Area */
    svg
      .append('clipPath')
      .attr('id', aboveUid)
      .append('path')
      .attr(
        'd',
        d3
          .area<Datum>()
          .curve(curve)
          .x(d => x(d.date))
          .y1(0)
          .y0(d => y(d.value1)),
      );

    svg
      .append('path')
      .attr('clip-path', `url(#${aboveUid})`)
      .attr('fill', colors[1])
      .attr(
        'd',
        d3
          .area<Datum>()
          .curve(curve)
          .x(d => x(d.date))
          .y0(height)
          .y1(d => y(d.value0)),
      );

    /* Colder Area */
    svg
      .append('clipPath')
      .attr('id', belowUid)
      .append('path')
      .attr(
        'd',
        d3
          .area<Datum>()
          .curve(curve)
          .x(d => x(d.date))
          .y0(height)
          .y1(d => y(d.value1)),
      );

    svg
      .append('path')
      .attr('clip-path', `url(#${belowUid})`)
      .attr('fill', colors[0])
      .attr(
        'd',
        d3
          .area<Datum>()
          .curve(curve)
          .x(d => x(d.date))
          .y0(0)
          .y1(d => y(d.value0)),
      );

    /* The black line */
    svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr(
        'd',
        d3
          .line<Datum>()
          .curve(curve)
          .x(d => x(d.date))
          .y(d => y(d.value0)),
      );

    // console.log(svg, margin);
  }, [dataFetch]);

  console.log();
  return (
    <div ref={rootRef}>{/* <button onClick={onClick}>Fetch</button> */}</div>
  );
};
