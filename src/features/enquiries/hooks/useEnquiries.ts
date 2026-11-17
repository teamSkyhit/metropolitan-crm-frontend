import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { enquiriesService } from '../enquiries.service';
import { GetEnquiriesQuery } from '../types';

export function useEnquiries(query: GetEnquiriesQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['enquiries', query],
    queryFn: () => enquiriesService.getEnquiries(query),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}
