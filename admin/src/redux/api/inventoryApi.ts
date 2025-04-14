import { tagTypes } from "../teg-types";
import { baseApi } from "./baseApi";

const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //? inventory create
    createInventory: build.mutation({
      query: (data) => ({
        url: "/inventories",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.inventory],
    }),
    //? get inventory
    getInventory: build.query({
      query: (arg) => ({
        url: "/inventories",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.inventory],
    }),
    //? get singel inventory
    getSingleInventory: build.query({
      query: (id) => ({
        url: `/inventories/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.inventory],
    }),

    //? Update a business type by ID
    updateInventory: build.mutation({
      query: ({ id, data }) => ({
        url: `/inventories/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.inventory],
    }),

    //? Delete a business type by ID
    deleteInventory: build.mutation({
      query: (id) => ({
        url: `/inventories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.inventory],
    }),
  }),
});

export const {
  useCreateInventoryMutation,
  useGetInventoryQuery,
  useGetSingleInventoryQuery,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} = inventoryApi;
