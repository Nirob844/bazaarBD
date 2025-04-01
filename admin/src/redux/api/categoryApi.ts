import { tagTypes } from "../teg-types";
import { baseApi } from "./baseApi";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //? category create
    createCategory: build.mutation({
      query: (formData) => ({
        url: "/categories",
        method: "POST",
        data: formData,
        contentType: "multipart/form-data",
      }),
      invalidatesTags: [tagTypes.category],
    }),
    //? get category
    getCategory: build.query({
      query: (arg) => ({
        url: "/categories",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.category],
    }),
    //? get singel category
    getSingleCategory: build.query({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.category],
    }),

    //? Update a business type by ID
    updateCategory: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.category],
    }),

    //? Delete a business type by ID
    deleteCategory: build.mutation({
      query: (id) => ({
        url: `/categories/${id}`, // Assuming the endpoint for deleting uses the ID
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.category],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetCategoryQuery,
  useGetSingleCategoryQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
