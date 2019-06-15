import React from 'react';
import { css } from 'emotion';
import Highlight, { defaultProps } from 'prism-react-renderer';
import prismTheme from 'prism-react-renderer/themes/vsDarkPlus';

const cls = {
  InlineCode: css`
    font-family: 'Ubuntu Mono', monospace;
    border-radius: 3px;
    background-color: rgba(179, 157, 219, 0.2);
    padding: 2px 4px;
  `,
};

export const InlineCode = props => (
  <code className={cls.InlineCode} {...props} />
);

export const CodeBlock = ({ className, children, ...restProps }) => {
  const language = className.replace(/language-/, '');

  return (
    <Highlight
      {...defaultProps}
      code={children}
      theme={prismTheme}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className}
          style={{
            ...style,
            padding: '20px',
            lineHeight: 1.4,
            fontFamily: "'Ubuntu Mono', monospaces",
          }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
