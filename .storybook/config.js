import React from 'react';
import { configure, addDecorator, addParameters } from '@storybook/react';
import { MDXProvider } from '@mdx-js/react';

import {
  Wrapper,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  InlineCode,
  CodeBlock,
  Link,
  Ul,
  Ol,
  Li,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
  Blockquote,
  Img,
} from './MDXComponents';

// automatically import all files ending in *.stories.js
const req = require.context('../src', true, /\.stories\.tsx$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

const MDXWrapper = storyFn => (
  // See https://mdxjs.com/getting-started/#mdxprovider for full list of components
  <MDXProvider
    components={{
      wrapper: Wrapper,
      h1: H1,
      h2: H2,
      h3: H3,
      h4: H4,
      h5: H5,
      h6: H6,
      p: P,
      inlineCode: InlineCode,
      code: CodeBlock,
      a: Link,
      ul: Ul,
      ol: Ol,
      li: Li,
      table: Table,
      thead: THead,
      tbody: TBody,
      tr: Tr,
      th: Th,
      td: Td,
      blockquote: Blockquote,
      img: Img,
    }}
  >
    {storyFn()}
  </MDXProvider>
);

addDecorator(MDXWrapper);

addParameters({
  options: {
    showPanel: false,
  },
});

configure(loadStories, module);
