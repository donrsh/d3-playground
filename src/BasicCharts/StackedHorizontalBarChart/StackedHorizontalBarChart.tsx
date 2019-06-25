import { colors, Popper } from '@material-ui/core';
import * as d3 from 'd3';
import { css } from 'emotion';
import * as R from 'ramda';
import * as React from 'react';

const { useRef, useEffect, useState } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 1330;
const margin = { top: 30, right: 10, bottom: 0, left: 30 };

type RawDatum = {
  name: string;
  '<10': string;
  '10-19': string;
  '20-29': string;
  '30-39': string;
  '40-49': string;
  '50-59': string;
  '60-69': string;
  '70-79': string;
  '≥80': string;
};

type ParsedDatum = {
  name: string;
  '<10': number;
  '10-19': number;
  '20-29': number;
  '30-39': number;
  '40-49': number;
  '50-59': number;
  '60-69': number;
  '70-79': number;
  '≥80': number;
};

type Datum = ParsedDatum & {
  total: number;
};

type Data = [Datum] & {
  columns: string[];
};

const cls = {
  Tooltip: css`
    background: ${colors.grey[800]};
    color: ${colors.grey[100]};
    padding: 2px 6px;
    border-radius: 3px;
    position: relative;
    top: 2px;
    font-size: 12px;

    /* &:before {
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      content: ' ';
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 10px 10px 10px;
      border-color: transparent transparent ${colors.grey[800]} transparent;
    } */
  `,
};

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgSelectionRef = useRef<d3.Selection<any, any, any, any> | null>(null);
  const [inspectedEl, setInspectedEl] = useState<SVGRectElement | null>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const rawData: any = await d3.csv(
          'https://gist.githubusercontent.com/mbostock/5429c74d6aba68c52c7b39642c98deed/raw/50a5157a1d920191b0a7f636796ee721047cbb92/us-population-state-age.csv',
        );

        // const data = rawData

        const data: any = (rawData as [RawDatum])
          .map(
            R.evolve({
              '<10': Number,
              '10-19': Number,
              '20-29': Number,
              '30-39': Number,
              '40-49': Number,
              '50-59': Number,
              '60-69': Number,
              '70-79': Number,
              '≥80': Number,
            }),
          )
          .map((d: ParsedDatum) => {
            const { name, ...rest } = d;
            const total = R.sum(Object.values(rest));

            const datum: Datum = { ...d, total };

            return datum;
          })
          .sort((a, b) => b.total - a.total);

        data.columns = Object.keys(rawData[0]);

        // console.log(data);

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

    const svgSelection = svgSelectionRef.current;

    if (!svgSelection) {
      const series = d3
        .stack<Datum>()
        .keys(data.columns.filter(a => a !== 'name'))(data);

      /* pass key to each series datum */
      series.forEach(d => {
        d.forEach((e: any) => {
          e.key = d.key;
        });
      });

      const color = d3
        .scaleOrdinal<string>()
        .domain(series.map(d => d.key))
        .range(
          d3
            .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), series.length)
            .reverse(),
        )
        .unknown('#ccc');

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1])) as any])
        .range([margin.left, width - margin.right]);

      const xAxis = (g: d3.Selection<any, any, any, any>) =>
        g
          .attr('transform', `translate(0,${margin.top})`)
          .call(d3.axisTop(x).ticks(width / 100, 's'))
          .call(a => a.selectAll('.domain').remove());

      const y = d3
        .scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

      const yAxis = (g: d3.Selection<any, any, any, any>) =>
        g
          .attr('transform', `translate(${margin.left},0)`)
          .call(d3.axisLeft(y).tickSizeOuter(0))
          .call(a => a.selectAll('.domain').remove());

      const svg = d3
        .select(rootEl)
        .append('svg')
        .attr('viewBox', `0,0,${width},${height}`);

      /* Assign to ref */
      svgSelectionRef.current = svg;

      svg.append('g').call(xAxis);

      svg.append('g').call(yAxis);

      svg
        .append('g')
        .selectAll('g')
        .data(series)
        .join('g')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        .classed('rect', true)
        .attr('x', d => x(d[0]))
        .attr('y', d => y(d.data.name) as number)
        .attr('width', d => x(d[1]) - x(d[0]))
        .attr('height', y.bandwidth())
        .attr('data-tooltip-text', d => {
          const { total, name } = d.data;
          const value = d[1] - d[0];
          const ratio = d3.format('.2%')(value / total);

          return `Country = ${name} | Age: ${
            (d as any).key
          } | Ratio = ${ratio} (${value} / ${total})`;
        })
        .on('click', function() {
          setInspectedEl(this as any);
        });

      // console.log('series', series);

      // console.log(svg, margin, series);
    } else {
      const svg = svgSelection;

      /* rebind event */
      svg.selectAll('rect.rect').on('click', function() {
        setInspectedEl(this as any);
      });
    }
  }, [dataFetch]);

  // console.log(inspectedEl && inspectedEl.dataset);

  return (
    <div ref={rootRef}>
      {inspectedEl && (
        <Popper open anchorEl={inspectedEl}>
          <span className={cls.Tooltip}>{inspectedEl.dataset.tooltipText}</span>
        </Popper>
      )}
    </div>
  );
};
