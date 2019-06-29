import * as d3 from 'd3';
import * as React from 'react';

const { useRef, useEffect } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 600;
const margin = { top: 20, right: 20, bottom: 30, left: 30 };

// type RawDatum = any;

type Datum = {
  name: string;
  values: number[];
};

// type Data = [Datum];

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const series = await d3.tsv<Datum>(
          'https://gist.githubusercontent.com/mbostock/8033015/raw/01e8225d4a65aca6c759fe4b8c77179f446c5815/unemployment.tsv',
          (d, i, columns) => {
            return {
              name: (d.name as string).replace(/, ([\w-]+).*/, ' $1'),
              values: columns.slice(1).map(k => Number(d[k])) as number[],
            };
          },
        );

        const data = {
          y: '% Unemployment',
          series,
          dates: series.columns.slice(1).map(d3.utcParse('%Y-%m')) as Date[],
        };

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
    const data = dataFetch.data;

    if (!rootEl || !data) {
      return;
    }

    const x = d3
      .scaleUtc()
      .domain(d3.extent(data.dates) as [Date, Date])
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
      .domain([0, d3.max(data.series, d => d3.max(d.values)) as number])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const yAxis = (g: d3.Selection<any, any, any, any>) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
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

    const line = d3
      .line<number>()
      .defined(d => !isNaN(d))
      .x((d, i) => x(data.dates[i]))
      .y(d => y(d));

    function hover(
      svg: d3.Selection<any, any, any, any>,
      path: d3.Selection<any, any, any, any>,
    ) {
      svg.style('position', 'relative');

      const dot = svg.append('g').attr('display', 'none');

      function moved() {
        if (!data) {
          return;
        }

        d3.event.preventDefault();

        const ym = y.invert(d3.event.layerY);
        const xm = x.invert(d3.event.layerX);
        const i1 = d3.bisectLeft(data.dates, xm, 1);
        const i0 = i1 - 1;
        const i =
          Number(xm) - Number(data.dates[i0]) >
          Number(data.dates[i1]) - Number(xm)
            ? i1
            : i0;
        const s = data.series.reduce((a, b) =>
          Math.abs(a.values[i] - ym) < Math.abs(b.values[i] - ym) ? a : b,
        );

        path
          .attr('stroke', d => (d === s ? null : '#ddd'))
          .filter(d => d === s)
          .raise();

        dot.attr(
          'transform',
          `translate(${x(data.dates[i])},${y(s.values[i])})`,
        );

        dot.select('text').text(s.name);
      }

      function entered() {
        path.style('mix-blend-mode', null).attr('stroke', '#ddd');
        dot.attr('display', null);
      }

      function left() {
        path.style('mix-blend-mode', 'multiply').attr('stroke', null);
        dot.attr('display', 'none');
      }

      if ('ontouchstart' in document) {
        svg
          .style('-webkit-tap-highlight-color', 'transparent')
          .on('touchmove', moved)
          .on('touchstart', entered)
          .on('touchend', left);
      } else {
        svg
          .on('mousemove', moved)
          .on('mouseenter', entered)
          .on('mouseleave', left);
      }

      dot.append('circle').attr('r', 2.5);

      dot
        .append('text')
        .style('font', '10px sans-serif')
        .attr('text-anchor', 'middle')
        .attr('y', -8);
    }

    const svg = d3
      .select(rootEl)
      .append('svg')
      .attr('viewBox', `0,0,${width},${height}`);

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    const path = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .selectAll('path')
      .data(data.series)
      .join('path')
      .style('mix-blend-mode', 'multiply')
      .attr('d', d => line(d.values));

    svg.call(hover, path);
  }, [dataFetch]);

  return (
    <div ref={rootRef}>{/* <button onClick={onClick}>Fetch</button> */}</div>
  );
};
