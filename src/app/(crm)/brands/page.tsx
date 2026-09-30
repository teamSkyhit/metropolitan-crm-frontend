'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { brandsService } from '@/features/brands/brands.service';

export default function BrandsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsService.getBrands(1, 20)
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Brands" description="Manage your brands here." />
      
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded text-red-600">Failed to load brands.</div>
      ) : !data?.data?.length ? (
        <EmptyState />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>{brand.slug}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${brand.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
