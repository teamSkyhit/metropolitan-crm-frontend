import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { expect, test, vi, afterEach, beforeEach } from 'vitest';
import { CreateUserModal } from './CreateUserModal';

const mockMutateAsync = vi.fn();

vi.mock('@/features/users/hooks/useUsers', () => ({
  useCreateUser: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

test('renders Create CRM User modal and indicates CRM User role', () => {
  render(<CreateUserModal isOpen={true} onClose={() => {}} />);

  expect(screen.getByText('Create CRM User')).toBeDefined();
  expect(screen.getByText('CRM User')).toBeDefined();
  expect(screen.getByText('Enquiries Only')).toBeDefined();
});

test('submits form with CRM_USER role', async () => {
  mockMutateAsync.mockResolvedValue({});
  const onClose = vi.fn();

  render(<CreateUserModal isOpen={true} onClose={onClose} />);

  // Fill in inputs
  fireEvent.change(screen.getByPlaceholderText(/e\.g\. Priya Sharma/i), {
    target: { value: 'Alice CRM' },
  });
  fireEvent.change(screen.getByPlaceholderText(/name@company\.com/i), {
    target: { value: 'alice@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/temporary password/i), {
    target: { value: 'SecurePass123' },
  });

  fireEvent.click(screen.getByRole('button', { name: /create user/i }));

  await waitFor(() => {
    expect(mockMutateAsync).toHaveBeenCalledWith({
      name: 'Alice CRM',
      email: 'alice@example.com',
      password: 'SecurePass123',
      role: 'CRM_USER',
    });
    expect(onClose).toHaveBeenCalled();
  });
});
