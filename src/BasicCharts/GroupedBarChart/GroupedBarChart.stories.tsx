import { storiesOf } from '@storybook/react';
import * as React from 'react';

import GroupedBarChart from './GroupedBarChart.mdx';

storiesOf('Basic Charts', module).add('Grouped Bar Chart', () => (
  <GroupedBarChart />
));
