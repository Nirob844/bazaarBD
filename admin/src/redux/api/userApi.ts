import { tagTypes } from "../teg-types";
import { baseApi } from "./baseApi";

const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //? user create
    createUser: build.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [tagTypes.user],
    }),
    //? get user
    getUser: build.query({
      query: (arg) => ({
        url: "/users",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.user],
    }),
    //? get singel user
    getSingleUser: build.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.user],
    }),

    //? Update a business type by ID
    updateUser: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.user],
    }),

    //? Delete a business type by ID
    deleteUser: build.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.user],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUserQuery,
  useGetSingleUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
