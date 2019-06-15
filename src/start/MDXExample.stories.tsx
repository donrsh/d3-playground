import { storiesOf } from '@storybook/react';
import * as React from 'react';

import MDXCodeBlocks from './MDXCodeBlocks.mdx';
import MDXComponents from './MDXComponents.mdx';
import MDXExample from './MDXExample.mdx';

storiesOf('MDX Example', module)
  .add('MDX!', () => <MDXExample />)
  .add('MDX Components', () => <MDXComponents />)
  .add('MDX Code Blocks', () => <MDXCodeBlocks />);
