import { ProductEditClient } from '@/features/products/components/ProductEditClient';

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <ProductEditClient id={params.id} />;
}
