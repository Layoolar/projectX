import { createBuilder } from "@ibnlanre/portal";
import { ENDPOINTS, BASE_URL } from "../endpoints";
import { _axios } from "../axios";
import { getCookie } from "cookies-next";
import { COOKIES } from "../constants";

export const auth_request_builder = createBuilder({
  get_url: () => _axios.get(`${BASE_URL}${ENDPOINTS.auth.get_url()}`),
  send_auth_params: ({ code, state, referralCode }) => {
    const token = getCookie(COOKIES.auth_Temp);
    return _axios.get(
      `${BASE_URL}${ENDPOINTS.auth.get_params({ code, state, referralCode })}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
});

export const user_requests_builder = createBuilder({
  get_all: () => _axios.get(ENDPOINTS.users.base()),
  task: {
    get_all: () => _axios.get(ENDPOINTS.tasks.base()),
    single: (id) => _axios.get(ENDPOINTS.tasks.single(id)),
    verify: (taskId) => _axios.post(ENDPOINTS.verify.base(), { taskId }),
  },
  user: {
    task_history: () => _axios.get(ENDPOINTS.user.task_history()),
    profile_info: () => _axios.get(ENDPOINTS.user.profile()),
    leaderboard: () => _axios.get(ENDPOINTS.user.leaderboard()),
    points: () => _axios.get(ENDPOINTS.user.points()),
    get_rank: () => _axios.get(ENDPOINTS.user.get_rank()),
  },
  referral: {
    generate_code: () => _axios.post(ENDPOINTS.user.referral.generate_code()),
    referral_use: (referralCode) =>
      _axios.post(ENDPOINTS.user.referral.use_code(), { referralCode }),
  },
});
