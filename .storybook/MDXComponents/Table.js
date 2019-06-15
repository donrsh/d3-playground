import React from 'react';
import {
  Paper,
  Table as MUITable,
  TableHead as MUITableHead,
  TableBody as MUITableBody,
  TableRow as MUITableRow,
  TableCell as MUITableCell,
} from '@material-ui/core';

export const Table = props => (
  <Paper>
    <MUITable {...props} />
  </Paper>
);

export const THead = props => <MUITableHead {...props} />;

export const TBody = props => <MUITableBody {...props} />;

export const Tr = props => <MUITableRow {...props} />;

export const Th = props => <MUITableCell>{props.children}</MUITableCell>;

export const Td = props => <MUITableCell>{props.children}</MUITableCell>;
