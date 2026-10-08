import { ProductEditClient } from './client';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductEditClient id={id} />;
}
