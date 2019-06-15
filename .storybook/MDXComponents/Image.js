import React from 'react';
import { css } from 'emotion';

const cls = {
  Image: css`
    max-width: 100%;
  `,
};

export const Img = props => <img className={cls.Image} {...props} />;
