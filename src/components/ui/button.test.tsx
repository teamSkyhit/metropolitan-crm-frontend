import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { expect, test, vi, afterEach } from 'vitest';
import { Button } from './button';

afterEach(cleanup);

test('renders button with text', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText('Click Me')).toBeDefined();
});

test('calls onClick when clicked', () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click Me</Button>);
  fireEvent.click(screen.getByText('Click Me'));
  expect(onClick).toHaveBeenCalled();
});
