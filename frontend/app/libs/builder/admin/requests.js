import { _axios } from "../axios";

import { createBuilder } from "@ibnlanre/portal";
import { ENDPOINTS } from "../endpoints";

export const admin_requests_builder = createBuilder({
  task: {
    get_all: () => _axios.get(ENDPOINTS.tasks.admin.base()),
    create: (payload) => _axios.post(ENDPOINTS.tasks.admin.create(), payload),
    update: ({ payload, id }) =>
      _axios.put(ENDPOINTS.tasks.admin.update(id), payload),
    delete: (id) => _axios.delete(ENDPOINTS.tasks.admin.delete(id)),
  },
  user: {
    promote: () => _axios.post(ENDPOINTS.user.admin.promote_user_to_admin()),
    demote: () => _axios.post(ENDPOINTS.user.admin.demote_user_to_admin()),
  },
  
});
