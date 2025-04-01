import { tagTypes } from "../teg-types";
import { baseApi } from "./baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //? user login
    userLogin: build.mutation({
      query: (loginData) => ({
        url: "/auth/signin",
        method: "POST",
        data: loginData,
      }),
      invalidatesTags: [tagTypes.auth],
    }),
  }),
});

export const { useUserLoginMutation } = authApi;
