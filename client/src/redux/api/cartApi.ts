import { tagTypes } from "../teg-types";
import { baseApi } from "./baseApi";

const CART_URL = "/cart";

export const addCartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    addCart: build.mutation({
      query: (data) => ({
        url: CART_URL,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.cart],
    }),

    getCart: build.query({
      query: (id) => {
        return {
          url: `${CART_URL}/${id}`,
          method: "GET",
        };
      },
      providesTags: [tagTypes.cart],
    }),

    updateCart: build.mutation({
      query: ({ id, ...data }) => ({
        url: `${CART_URL}/item/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.cart],
    }),

    deleteCart: build.mutation({
      query: (id) => ({
        url: `${CART_URL}/item/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.cart],
    }),
  }),
});

export const {
  useAddCartMutation,
  useGetCartQuery,
  useUpdateCartMutation,
  useDeleteCartMutation,
} = addCartApi;
