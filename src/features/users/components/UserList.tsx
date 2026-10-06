/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useUsers, useDeleteUser, useSetUserStatus } from '@/features/users/hooks/useUsers';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { User } from '@/features/users/types';
import { Pencil, Trash2, KeyRound, Power, PowerOff } from 'lucide-react';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { ResetPasswordModal } from './ResetPasswordModal';

export function UserList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

  const { data, isLoading, error } = useUsers({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const deleteUser = useDeleteUser();
  const setStatus = useSetUserStatus();

  // Simple debounce for search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to soft delete this user?')) {
      try {
        await deleteUser.mutateAsync(id);
      } catch (err: any) {
        alert(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Failed to delete user'
        );
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await setStatus.mutateAsync({
        id: user.id,
        payload: { isActive: !user.isActive },
      });
    } catch (err: any) {
      alert(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          'Failed to toggle status'
      );
    }
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users</div>;

  const users = data?.data || [];
  const meta = data?.meta?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => setIsCreateModalOpen(true)}>Create Sales Manager</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(user)}
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {user.isActive ? (
                      <PowerOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Power className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setResetPasswordUser(user)}
                    title="Reset Password"
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingUser(user)}
                    title="Edit User"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user.id)}
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          isOpen={!!resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
        />
      )}
    </div>
  );
}
