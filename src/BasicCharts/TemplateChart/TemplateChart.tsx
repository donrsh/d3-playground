import * as d3 from 'd3';
import * as React from 'react';

const { useRef, useEffect } = React;

import useAsyncJob from '../../hooks/useAsyncJob';

const width = window.innerWidth;
const height = 600;
const margin = { top: 20, right: 20, bottom: 30, left: 30 };

// type RawDatum = any;

// type Datum = any;

// type Data = [Datum];

export default () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const dataFetch = useAsyncJob({
    auto: true,
    asyncJob: async () => {
      try {
        const rawData: any = await d3.tsv(
          'https://gist.githubusercontent.com/mbostock/3894205/raw/dd88ef2f77aea337e0ebbe74c0615e14ec80e616/data.tsv',
        );

        const data = rawData;

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

    console.log(svg, margin);
  }, [dataFetch]);

  return (
    <div ref={rootRef}>{/* <button onClick={onClick}>Fetch</button> */}</div>
  );
};
