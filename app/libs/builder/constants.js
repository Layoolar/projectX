export const COOKIES = {
  auth: "connect.sid",
  auth_Token: "authTokenized",
  auth_Temp: "authTemp",
  user: "user",
  options: {
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
    // secure: process.env.NODE_ENV === "production",
  },

  auth_options: {
    sameSite: "lax",
    maxAge: 300,
    path: "/",
    // secure: process.env.NODE_ENV === "production",
  },
};
