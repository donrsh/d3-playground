import React from 'react';
import { Typography } from '@material-ui/core';

export const Ul = props => (
  <Typography variant="body1" component="ul" {...props} />
);

export const Ol = props => (
  <Typography variant="body1" component="ol" {...props} />
);

export const Li = props => (
  <Typography variant="body2" component="li" {...props} />
);
