import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { HomepageSectionList } from './HomepageSectionList';
import { HomepageSectionType } from '../types';

const mockSections = [
  {
    id: 'sec-1',
    type: HomepageSectionType.HERO,
    title: null,
    subtitle: 'Main hero',
    sortOrder: 0,
    isActive: true,
    content: { slides: [{ heading: 'Slide 1', mediaId: 'm1' }] },
  },
  {
    id: 'sec-2',
    type: HomepageSectionType.FEATURED_CATEGORIES,
    title: null,
    subtitle: null,
    sortOrder: 1,
    isActive: true,
    content: { categoryIds: ['c1', 'c2'] },
  },
  {
    id: 'sec-3',
    type: HomepageSectionType.FEATURED_PRODUCTS,
    title: null,
    subtitle: null,
    sortOrder: 2,
    isActive: false,
    content: { productIds: ['p1'] },
  },
  {
    id: 'sec-4',
    type: HomepageSectionType.FEATURED_BRANDS,
    title: null,
    subtitle: null,
    sortOrder: 3,
    isActive: true,
    content: { brandIds: ['b1'] },
  },
  {
    id: 'sec-5',
    type: HomepageSectionType.PROMO_BANNER,
    title: 'Technical Product Support',
    subtitle: 'Expert engineering support',
    sortOrder: 4,
    isActive: true,
    content: { heading: 'Need Engineering Help?', mediaId: 'm2' },
  },
];

vi.mock('../hooks/useHomepage', () => ({
  useHomepageSections: () => ({
    data: mockSections,
    isLoading: false,
    isError: false,
  }),
  useReorderHomepageSections: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteHomepageSection: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

afterEach(cleanup);

describe('HomepageSectionList', () => {
  it('renders the website homepage content structure sequence banner', () => {
    render(<HomepageSectionList />);

    expect(screen.getByText(/Website Homepage Content Structure/i)).toBeDefined();
    expect(screen.getByText('1.')).toBeDefined();
    expect(screen.getAllByText('Hero').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Product Categories').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Technical Product Support').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Featured Products').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Why Metropolitan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Brands').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Need a Product / Component').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Footer').length).toBeGreaterThan(0);
  });

  it('displays sections with visible sort order, human-readable labels, and status badges', () => {
    render(<HomepageSectionList />);

    // Check visible Sort Order tags
    expect(screen.getByText('Order #1')).toBeDefined();
    expect(screen.getByText('Order #2')).toBeDefined();
    expect(screen.getByText('Order #3')).toBeDefined();
    expect(screen.getByText('Order #4')).toBeDefined();
    expect(screen.getByText('Order #5')).toBeDefined();

    // Check human-readable section labels matching website requirements
    expect(screen.getAllByText('Hero').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Product Categories').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Featured Products').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Brands').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Technical Product Support').length).toBeGreaterThan(0);

    // Check Active / Inactive badges
    expect(screen.getAllByText('Active').length).toBe(4);
    expect(screen.getByText('Inactive')).toBeDefined();

    // Check Edit actions
    const editLinks = screen.getAllByLabelText('Edit homepage section');
    expect(editLinks.length).toBe(5);
  });
});
