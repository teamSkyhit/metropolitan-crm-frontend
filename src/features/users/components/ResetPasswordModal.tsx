/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetUserPassword } from '@/features/users/hooks/useUsers';
import { User } from '@/features/users/types';

interface Props {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ user, isOpen, onClose }: Props) {
  const [newPassword, setNewPassword] = useState('');

  const resetPassword = useResetUserPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword.mutateAsync({
        id: user.id,
        payload: { newPassword },
      });
      alert('Password reset successful');
      onClose();
    } catch (error: any) {
      alert(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Failed to reset password'
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <Input
            type="text"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Must be 10-64 characters, at least one letter and one digit.
          </p>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={resetPassword.isPending}>
            {resetPassword.isPending ? 'Resetting...' : 'Reset'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
