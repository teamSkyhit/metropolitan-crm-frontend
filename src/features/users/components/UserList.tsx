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
import { Role } from '@/types/auth';
import { cn } from '@/lib/utils/cn';
import {
  Pencil,
  Trash2,
  KeyRound,
  Power,
  PowerOff,
  AlertCircle,
  RefreshCcw,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: {
    label: 'SUPER ADMIN',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  CRM_USER: {
    label: 'CRM USER',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export function UserList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { data, isLoading, isError, refetch } = useUsers({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    role: roleFilter === 'all' ? undefined : (roleFilter as Role),
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
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to soft delete this user?',
      onConfirm: async () => {
        try {
          await deleteUser.mutateAsync(id);
          toast.success('User deleted successfully');
        } catch (err: any) {
          toast.error(
            err?.response?.data?.error?.message ||
              err?.response?.data?.message ||
              'Failed to delete user'
          );
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await setStatus.mutateAsync({
        id: user.id,
        payload: { isActive: !user.isActive },
      });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          'Failed to toggle status'
      );
    }
  };

  const users = data?.data || [];
  const meta = data?.meta?.pagination;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="Search users"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-2 focus:ring-[#102f57]/10"
            >
              <option value="all">All Roles</option>
              <option value="CRM_USER">CRM User</option>
            </select>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Add CRM User
          </Button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Create and manage CRM users, control account access, and reset credentials.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Loading user accounts…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-red-800">Failed to load users</h3>
                    <p className="text-sm text-red-600 mt-2 mb-4">
                      There was an error communicating with the server.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => refetch()}
                      className="border-red-200 text-red-700 hover:bg-red-100"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center text-gray-500">
                  <Users className="mx-auto mb-3 h-9 w-9 text-slate-300" />
                  <p className="font-semibold text-slate-700">No users found</p>
                  <p className="mt-1 text-sm text-slate-500">Try another search or add a user.</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-semibold text-slate-900">{user.name}</TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wider',
                        ROLE_BADGES[user.role]?.className ||
                          'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {ROLE_BADGES[user.role]?.label || user.role.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {user.role !== 'SUPER_ADMIN' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(user)}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                          aria-label={user.isActive ? 'Deactivate user' : 'Activate user'}
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
                          aria-label="Reset user password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingUser(user)}
                          title="Edit User"
                          aria-label="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-slate-600">
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        isDestructive={confirmDialog.title.includes('Delete')}
      />
    </div>
  );
}
