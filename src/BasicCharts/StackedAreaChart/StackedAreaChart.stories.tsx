import { storiesOf } from '@storybook/react';
import * as React from 'react';

import StackedAreaChart from './StackedAreaChart.mdx';

storiesOf('Basic Charts', module).add('Stacked Area Chart', () => (
  <StackedAreaChart />
));
