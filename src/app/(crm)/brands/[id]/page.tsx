import { BrandEditClient } from './client';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BrandEditClient id={id} />;
}
