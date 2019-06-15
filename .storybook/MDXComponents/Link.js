import React from 'react';
import { Typography } from '@material-ui/core';
import { css } from 'emotion';

const Classes = {
  Root: css`
    color: initial;
    text-decoration: none;
    padding: 0 4px;
    border-bottom: 1px solid rgb(255, 143, 0);
    background-color: rgba(255, 143, 0, 0.2);

    &:hover {
      background-color: rgba(255, 143, 0, 0.4);
    }
  `,
};

export const Link = props => (
  <Typography variant="body1" component="span" color="primary">
    <a {...props} target="_blank" className={Classes.Root} />
  </Typography>
);
