'use client';

import { useContact, useUpdateContactStatus } from '@/features/contacts/hooks/useContacts';
import { ContactStatus } from '@/features/contacts/types';
import { ArrowLeft, Calendar, Mail, Phone, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, use } from 'react';

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: contact, isLoading, error } = useContact(id);
  const updateStatus = useUpdateContactStatus();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading contact details...</div>;
  }

  if (error || !contact) {
    const msg =
      (
        error as {
          response?: { data?: { error?: { message?: string }; message?: string } };
          message?: string;
        }
      )?.response?.data?.error?.message ||
      (
        error as {
          response?: { data?: { error?: { message?: string }; message?: string } };
          message?: string;
        }
      )?.response?.data?.message ||
      (
        error as {
          response?: { data?: { error?: { message?: string }; message?: string } };
          message?: string;
        }
      )?.message ||
      'Failed to load contact';
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-md">Error: {msg}</div>
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
    } catch (err: unknown) {
      setErrorMsg(
        err?.response?.data?.error?.message || err?.response?.data?.message || err.message
      );
    }
  };

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details and message from the contact form.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={contact.status}
              onChange={handleStatusChange}
              disabled={updateStatus.isPending}
              className={`block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md font-semibold ${getStatusColor(contact.status)}`}
            >
              <option value="New" className="bg-white text-gray-900">
                New
              </option>
              <option value="Contacted" className="bg-white text-gray-900">
                Contacted
              </option>
              <option value="Closed" className="bg-white text-gray-900">
                Closed
              </option>
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
                <User className="w-4 h-4" /> Full name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contact.name}</dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email address
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
                <Phone className="w-4 h-4" /> Phone number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {contact.phone ? (
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    {contact.phone}
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
                <MessageSquare className="w-4 h-4" /> Subject
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                {contact.subject || <span className="text-gray-400 font-normal">No subject</span>}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Message</dt>
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
