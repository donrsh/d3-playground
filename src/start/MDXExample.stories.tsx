import { storiesOf } from '@storybook/react';
import * as React from 'react';

import MDXCodeBlocks from './MDXCodeBlocks.mdx';
import MDXComponents from './MDXComponents.mdx';
import MDXExample from './MDXExample.mdx';
import MDXLiveCodeEditor from './MDXLiveCodeEditor.mdx';

storiesOf('MDX Example', module)
  .add('MDX!', () => <MDXExample />)
  .add('MDX Components', () => <MDXComponents />)
  .add('MDX Code Blocks', () => <MDXCodeBlocks />)
  .add('MDX Live Code Editor', () => <MDXLiveCodeEditor />);
