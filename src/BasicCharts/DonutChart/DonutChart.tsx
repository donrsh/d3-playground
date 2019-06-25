import * as d3 from 'd3';
import * as React from 'react';

const { useRef, useEffect } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 500;
// const margin = { top: 20, right: 20, bottom: 30, left: 30 };

import responseData from './data.json';
console.log('raw data', d3.transpose(responseData).slice());

type ParsedRawData = Array<[string, number]>;

type Datum = {
  name: string;
  value: number;
};

// type Data = [Datum];

const variables = {
  B01001_003E: '<5', // Male
  B01001_004E: '5-9',
  B01001_005E: '10-14',
  B01001_006E: '15-19', // 15-17,
  B01001_007E: '15-19', // 18-19,
  B01001_008E: '20-24', // 20
  B01001_009E: '20-24', // 21
  B01001_010E: '20-24', // 22-24
  B01001_011E: '25-29',
  B01001_012E: '30-34',
  B01001_013E: '35-39',
  B01001_014E: '40-44',
  B01001_015E: '45-49',
  B01001_016E: '50-54',
  B01001_017E: '55-59',
  B01001_018E: '60-64', // 60-61
  B01001_019E: '60-64', // 62-64
  B01001_020E: '65-69', // 65-66
  B01001_021E: '65-69', // 67-69
  B01001_022E: '70-74',
  B01001_023E: '75-79',
  B01001_024E: '80-84',
  B01001_025E: '≥85',
  B01001_027E: '<5', // Female
  B01001_028E: '5-9',
  B01001_029E: '10-14',
  B01001_030E: '15-19', // 15-17
  B01001_031E: '15-19', // 18-19
  B01001_032E: '20-24', // 20
  B01001_033E: '20-24', // 21
  B01001_034E: '20-24', // 22-24
  B01001_035E: '25-29',
  B01001_036E: '30-34',
  B01001_037E: '35-39',
  B01001_038E: '40-44',
  B01001_039E: '45-49',
  B01001_040E: '50-54',
  B01001_041E: '55-59',
  B01001_042E: '60-64', // 60-61
  B01001_043E: '60-64', // 62-64
  B01001_044E: '65-69', // 65-66
  B01001_045E: '65-69', // 67-69
  B01001_046E: '70-74',
  B01001_047E: '75-79',
  B01001_048E: '80-84',
  B01001_049E: '≥85',
};

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const rawData: any = await Promise.resolve(responseData);
        const parsedRawData: ParsedRawData = d3
          .transpose<string>(rawData)
          .slice(0, -1)
          .map(x => [x[0], Number(x[1])]);

        const data: Datum[] = d3
          .nest<[string, number], number>()
          .key(([code]) => variables[code])
          .rollup(values => d3.sum(values, ([, value]) => value))
          .entries(parsedRawData)
          .map(d => ({ name: d.key, value: d.value as number }));

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

    const color = d3
      .scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(
        d3
          .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
          .reverse(),
      );

    const radius = Math.min(width, height) / 2;
    const arc = d3
      .arc<d3.PieArcDatum<Datum>>()
      .innerRadius(radius * 0.67)
      .outerRadius(radius - 1);

    const pie = d3
      .pie<Datum>()
      .padAngle(0.005)
      .sort(null)
      .value(d => d.value);

    const arcs = pie(data);

    const svg = d3
      .select(rootEl)
      .append('svg')
      .attr('viewBox', `0,0,${width},${height}`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px');

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    g.selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', d => color(d.data.name))
      .attr('d', arc)
      .append('title')
      .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

    const text = g
      .selectAll('text')
      .data(arcs)
      .join('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('dy', '0.35em');

    text
      .append('tspan')
      .attr('x', 0)
      .attr('y', '-0.7em')
      .style('font-weight', 'bold')
      .text(d => d.data.name);

    text
      .filter(d => d.endAngle - d.startAngle > 0.25)
      .append('tspan')
      .attr('x', 0)
      .attr('y', '0.7em')
      .attr('fill-opacity', 0.7)
      .text(d => d.data.value.toLocaleString());
  }, [dataFetch]);

  return (
    <div ref={rootRef}>{/* <button onClick={onClick}>Fetch</button> */}</div>
  );
};
