import { storiesOf } from '@storybook/react';
import * as React from 'react';

import DifferenceChart from './DifferenceChart.mdx';

storiesOf('Basic Charts', module).add('Difference Chart', () => (
  <DifferenceChart />
));
