import * as d3 from 'd3';
import * as React from 'react';

const { useRef, useEffect } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 500;
const margin = { top: 20, right: 20, bottom: 30, left: 30 };

type RawDatum = {
  date: string;
  low: string;
  high: string;
};

type Datum = {
  date: Date;
  low: number;
  high: number;
};

type Data = [Datum] & {
  y: string;
};

const parseDate = d3.timeParse('%Y%m%d');

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const rawData: any = await d3.tsv(
          'https://gist.githubusercontent.com/mbostock/3884914/raw/428cb24a2922fd5c38a050e7466c18736f8b97ee/data.tsv',
        );

        const data: Data = rawData.map((d: RawDatum) => ({
          date: parseDate(d.date),
          high: Number(d.high),
          low: Number(d.low),
        }));

        data.y = '°F';

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
      .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)] as [
        number,
        number
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

    const area = d3
      .area<Datum>()
      .curve(d3.curveStep)
      .x(d => x(d.date))
      .y0(d => y(d.low))
      .y1(d => y(d.high));

    const svg = d3
      .select(rootEl)
      .append('svg')
      .attr('viewBox', `0,0,${width},${height}`);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'steelblue')
      .attr('d', area);

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    console.log();
  }, [dataFetch]);

  return (
    <div ref={rootRef}>{/* <button onClick={onClick}>Fetch</button> */}</div>
  );
};
