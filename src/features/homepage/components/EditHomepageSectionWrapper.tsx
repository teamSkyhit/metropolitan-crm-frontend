'use client';

import React from 'react';
import { HomepageSectionForm } from './HomepageSectionForm';
import { useHomepageSection } from '../hooks/useHomepage';
import { useRouteId } from '@/lib/hooks/useRouteId';

export function EditHomepageSectionWrapper({ id: _propId }: { id: string }) {
  const routeId = useRouteId();
  const id = (routeId && routeId !== 'placeholder') ? routeId : (_propId !== 'placeholder' ? _propId : '');
  const { data: section, isLoading, isError } = useHomepageSection(id);

  if (!id || isLoading) return <div className="text-center py-10">Loading section...</div>;
  if (isError || !section)
    return <div className="text-center py-10 text-red-500">Failed to load section.</div>;

  return <HomepageSectionForm initialData={section} />;
}
