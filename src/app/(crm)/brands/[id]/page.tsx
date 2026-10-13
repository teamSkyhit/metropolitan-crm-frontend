import { BrandEditClient } from '@/features/brands/components/BrandEditClient';

export default async function EditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <BrandEditClient id={params.id} />;
}
