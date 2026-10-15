import { EnquiryLineItem } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LineItemsTable({ items }: { items: EnquiryLineItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900">Requested Products</h2>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-slate-900">
                {item.productName || 'Unnamed product'}
              </p>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Qty {item.quantity}
              </span>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              SKU {item.sku}
            </p>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.sku}</TableCell>
                <TableCell>{item.productName || '-'}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
