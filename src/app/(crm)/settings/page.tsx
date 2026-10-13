'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuthStore } from '@/features/auth/auth.store';
import { authService } from '@/features/auth/auth.service';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { User, Shield, KeyRound, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setAuth, logoutAll } = useAuthStore();

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Logout All State
  const [showConfirmLogoutAll, setShowConfirmLogoutAll] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const validatePasswordPolicy = (pwd: string): string | null => {
    if (pwd.length < 10) return 'Password must be at least 10 characters long.';
    if (pwd.length > 64) return 'Password must be at most 64 characters long.';
    if (!/[A-Za-z]/.test(pwd)) return 'Password must contain at least one letter.';
    if (!/\d/.test(pwd)) return 'Password must contain at least one digit.';
    return null;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    const policyError = validatePasswordPolicy(newPassword);
    if (policyError) {
      setPasswordError(policyError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      // Update auth store with returned fresh tokens/user
      setAuth(res.user, res.tokens);

      setPasswordSuccess('Password successfully changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully.');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      const errorCode = err?.response?.data?.error?.code;
      const errorMessage =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Failed to change password.';

      if (errorCode === 'AUTH_INVALID_CURRENT_PASSWORD') {
        setPasswordError('The current password entered is incorrect.');
      } else {
        setPasswordError(errorMessage);
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    setShowConfirmLogoutAll(false);
    try {
      await logoutAll();
      toast.success('Successfully signed out of all devices.');
      router.replace(ROUTES.LOGIN);
    } catch {
      toast.error('Failed to sign out of all sessions.');
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Account Settings"
        description="Manage your account profile, security preferences, and active sessions."
      />

      {/* 1. Account Information */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--color-metro-navy)]/10 text-[var(--color-metro-navy)]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            <p className="text-sm text-gray-500">Your profile details managed by the system.</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Full Name
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 bg-white p-2.5 rounded-md border border-gray-200">
              {user?.name || 'Not provided'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Email Address
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 bg-white p-2.5 rounded-md border border-gray-200">
              {user?.email || 'Not provided'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Role
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 bg-white p-2.5 rounded-md border border-gray-200">
              {user?.role?.replace('_', ' ') || 'User'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account Status
            </label>
            <div className="mt-1 flex items-center h-[42px]">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  user?.isActive
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Security / Change Password */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--color-metro-navy)]/10 text-[var(--color-metro-navy)]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Security & Password</h2>
            <p className="text-sm text-gray-500">
              Update your account password. Must be 10–64 characters and contain letters and
              numbers.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
          {passwordError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-md bg-green-50 border border-green-200 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-metro-navy)] focus:border-transparent text-sm"
              placeholder="••••••••••••"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-metro-navy)] focus:border-transparent text-sm"
                placeholder="At least 10 characters with letter & number"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-metro-navy)] focus:border-transparent text-sm"
                placeholder="Repeat new password"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmittingPassword}
              className="bg-[var(--color-metro-navy)] hover:bg-[var(--color-metro-navy)]/90 text-white"
            >
              {isSubmittingPassword ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Session Management / Logout Everywhere */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50 text-red-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Session Management</h2>
            <p className="text-sm text-gray-500">
              Manage your active login sessions across devices and browsers.
            </p>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Sign out of all sessions</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Revokes all active refresh tokens for this account across every browser and device.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowConfirmLogoutAll(true)}
            disabled={isLoggingOutAll}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 shrink-0 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out all devices</span>
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmLogoutAll}
        title="Sign Out Everywhere"
        message="Are you sure you want to sign out of all devices? This will invalidate all active sessions including this one, requiring you to log in again."
        confirmLabel="Sign Out Everywhere"
        isDestructive={true}
        onConfirm={handleLogoutAll}
        onCancel={() => setShowConfirmLogoutAll(false)}
      />
    </div>
  );
}
