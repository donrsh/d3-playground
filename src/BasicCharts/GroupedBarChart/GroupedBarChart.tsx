import * as d3 from 'd3';
import * as React from 'react';

const { useRef, useEffect } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 500;
const margin = { top: 10, right: 10, bottom: 20, left: 40 };

// type RawDatum = {};

type Datum = {
  State: string;
  'Under 5 Years': number;
  '5 to 13 Years': number;
  '14 to 17 Years': number;
  '18 to 24 Years': number;
  '25 to 44 Years': number;
  '45 to 64 Years': number;
  '5 Years and Over': number;
};

type Data = d3.DSVParsedArray<Datum> & {
  y: string;
};

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const data: any = await d3.csv<Datum>(
          'https://gist.githubusercontent.com/mbostock/3887051/raw/805adad40306cedf1a513c252ddd95e7c981885a/data.csv',
          d3.autoType,
        );

        data.y = 'Population';

        console.log(data);

        if (data) {
          return { ok: true, data: data as Data };
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

    const groupKey = data.columns[0] as 'State';
    const keys = data.columns.slice(1);

    const x0 = d3
      .scaleBand()
      .domain(data.map(d => d[groupKey]))
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.1);

    const x1 = d3
      .scaleBand()
      .domain(keys)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d3.max(keys, key => d[key] as any))])
      .rangeRound([height - margin.bottom, margin.top]);

    const color = d3
      .scaleOrdinal<string>()
      .range([
        '#98abc5',
        '#8a89a6',
        '#7b6888',
        '#6b486b',
        '#a05d56',
        '#d0743c',
        '#ff8c00',
      ]);

    const xAxis = (g: d3.Selection<any, any, any, any>) =>
      g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0).tickSizeOuter(0))
        .call(g => g.select('.domain').remove());

    const yAxis = (g: d3.Selection<any, any, any, any>) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, 's'))
        .call(g => g.select('.domain').remove())
        .call(g =>
          g
            .select('.tick:last-of-type text')
            .clone()
            .attr('x', 3)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text(data.y),
        );

    const legend = (svg: d3.Selection<any, any, any, any>) => {
      const g = svg
        .attr('transform', `translate(${width},0)`)
        .attr('text-anchor', 'end')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('g')
        .data(
          color
            .domain()
            .slice()
            .reverse(),
        )
        .join('g')
        .attr('transform', (d, i) => `translate(0,${i * 20})`);

      g.append('rect')
        .attr('x', -19)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', color);

      g.append('text')
        .attr('x', -24)
        .attr('y', 9.5)
        .attr('dy', '0.35em')
        .text(d => d);
    };

    const svg = d3
      .select(rootEl)
      .append('svg')
      .attr('viewBox', `0,0,${width},${height}`);

    svg
      .append('g')
      .selectAll('g')
      .data(data)
      .join('g')
      .attr('transform', d => `translate(${x0(d[groupKey])},0)`)
      .selectAll('rect')
      .data(d => keys.map(key => ({ key, value: d[key] as number })))
      .join('rect')
      .attr('x', d => x1(d.key) || null)
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => y(0) - y(d.value))
      .attr('fill', d => color(d.key));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
    svg.append('g').call(legend);
  }, [dataFetch]);

  return (
    <div ref={rootRef}>{/* <button onClick={onClick}>Fetch</button> */}</div>
  );
};
