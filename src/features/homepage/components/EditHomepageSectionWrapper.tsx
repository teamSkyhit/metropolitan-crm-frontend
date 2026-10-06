
'use client';

import React from 'react';
import { HomepageSectionForm } from './HomepageSectionForm';
import { useHomepageSection } from '../hooks/useHomepage';

export function EditHomepageSectionWrapper({ id }: { id: string }) {
  const { data: section, isLoading, isError } = useHomepageSection(id);

  if (isLoading) return <div className="text-center py-10">Loading section...</div>;
  if (isError || !section) return <div className="text-center py-10 text-red-500">Failed to load section.</div>;

  return <HomepageSectionForm initialData={section} />;
}
