import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { enquiriesService } from '../enquiries.service';
import { GetEnquiriesQuery } from '../types';

export function useEnquiries(query: GetEnquiriesQuery) {
  return useQuery({
    queryKey: ['enquiries', query],
    queryFn: () => enquiriesService.getEnquiries(query),
    placeholderData: keepPreviousData,
  });
}
