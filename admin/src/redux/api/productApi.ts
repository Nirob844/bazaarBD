import { tagTypes } from "../teg-types";
import { baseApi } from "./baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //? product create
    createProduct: build.mutation({
      query: (data) => ({
        url: "/products",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.product],
    }),
    //? product image
    uploadProductImage: build.mutation({
      query: (data) => ({
        url: "/products/product_images",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.product],
    }),
    //? get product
    getProduct: build.query({
      query: (arg) => ({
        url: "/products",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.product],
    }),
    //? get singel product
    getSingleProduct: build.query({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.product],
    }),

    //? Update a business type by ID
    updateProduct: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.product],
    }),

    //? Delete a business type by ID
    deleteProduct: build.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useUploadProductImageMutation,
  useGetProductQuery,
  useGetSingleProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
