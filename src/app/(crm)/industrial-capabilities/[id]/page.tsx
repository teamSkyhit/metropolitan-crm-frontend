import { IndustrialCapabilityEditClient } from '@/features/industrial-capabilities/components/IndustrialCapabilityEditClient';

export default async function EditIndustrialCapabilityPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  return <IndustrialCapabilityEditClient id={params.id} />;
}
