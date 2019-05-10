import * as React from 'react';
import { cleanup, fireEvent, render } from 'react-testing-library';

import Button from './Button';

afterEach(cleanup);

test('Render <Button/> properly', () => {
  const btnText = 'test-string';

  const { container } = render(<Button>{btnText}</Button>);

  const btnEl = container.querySelector('button');

  // A button element should be rendered
  expect(btnEl).toBeInTheDocument();

  // The btn should have btnText text node
  expect(btnEl).toHaveTextContent(btnText);
});

test('`disable` prop works', () => {
  const { container } = render(<Button disabled>123</Button>);

  const btnEl = container.querySelector('button');

  // The button should be disabled
  expect(btnEl).toBeDisabled();
});

test('`onClick` prop works', () => {
  const handleClick = jest.fn();
  const { container } = render(<Button onClick={handleClick}>123</Button>);

  const btnEl = container.querySelector('button');

  fireEvent.click(btnEl as any);

  // The button should be disabled
  expect(handleClick).toBeCalledTimes(1);
});
