/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useUpdateUser } from '@/features/users/hooks/useUsers';
import { User } from '@/features/users/types';

interface Props {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserModal({ user, isOpen, onClose }: Props) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const update = useUpdateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Enter the user’s full name.');
      return;
    }
    try {
      await update.mutateAsync({
        id: user.id,
        payload: { name: name.trim(), email: email.trim() },
      });
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Failed to update user'
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          Update the contact details used for this user’s CRM account.
        </p>
        <div className="space-y-2">
          <label htmlFor="edit-user-name" className="text-sm font-semibold text-slate-700">
            Full name <span className="text-red-600">*</span>
          </label>
          <Input
            id="edit-user-name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="edit-user-email" className="text-sm font-semibold text-slate-700">
            Work email <span className="text-red-600">*</span>
          </label>
          <Input
            id="edit-user-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Saving changes…' : 'Save changes'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          confirmConfig.onConfirm();
          setIsConfirmOpen(false);
        }}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
    </Modal>
  );
}
