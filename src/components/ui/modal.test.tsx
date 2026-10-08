import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { expect, test, vi, afterEach } from 'vitest';
import { Modal } from './modal';

afterEach(cleanup);

test('renders modal when isOpen is true', () => {
  render(
    <Modal isOpen={true} onClose={() => {}} title="Test Modal">
      <div>Modal Content</div>
    </Modal>
  );
  expect(screen.getByText('Test Modal')).toBeDefined();
  expect(screen.getByText('Modal Content')).toBeDefined();
});

test('does not render modal when isOpen is false', () => {
  render(
    <Modal isOpen={false} onClose={() => {}} title="Test Modal">
      <div>Modal Content</div>
    </Modal>
  );
  expect(screen.queryByText('Test Modal')).toBeNull();
});

test('calls onClose when close button is clicked', () => {
  const onClose = vi.fn();
  render(
    <Modal isOpen={true} onClose={onClose} title="Test Modal">
      <div>Modal Content</div>
    </Modal>
  );
  fireEvent.click(screen.getByLabelText('Close modal'));
  expect(onClose).toHaveBeenCalled();
});
