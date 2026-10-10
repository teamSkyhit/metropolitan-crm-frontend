'use client';

import React from 'react';
import { HomepageSectionForm } from './HomepageSectionForm';
import { useHomepageSection } from '../hooks/useHomepage';
import { useParams } from 'next/navigation';

export function EditHomepageSectionWrapper({ id: _propId }: { id: string }) {
  const params = useParams();
  // Read the real ID from the URL at runtime (the prop is always "placeholder" in static export)
  const id = (params?.id as string) || _propId;
  const { data: section, isLoading, isError } = useHomepageSection(id);

  if (isLoading) return <div className="text-center py-10">Loading section...</div>;
  if (isError || !section)
    return <div className="text-center py-10 text-red-500">Failed to load section.</div>;

  return <HomepageSectionForm initialData={section} />;
}
