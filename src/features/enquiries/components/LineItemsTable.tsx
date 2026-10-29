import { EnquiryLineItem } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package } from 'lucide-react';

export function LineItemsTable({ items }: { items?: EnquiryLineItem[] }) {
  const lineItems = items || [];

  if (lineItems.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Package className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Requested Products</h2>
        </div>
        <p className="text-sm text-slate-500">
          No specific quote line items were specified for this enquiry.
        </p>
      </section>
    );
  }

  const totalQuantity = lineItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Requested Products</h2>
            <p className="text-xs text-slate-500">
              {lineItems.length} {lineItems.length === 1 ? 'item' : 'distinct items'} &middot; Total
              quantity: {totalQuantity}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {totalQuantity} Units
        </span>
      </div>

      {/* Mobile view: Stacked card items */}
      <div className="divide-y divide-slate-100 md:hidden">
        {lineItems.map((item) => (
          <div key={item.id} className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {item.productName || 'Historical / Custom Product'}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">SKU: {item.sku || 'N/A'}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Qty {item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view: Structured table */}
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/75">
              <TableHead className="w-36 font-semibold">SKU</TableHead>
              <TableHead className="font-semibold">Product Name</TableHead>
              <TableHead className="text-right font-semibold">Requested Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/50">
                <TableCell className="font-mono text-xs font-semibold text-slate-700">
                  {item.sku || '—'}
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {item.productName || (
                    <span className="italic text-slate-400">Historical / Custom Product</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold text-slate-900">
                  {item.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
