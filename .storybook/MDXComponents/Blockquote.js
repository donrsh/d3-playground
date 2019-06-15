import React from 'react';
import { css } from 'emotion';

const cls = {
  Blockquote: css`
    position: relative;
    text-align: center;
    padding: 50px 0;

    &::before {
      position: absolute;
      content: '❝';
      color: lightgray;
      font-size: 40px;
      top: 0;
    }

    &::after {
      position: absolute;
      content: '❞';
      color: lightgray;
      font-size: 40px;
      bottom: 0;
    }
  `,
};

export const Blockquote = props => (
  <blockquote {...props} className={cls.Blockquote} />
);
