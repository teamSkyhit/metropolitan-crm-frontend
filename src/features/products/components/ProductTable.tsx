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

export function ProductTable({ products, isLoading }: { products: Product[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-8 text-center text-gray-500">
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-8 text-center text-gray-500">
        No products found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Brand & Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      {product.hotDeal && (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 mt-1">
                          Hot Deal
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-900">{product.brand.name}</p>
                  <p className="text-xs text-gray-500">{product.category.name}</p>
                </TableCell>
                <TableCell>
                  <ProductStatusBadge status={product.status} />
                </TableCell>
                <TableCell>
                  {product.price !== null ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        $${Number(product.price).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.priceVisibility ? 'Visible' : 'Hidden'}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`${ROUTES.PRODUCTS}/${product.id}`}
                    className="text-sm font-medium text-[var(--color-metro-navy)] hover:underline"
                  >
                    Manage
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
