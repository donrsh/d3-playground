/* tslint:disable no-namespace */

/// <reference types="d3" />

declare module '*.mdx' {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}

declare namespace d3 {
  export let autoType: any;
}
