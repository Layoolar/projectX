export const ENDPOINTS = Object.freeze({
  auth: {
    get_url: () => "/auth/twitter/",
    get_params: ({ code, state }) =>
      `/auth/twitter/callback?code=${code}&state=${state}`,
  },
  tasks: {
    base: () => "/tasks/",
    single: (task_id) => `/tasks/${task_id}`,
    admin: {
      base: () => "/admin/tasks",
      create: () => "/admin/task/create",
      update: (task_id) => `/admin/task?id=${task_id}`,
      delete: (task_id) => `/admin/task/${task_id}`,
    },
  },
  verify: {
    base: () => "/verify",
    create: () => "/admin/task/create",
    retweet: () => "/verify/",
    post_verify: (taskId) => `/verify/${taskId}`,
  },
  user: {
    task_history: () => "/user/tasks/history",
    profile: () => "/user/profile",
    leaderboard: () => "/user/leaderboard",
    points: () => "/user/points/",
    get_rank: () => `/user/rank/`,
    admin: {
      promote_user_to_admin: () => "/admin/user/promote",
      demote_user_to_admin: () => "/admin/user/demote",
    },
    referral: {
      generate_code: () => "/referral/code/",
      use_code: () => `/referral/use`,
      get_stats: () => "/referral/stats",
    },
  },
});

export const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://13.60.81.209:3000";
