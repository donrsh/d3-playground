import * as d3 from 'd3';
import * as React from 'react';
import * as R from 'ramda';

const { useRef, useEffect } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 1330;
const margin = { top: 30, right: 10, bottom: 0, left: 30 };

type RawDatum = {
  name: string,
  '<10': string,
  '10-19': string,
  '20-29': string,
  '30-39': string,
  '40-49': string,
  '50-59': string,
  '60-69': string,
  '70-79': string,
  '≥80': string
};

type ParsedDatum = {
  name: string,
  '<10': number,
  '10-19': number,
  '20-29': number,
  '30-39': number,
  '40-49': number,
  '50-59': number,
  '60-69': number,
  '70-79': number,
  '≥80': number
};

type Datum = ParsedDatum & {
  total: number
};

type Data = [Datum] & {
  columns: string[]
};

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const rawData: any = await d3.csv(
          'https://gist.githubusercontent.com/mbostock/5429c74d6aba68c52c7b39642c98deed/raw/50a5157a1d920191b0a7f636796ee721047cbb92/us-population-state-age.csv',
        );

        // const data = rawData

        const data: any = (rawData as [RawDatum])
          .map(R.evolve({
            '<10': Number,
            '10-19': Number,
            '20-29': Number,
            '30-39': Number,
            '40-49': Number,
            '50-59': Number,
            '60-69': Number,
            '70-79': Number,
            '≥80': Number
          }))
          .map((d: ParsedDatum) => {
            const { name, ...rest } = d
            const total = R.sum(Object.values(rest))

            const datum: Datum = {...d, total}

            return datum;
          })
          .sort((a, b) => b.total - a.total);

        data.columns = Object.keys(rawData[0])

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

    const series = d3
      .stack<Datum>()
      .keys(data.columns.filter(x => x !== 'name'))(data)

    const color = d3
      .scaleOrdinal<string>()
      .domain(series.map(d => d.key))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), series.length).reverse())
      .unknown('#ccc')

    const x = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1])) as any])
      .range([margin.left, width - margin.right])

    const xAxis = (g: d3.Selection<any, any, any, any>) =>
      g
        .attr("transform", `translate(0,${margin.top})`)
        .call(d3.axisTop(x).ticks(width / 100, "s"))
        .call(g => g.selectAll(".domain").remove())
    
    const y = d3
      .scaleBand()
      .domain(data.map(d => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.1)

    const yAxis = (g: d3.Selection<any, any, any, any>) => 
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove())

    const svg = d3
      .select(rootEl)
      .append('svg')
      .attr('viewBox', `0,0,${width},${height}`);

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);

    svg.append("g")
      .selectAll("g")
      .data(series)
      .join("g")
        .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d.data.name) as number)
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth());

    console.log(svg, margin, series);
  }, [dataFetch]);

  return (
    <div ref={rootRef}>{/* <button onClick={onClick}>Fetch</button> */}</div>
  );
};
