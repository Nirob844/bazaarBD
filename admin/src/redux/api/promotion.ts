import { tagTypes } from "../teg-types";
import { baseApi } from "./baseApi";

const promotionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //? promotion create
    createPromotion: build.mutation({
      query: (data) => ({
        url: "/promotions",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.promotion],
    }),
    //? get promotion
    getPromotion: build.query({
      query: (arg) => ({
        url: "/promotions",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.promotion],
    }),
    //? get singel promotion
    getSinglePromotion: build.query({
      query: (id) => ({
        url: `/promotions/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.promotion],
    }),

    //? Update a business type by ID
    updatePromotion: build.mutation({
      query: ({ id, data }) => ({
        url: `/promotions/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.promotion],
    }),

    //? Delete a business type by ID
    deletePromotion: build.mutation({
      query: (id) => ({
        url: `/promotions/${id}`, // Assuming the endpoint for deleting uses the ID
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.promotion],
    }),
  }),
});

export const {
  useCreatePromotionMutation,
  useGetPromotionQuery,
  useGetSinglePromotionQuery,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} = promotionApi;
