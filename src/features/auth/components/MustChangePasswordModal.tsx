'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../auth.store';
import { authService } from '../auth.service';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getQueryClient } from '@/lib/api/query-client';

export function MustChangePasswordModal() {
  const { user, setAuth, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!user?.mustChangePassword) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentPassword) {
      setErrorMessage('Please enter your current temporary password.');
      return;
    }

    if (
      newPassword.length < 10 ||
      newPassword.length > 64 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setErrorMessage(
        'New password must be 10–64 characters and include at least one letter and one number.'
      );
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('New password must be different from your current temporary password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match. Please verify and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      setAuth(session.user, session.tokens);
      getQueryClient().invalidateQueries();
      toast.success('Password updated successfully! Welcome to your workspace.');
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { error?: { message?: string }; message?: string } };
      };
      const msg =
        errObj.response?.data?.error?.message ||
        errObj.response?.data?.message ||
        'Failed to change password. Please verify your current password.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {}} // Unclosable until password changed or logged out
      title="Password Change Required"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 shadow-xs">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="leading-relaxed">
            Your account was initialized with a temporary password. You must set a personal password
            before accessing the workspace.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* Current Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="current-temp-password"
            className="text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Current / Temporary Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="current-temp-password"
              type={showCurrent ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Enter temporary password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="new-permanent-password"
            className="text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="new-permanent-password"
              type={showNew ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Enter new secure password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Must be 10–64 characters with at least one letter and one number.
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirm-permanent-password"
            className="text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Confirm New Password <span className="text-red-500">*</span>
          </label>
          <Input
            id="confirm-permanent-password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => logout()}
            className="text-xs text-slate-500 hover:text-red-600"
          >
            Sign Out
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 bg-[var(--color-metro-navy)] text-white shadow-xs"
          >
            <KeyRound className="h-4 w-4" />
            {isSubmitting ? 'Updating Password…' : 'Update Password & Continue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
