import React from 'react';
import { css, cx } from 'emotion';
import { Paper, Typography } from '@material-ui/core';
import Highlight, { defaultProps } from 'prism-react-renderer';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import prismTheme from 'prism-react-renderer/themes/vsDarkPlus';

const cls = {
  InlineCode: css`
    font-family: 'Ubuntu Mono', monospace;
    border-radius: 3px;
    background-color: rgba(179, 157, 219, 0.2);
    padding: 2px 4px;
  `,

  LiveArea: css`
    margin: 24px 0;
    padding: 20px 8px;
    border-radius: 4px;
    background: #eee;
  `,

  Label: css`
    && {
      color: white;
      border-radius: 4px 4px 0 0;
      background: gray;
      line-height: 1.2;
      font-size: 0.7em;
      padding: 6px 12px 4px;
      margin-bottom: 0;
      user-select: none;
      width: fit-content;
    }
  `,

  PreviewDividor: css`
    height: 2px;
    background: rgb(255, 143, 0);
  `,

  LivePreview: css`
    background: white;
    padding: 20px 0;
    border-radius: 0 4px 4px 4px;
    position: relative;
  `,
};

const preStyle = {
  lineHeight: 1.4,
  fontFamily: "'Ubuntu Mono', monospaces",
  padding: 20,
};

export const InlineCode = props => (
  <code className={cls.InlineCode} {...props} />
);

export const CodeBlock = ({ className, children, live, ...restProps }) => {
  const language = className.replace(/language-/, '');

  if (live) {
    return (
      <Paper className={cls.LiveArea} elevation={6}>
        <LiveProvider code={children} theme={prismTheme} noInline>
          <Typography
            className={cls.Label}
            style={{ background: 'rgb(179, 157, 219)' }}
          >
            EDITOR
          </Typography>
          <LiveEditor
            style={{ ...preStyle, padding: 0 }}
            padding={preStyle.padding}
          />

          <Typography
            className={cls.Label}
            style={{ marginTop: 20, background: 'rgb(255, 143, 0)' }}
          >
            PREVIEW
          </Typography>
          <div className={cls.PreviewDividor} />
          <LivePreview className={cls.LivePreview} />
          <LiveError style={{ color: 'red' }} />
        </LiveProvider>
      </Paper>
    );
  }

  return (
    <Highlight
      {...defaultProps}
      code={children}
      theme={prismTheme}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style, ...preStyle }}>
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
