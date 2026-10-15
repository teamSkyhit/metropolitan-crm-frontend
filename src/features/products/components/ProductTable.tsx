/* eslint-disable @next/next/no-img-element */
import { Product } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductStatusBadge } from './ProductStatusBadge';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

import { ChevronRight, Flame, Package } from 'lucide-react';

export function ProductTable({ products, isLoading }: { products: Product[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(15,38,68,0.04)] p-12 text-center text-slate-500">
        <div className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-slate-200 border-t-[var(--color-metro-navy)] mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading catalog products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(15,38,68,0.04)] p-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
          <Package className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">No products found</p>
        <p className="mt-1 text-xs text-slate-500">Try adjusting your search terms or filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(15,38,68,0.04)] overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/70">
              <TableHead className="py-3.5 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Product
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Brand & Category
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Price
              </TableHead>
              <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                className="group border-b border-slate-100 hover:bg-blue-50/30 transition-colors"
              >
                <TableCell className="py-3.5 pl-6">
                  <div className="flex items-center gap-3.5">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 shrink-0">
                        <Package className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-[var(--color-metro-navy)] transition-colors truncate max-w-xs">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] font-medium text-slate-500">
                          SKU: {product.sku}
                        </span>
                        {product.hotDeal && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 ring-1 ring-inset ring-rose-500/20">
                            <Flame className="h-3 w-3 text-rose-500 fill-rose-500" />
                            Hot Deal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <p className="text-sm font-semibold text-slate-800">{product.brand.name}</p>
                  <p className="text-xs text-slate-500">{product.category.name}</p>
                </TableCell>
                <TableCell className="py-3.5">
                  <ProductStatusBadge status={product.status} />
                </TableCell>
                <TableCell className="py-3.5">
                  {product.price !== null ? (
                    <div>
                      <p className="font-mono text-sm font-bold text-slate-900">
                        ${Number(product.price).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block text-[11px] font-medium ${product.priceVisibility ? 'text-emerald-600' : 'text-slate-400'}`}
                      >
                        {product.priceVisibility ? 'Public' : 'Hidden'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 font-mono">-</span>
                  )}
                </TableCell>
                <TableCell className="py-3.5 pr-6 text-right">
                  <Link
                    href={`${ROUTES.PRODUCTS}/${product.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-[var(--color-metro-navy)] shadow-2xs transition-all hover:bg-[var(--color-metro-navy)] hover:text-white hover:shadow-xs"
                  >
                    Manage
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
