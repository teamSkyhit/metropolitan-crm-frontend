/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MustChangePasswordModal } from './MustChangePasswordModal';
import { useAuthStore } from '../auth.store';
import { authService } from '../auth.service';
import { ROLES } from '@/lib/constants/roles';

vi.mock('../auth.service', () => ({
  authService: {
    changePassword: vi.fn(),
  },
}));

vi.mock('@/lib/api/query-client', () => ({
  getQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('MustChangePasswordModal', () => {
  it('renders modal when user.mustChangePassword is true', () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        name: 'Devaki Damodara',
        email: 'devaki@example.com',
        role: ROLES.CRM_USER,
        mustChangePassword: true,
      },
      isAuthenticated: true,
    });

    render(<MustChangePasswordModal />);

    expect(screen.getByText('Password Change Required')).toBeDefined();
    expect(screen.getByLabelText(/current \/ temporary password/i)).toBeDefined();
    expect(screen.getByLabelText(/^new password/i)).toBeDefined();
    expect(screen.getByLabelText(/confirm new password/i)).toBeDefined();
  });

  it('does not render modal when user.mustChangePassword is false', () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        name: 'Devaki Damodara',
        email: 'devaki@example.com',
        role: ROLES.CRM_USER,
        mustChangePassword: false,
      },
      isAuthenticated: true,
    });

    const { container } = render(<MustChangePasswordModal />);
    expect(container.innerHTML).toBe('');
  });

  it('validates password matching and length before submitting', async () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        name: 'Devaki Damodara',
        email: 'devaki@example.com',
        role: ROLES.CRM_USER,
        mustChangePassword: true,
      },
      isAuthenticated: true,
    });

    render(<MustChangePasswordModal />);

    // Mismatched passwords
    fireEvent.change(screen.getByLabelText(/current \/ temporary password/i), {
      target: { value: 'OldTemp123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'NewSecure123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'Different123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    expect(screen.getByText(/new passwords do not match/i)).toBeDefined();
    expect(authService.changePassword).not.toHaveBeenCalled();
  });

  it('submits password change and updates auth state on success', async () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        name: 'Devaki Damodara',
        email: 'devaki@example.com',
        role: ROLES.CRM_USER,
        mustChangePassword: true,
      },
      isAuthenticated: true,
    });

    const updatedSession = {
      user: {
        id: 'u1',
        name: 'Devaki Damodara',
        email: 'devaki@example.com',
        role: ROLES.CRM_USER,
        mustChangePassword: false,
      },
      tokens: {
        accessToken: 'new-access-token',
        accessTokenExpiresIn: 900,
        refreshToken: 'new-refresh-token',
        refreshTokenExpiresAt: '2026-11-29T10:00:00.000Z',
      },
    };

    vi.mocked(authService.changePassword).mockResolvedValue(updatedSession as any);

    render(<MustChangePasswordModal />);

    fireEvent.change(screen.getByLabelText(/current \/ temporary password/i), {
      target: { value: 'OldTemp123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'NewSecurePass123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'NewSecurePass123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(authService.changePassword).toHaveBeenCalledWith({
        currentPassword: 'OldTemp123',
        newPassword: 'NewSecurePass123',
      });
      expect(useAuthStore.getState().user?.mustChangePassword).toBe(false);
    });
  });
});
