'use client';

import React, { use, useState, useEffect } from 'react';
import axios from 'axios';
import { useContact, useUpdateContactStatus } from '@/features/contacts/hooks/useContacts';
import { ContactStatus } from '@/features/contacts/types';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  User,
  MessageSquare,
  Building,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/auth.store';
import { hasPermission } from '@/features/auth/permissions';

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: contact, isLoading, error } = useContact(id);
  const updateStatus = useUpdateContactStatus();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);



  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading contact details...</div>;
  }

  if (error || !contact) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-md">Error: Failed to load contact</div>
        <Link
          href="/contacts"
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Contacts
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ContactStatus;
    setErrorMsg(null);
    try {
      await updateStatus.mutateAsync({ id, payload: { status: newStatus } });
      setToastMsg('Status updated successfully');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setToastMsg('Invalid status transition');
        } else {
          setErrorMsg(
            err.response?.data?.error?.message || err.response?.data?.message || err.message
          );
        }
      } else {
        setErrorMsg((err as Error).message || 'An error occurred');
      }
    }
  };

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'READ':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const allowedTransitions = (): ContactStatus[] => {
    if (contact.status === 'NEW') return ['NEW', 'READ', 'ARCHIVED'];
    if (contact.status === 'READ') return ['READ', 'ARCHIVED'];
    return ['ARCHIVED']; // No transitions from ARCHIVED
  };

  const canUpdateStatus = hasPermission(user, 'contacts:update') && contact.status !== 'ARCHIVED';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMsg}
        </div>
      )}

      <div className="mb-6">
        <Link
          href="/contacts"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Contacts
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start flex-wrap gap-4">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Information</h3>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={contact.status}
              onChange={handleStatusChange}
              disabled={updateStatus.isPending || !canUpdateStatus}
              className={`block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md font-semibold ${getStatusColor(contact.status)}`}
            >
              {allowedTransitions().map((s) => (
                <option key={s} value={s} className="bg-white text-gray-900">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="px-4 py-3 bg-red-50 border-t border-b border-red-200 text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <User className="w-4 h-4" /> Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contact.name}</dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {contact.email}
                </a>
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Mobile
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {contact.mobile ? (
                  <a
                    href={`tel:${contact.mobile}`}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    {contact.mobile}
                  </a>
                ) : (
                  <span className="text-gray-400">Not provided</span>
                )}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Building className="w-4 h-4" /> Company
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {contact.company || <span className="text-gray-400">Not provided</span>}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Page URL
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {contact.pageUrl ? (
                  <a
                    href={contact.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    {contact.pageUrl}
                  </a>
                ) : (
                  <span className="text-gray-400">Not provided</span>
                )}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date submitted
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(contact.createdAt).toLocaleString()}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Message
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {contact.message}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
