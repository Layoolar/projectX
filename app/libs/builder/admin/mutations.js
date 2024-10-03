import { admin_requests_builder } from "./requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: admin_requests_builder.use().task.create,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: admin_requests_builder.task.get_all.get(),
      });
    },
  });
}
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: admin_requests_builder.use().task.update,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: admin_requests_builder.task.get_all.get(),
      });
    },
  });
}
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: admin_requests_builder.use().task.delete,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: admin_requests_builder.task.get_all.get(),
      });
    },
  });
}

export function usePromoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: admin_requests_builder.use().user.promote,
  });
}
export function useDemoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: admin_requests_builder.use().user.demote,
  });
}
