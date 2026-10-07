'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useContacts, useDeleteContact } from '@/features/contacts/hooks/useContacts';
import { Trash2, Eye, Mail, Phone, Calendar } from 'lucide-react';
import { ContactStatus } from '@/features/contacts/types';

function ContactListContent() {
  const { data: contacts, isLoading, error } = useContacts();
  const deleteContact = useDeleteContact();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading contacts...</div>;
  }

  if (error) {
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
      error.message;
    return <div className="p-8 text-center text-red-500">Error: {msg}</div>;
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await deleteContact.mutateAsync(id);
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {errorMsg && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">{errorMsg}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Subject
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No contacts found.
                </td>
              </tr>
            ) : (
              contacts?.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" /> {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" /> {contact.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                      {contact.subject || 'No Subject'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contact.status)}`}
                    >
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading view...</div>}>
        <ContactListContent />
      </Suspense>
    </div>
  );
}
