import { useQuery } from "@tanstack/react-query";

import { admin_requests_builder } from "./requests";

export function useGetAllTasks() {
  return useQuery({
    queryKey: admin_requests_builder.task.get_all.get(),
    queryFn: admin_requests_builder.use().task.get_all,
  });
}
