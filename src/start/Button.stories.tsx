import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Button from './button';

storiesOf('Button', module)
  .add('with text', () => <Button disabled>Hello Button</Button>)
  .add('alert', () => (
    <Button onClick={() => alert('Button clicked!')}>Alert</Button>
  ));
