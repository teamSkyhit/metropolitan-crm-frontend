/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetUserPassword } from '@/features/users/hooks/useUsers';
import { User } from '@/features/users/types';
import toast from 'react-hot-toast';

interface Props {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ user, isOpen, onClose }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resetPassword = useResetUserPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (
      newPassword.length < 10 ||
      newPassword.length > 64 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setErrorMsg(
        'Password must be 10–64 characters and include at least one letter and one number.'
      );
      return;
    }
    try {
      await resetPassword.mutateAsync({
        id: user.id,
        payload: { newPassword },
      });
      toast.success('Password reset successful');
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Failed to reset password'
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Set a temporary password for <span className="font-semibold">{user.name}</span>. Share it
          securely.
        </p>
        {errorMsg && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            {errorMsg}
          </p>
        )}
        <div className="space-y-2">
          <label htmlFor="reset-user-password" className="text-sm font-semibold text-slate-700">
            New password <span className="text-red-600">*</span>
          </label>
          <Input
            id="reset-user-password"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Must be 10–64 characters with at least one letter and one number.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={resetPassword.isPending}>
            {resetPassword.isPending ? 'Resetting password…' : 'Reset password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
