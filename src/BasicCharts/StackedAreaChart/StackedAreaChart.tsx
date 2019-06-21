import * as d3 from 'd3';
import * as React from 'react';

const { useRef, useEffect } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 500;
const margin = { top: 0, right: 40, bottom: 30, left: 20 };

/* Ref: https://raw.githubusercontent.com/vega/vega-lite/b2338345973f4717979ad9140c06ee0970c20116/data/unemployment-across-industries.json */
type RawDatum = {
  series: string;
  count: number;
  year: number;
  month: number;
  date: string;
};

type Datum = {
  date: Date;
  name: string;
  value: number;
  values: [number, number];
};

function multimap<K, V, Reduced = [V]>(
  entries: Array<[K, V]>,
  reducer: (p: Reduced, v: V) => Reduced = (p: any, v: V) => {
    p.push(v);
    return p;
  },
  initializer: () => Reduced = () => [] as any,
) {
  const map: Map<K, Reduced> = new Map();
  for (const [key, value] of entries) {
    map.set(
      key,
      reducer(map.has(key) ? (map.get(key) as Reduced) : initializer(), value),
    );
  }
  return map;
}

function multisum(entries: Array<[string, number]>) {
  return multimap(entries, (p, v) => p + v, () => 0);
}

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const data = (await d3.json<[RawDatum]>(
          'https://raw.githubusercontent.com/vega/vega-lite/b2338345973f4717979ad9140c06ee0970c20116/data/unemployment-across-industries.json',
        )).map(({ series, count, date, ...rest }) => {
          return {
            name: series,
            value: count,
            date: new Date(date),
          };
        });

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

    const top: string[] = [...multisum(data.map((d: any) => [d.name, d.value]))]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9)
      .map(d => d[0])
      .concat('Other');

    const series: Map<string, [Datum]> = multimap(data.map(d => [d.name, d]));

    const newData = (([] as unknown) as [Datum]).concat(
      ...top.map(name => series.get(name) as [Datum]),
    );

    const other = series.get('Other');

    for (const [name, data] of series) {
      if (!top.includes(name)) {
        for (let i = 0, n = data.length; i < n; ++i) {
          if (Number((other as [Datum])[i].date) !== Number(data[i].date)) {
            throw new Error();
          }
          (other as [Datum])[i].value += data[i].value;
        }
      }
    }

    const stackFn = d3
      .stack<any, Map<string, Datum>, string>()
      .keys(top)
      .value((d, key) => (d.get(key) as Datum).value);

    const stack = stackFn(
      Array.from(
        multimap(
          newData.map(d => [Number(d.date), d]),
          (p, v) => p.set(v.name, v),
          () => new Map(),
        ).values(),
      ),
    );

    for (const layer of stack) {
      for (const d of layer) {
        (d as any).data.get(layer.key).values = [d[0], d[1]];
      }
    }

    const color = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(newData.map(d => d.name));

    const x = d3
      .scaleTime()
      .domain(d3.extent(newData, d => d.date) as any)
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
      .domain([0, d3.max(newData, d => d.values[1]) as any])
      .range([height - margin.bottom, margin.top]);

    const yAxis = (g: d3.Selection<any, any, any, any>) =>
      g
        .attr('transform', `translate(${width - margin.right},0)`)
        .call(d3.axisRight(y))
        .call(a => a.select('.domain').remove());

    const area = d3
      .area<Datum>()
      .curve(d3.curveStep)
      .x(d => x(d.date))
      .y0(d => y(d.values[0]))
      .y1(d => y(d.values[1]));

    const legend = (svg: d3.Selection<any, any, any, any>) => {
      const g = svg
        .attr('transform', `translate(${margin.left + 1},${margin.top})`)
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
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', color);

      g.append('text')
        .attr('x', 24)
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
      .selectAll('path')
      .data([...multimap(newData.map(d => [d.name, d]))])
      .join('path')
      .attr('fill', ([name]) => color(name))
      .attr('d', ([, values]) => area(values))
      .append('title')
      .text(([name]) => name);

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
    svg.append('g').call(legend);
  }, [dataFetch]);

  return (
    <div ref={rootRef}>{/* <button onClick={onClick}>Fetch</button> */}</div>
  );
};
