/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Failed to update status'
      );
    },
  });
}

export function useAssignEnquiry(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignEnquiryRequest) => enquiriesService.assignEnquiry(id, payload),
    onSuccess: () => {
      toast.success('Assignee updated successfully');
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Failed to reassign enquiry'
      );
    },
  });
}

export function useAddFollowUp(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddFollowUpRequest) => enquiriesService.addFollowUp(id, payload),
    onSuccess: () => {
      toast.success('Follow-up recorded');
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Failed to record follow-up'
      );
    },
  });
}

export function useUpdateEnquiryNotes(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEnquiryRequest) => enquiriesService.updateNotes(id, payload),
    onSuccess: () => {
      toast.success('Sales notes saved');
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Failed to save notes'
      );
    },
  });
}
