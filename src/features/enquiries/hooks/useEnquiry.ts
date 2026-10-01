import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enquiriesService } from '../enquiries.service';
import {
  ChangeEnquiryStatusRequest,
  AssignEnquiryRequest,
  AddFollowUpRequest,
  UpdateEnquiryRequest,
} from '../types';

export function useEnquiry(id: string) {
  return useQuery({
    queryKey: ['enquiry', id],
    queryFn: () => enquiriesService.getEnquiryById(id),
    retry: false,
  });
}

export function useUpdateEnquiryStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeEnquiryStatusRequest) => enquiriesService.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAssignEnquiry(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignEnquiryRequest) => enquiriesService.assignEnquiry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddFollowUp(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddFollowUpRequest) => enquiriesService.addFollowUp(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
    },
  });
}

export function useUpdateEnquiryNotes(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEnquiryRequest) => enquiriesService.updateNotes(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
    },
  });
}
