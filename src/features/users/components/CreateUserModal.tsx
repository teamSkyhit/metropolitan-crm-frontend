/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateUser } from '@/features/users/hooks/useUsers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const create = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (name.trim().length < 2) {
      setErrorMsg('Enter the user’s full name.');
      return;
    }
    if (
      password.length < 10 ||
      password.length > 64 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setErrorMsg(
        'Password must be 10–64 characters and include at least one letter and one number.'
      );
      return;
    }
    try {
      await create.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'CRM_USER',
      });
      onClose();
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Failed to create user'
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create CRM User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm text-blue-900">
          Create a new CRM user account with access exclusively to manage enquiries.
        </div>
        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            {errorMsg}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Account Role</label>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <span className="text-sm font-bold text-slate-800">CRM User</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              Enquiries Only
            </span>
          </div>
          <p className="text-xs text-slate-500">
            CRM Users have focused access exclusively to the Enquiries module (view, update,
            follow-up).
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="create-user-name" className="text-sm font-semibold text-slate-700">
            Full name <span className="text-red-600">*</span>
          </label>
          <Input
            id="create-user-name"
            autoComplete="name"
            placeholder="e.g. Priya Sharma"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="create-user-email" className="text-sm font-semibold text-slate-700">
            Work email <span className="text-red-600">*</span>
          </label>
          <Input
            id="create-user-email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="create-user-password" className="text-sm font-semibold text-slate-700">
            Temporary password <span className="text-red-600">*</span>
          </label>
          <Input
            id="create-user-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs leading-5 text-slate-500">
            Use 10–64 characters with at least one letter and one number.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Creating account…' : 'Create user'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
