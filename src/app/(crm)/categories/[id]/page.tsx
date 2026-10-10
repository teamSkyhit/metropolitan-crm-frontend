import { CategoryEditClient } from '@/features/categories/components/CategoryEditClient';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default async function EditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <CategoryEditClient id={params.id} />;
}
