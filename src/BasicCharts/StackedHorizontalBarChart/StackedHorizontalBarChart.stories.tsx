import { storiesOf } from '@storybook/react';
import * as React from 'react';

import StackedHorizontalBarChart from './StackedHorizontalBarChart.mdx';

storiesOf('Basic Charts', module).add('Stacked Horizontal Bar Chart', () => (
  <StackedHorizontalBarChart />
));
