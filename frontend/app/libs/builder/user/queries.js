import { useQuery } from "@tanstack/react-query";

import { user_requests_builder } from "./requests";
import { ENDPOINTS } from "../endpoints";
import { _axios } from "../axios";

export function useGetUserTasks() {
  return useQuery({
    queryKey: user_requests_builder.task.get_all.get(),
    queryFn: user_requests_builder.use().task.get_all,
  });
}
export function useGetUserSingleTask(id) {
  return useQuery({
    queryKey: user_requests_builder.task.single.get(id),
    queryFn: () => user_requests_builder.use().task.single(id),
    enabled: !!id,
  });
}
export function useGetUserPoints() {
  return useQuery({
    queryKey: user_requests_builder.user.points.get(),
    queryFn: user_requests_builder.use().user.points,
  });
}
export function useGetTaskHistory() {
  return useQuery({
    queryKey: user_requests_builder.user.task_history.get(),
    queryFn: user_requests_builder.use().user.task_history,
  });
}
export function useGetProfileInformation() {
  return useQuery({
    queryKey: user_requests_builder.user.profile_info.get(),
    queryFn: user_requests_builder.use().user.profile_info,
  });
}

export function useGetLeaderboard() {
  return useQuery({
    queryKey: user_requests_builder.user.leaderboard.get(),
    queryFn: user_requests_builder.use().user.leaderboard,
  });
}

export function useGetPoints() {
  return useQuery({
    queryKey: user_requests_builder.user.points.get(),
    queryFn: user_requests_builder.use().user.points,
  });
}

export function useGetRank() {
  return useQuery({
    queryKey: user_requests_builder.user.get_rank.get(),
    queryFn: user_requests_builder.use().user.get_rank,
  });
}
