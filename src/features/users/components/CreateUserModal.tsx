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
    try {
      await create.mutateAsync({
        name,
        email,
        password,
        role: 'SALES_MANAGER',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Create Sales Manager">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
            {errorMsg}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="text"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
