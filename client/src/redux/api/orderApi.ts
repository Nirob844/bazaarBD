import { tagTypes } from "../teg-types";
import { baseApi } from "./baseApi";

const ORDER_URL = "/orders";

export const addOrderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    checkout: build.mutation({
      query: () => ({
        url: `${ORDER_URL}/checkout`,
        method: "POST",
      }),
      invalidatesTags: [tagTypes.order],
    }),

    getOrder: build.query({
      query: () => {
        return {
          url: `${ORDER_URL}/user-orders`,
          method: "GET",
        };
      },
      providesTags: [tagTypes.order],
    }),

    updateOrder: build.mutation({
      query: ({ id, ...data }) => ({
        url: `${ORDER_URL}/item/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.order],
    }),

    deleteOrder: build.mutation({
      query: (id) => ({
        url: `${ORDER_URL}/item/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.order],
    }),
  }),
});

export const {
  useCheckoutMutation,
  useGetOrderQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = addOrderApi;
