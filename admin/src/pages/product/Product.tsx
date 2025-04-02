/* eslint-disable @typescript-eslint/no-explicit-any */
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import Form from "../../components/forms/Form";
import FormFileUpload from "../../components/forms/FormFileUpload";
import FormInput from "../../components/forms/FormInput";
import FormSelectField from "../../components/forms/FormSelectField";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ModalComponent from "../../components/ui/ModalComponent";
import PaginationComponent from "../../components/ui/PaginationComponent";
import TableComponent from "../../components/ui/TableComponent";
import { useGetCategoryQuery } from "../../redux/api/categoryApi";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "../../redux/api/productApi";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser } from "../../redux/slice/authSlice";

interface Category {
  id: string;
  name: string;
}

interface Promotion {
  discountPercentage?: string;
}

interface Inventory {
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  sku: string;
  status: string;
  inventory: Inventory;
  categoryId: string;
  userId: string;
  imageUrls: { url: string }[];
  promotions: Promotion[];
  createdAt: string;
  category?: {
    name: string;
  };
}

interface FormValues {
  name: string;
  description: string;
  price: string;
  sku: string;
  status: string;
  inventory: {
    stock: number;
  };
  categoryId: string;
  userId: string;
  file?: File;
}

interface Column {
  id: string;
  label: string;
  format?: (value: any, row?: Product) => React.ReactNode;
}

const Product = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const currentUser = useAppSelector(selectCurrentUser);
  const userId = currentUser?.userId || "";

  const query = {
    limit: size,
    page,
    ...(searchTerm && { searchTerm }),
  };

  const [createProduct, { isLoading: createLoading }] =
    useCreateProductMutation();
  const [updateProduct, { isLoading: updateLoading }] =
    useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleteLoading }] =
    useDeleteProductMutation();

  const { data: products, isLoading: productsLoading } =
    useGetProductQuery(query);
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoryQuery({});

  const categoryOptions =
    categories?.data?.map((category: Category) => ({
      value: category.id,
      label: category.name,
    })) || [];

  const columns: Column[] = [
    {
      id: "imageUrls",
      label: "Photo",
      format: (value: { url: string }[]) => (
        <Avatar
          src={value[0]?.url}
          alt="Product"
          sx={{ width: 50, height: 50 }}
        />
      ),
    },
    { id: "name", label: "Product Name" },
    { id: "sku", label: "SKU" },
    {
      id: "category",
      label: "Category",
      format: (_: any, row?: Product) => row?.category?.name || "N/A",
    },
    {
      id: "price",
      label: "Price",
      format: (value: string) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      id: "promotions",
      label: "Discount",
      format: (value: Promotion[]) =>
        value?.length > 0 ? `${value[0]?.discountPercentage}%` : "No Discount",
    },
    {
      id: "inventory.stock",
      label: "Stock",
      format: (_: any, row?: Product) => row?.inventory.stock || 0,
    },
    { id: "status", label: "Status" },
    {
      id: "createdAt",
      label: "Created At",
      format: (value: string) => new Date(value).toLocaleString(),
    },
    {
      id: "actions",
      label: "Actions",
      format: (_: any, row?: Product) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => row && handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => row?.id && handleDelete(row.id)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const productData = {
        name: data.name,
        description: data.description || "",
        price: data.price,
        sku: data.sku,
        status: data.status || "active",
        categoryId: data.categoryId,
        userId,
        inventory: {
          stock: Number(data.inventory.stock) || 0,
        },
      };

      if (selectedProduct) {
        const res = await updateProduct({
          id: selectedProduct.id,
          data: productData,
        });
        if ("data" in res) {
          toast.success("Product updated successfully");
        } else {
          toast.error("Failed to update product");
        }
      } else {
        const formData = new FormData();
        if (data.file) {
          formData.append("file", data.file);
        }
        formData.append("data", JSON.stringify(productData));

        const res = await createProduct(formData);
        if ("data" in res) {
          toast.success("Product created successfully");
        } else {
          toast.error("Failed to create product");
        }
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      console.error(error);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete);
      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setSize(Number(event.target.value));
    setPage(1);
  };

  const defaultValues: Partial<FormValues> = {
    name: selectedProduct?.name || "",
    description: selectedProduct?.description || "",
    price: selectedProduct?.price || "",
    sku: selectedProduct?.sku || "",
    status: selectedProduct?.status || "active",
    inventory: {
      stock: selectedProduct?.inventory?.stock || 0,
    },
    categoryId: selectedProduct?.categoryId || "",
    userId: userId,
  };

  if (productsLoading || categoriesLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: "300px" }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{
            display: { xs: "inline-flex", md: "flex" },
            justifyContent: "center",
            ml: 1,
          }}
        >
          <Typography sx={{ display: { xs: "none", md: "inline" } }}>
            Create New
          </Typography>
        </Button>
      </Box>

      <TableComponent columns={columns} data={products?.data || []} />

      <PaginationComponent
        page={page}
        rowsPerPage={size}
        totalItems={products?.meta?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <ModalComponent
        open={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? "Edit Product" : "Create New Product"}
      >
        <Form submitHandler={onSubmit} defaultValues={defaultValues}>
          <Stack spacing={2}>
            <FormInput label="Product Name" name="name" required />
            <FormInput label="Description" name="description" />
            <FormInput label="Price" name="price" type="number" required />
            <FormInput label="SKU" name="sku" required />
            <FormInput
              label="Stock"
              name="inventory.stock"
              type="number"
              required
            />
            <FormSelectField
              label="Category"
              name="categoryId"
              options={categoryOptions}
              required
            />
            <FormSelectField
              name="status"
              label="status"
              options={[
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "INACTIVE", label: "INACTIVE" },
                { value: "DRAFT", label: "DRAFT" },
              ]}
            />
            {!selectedProduct && (
              <FormFileUpload
                name="file"
                label="Upload Product Image"
                acceptedFileTypes={["image/jpeg", "image/png"]}
                maxFileSize={5000000}
              />
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createLoading || updateLoading}
              startIcon={
                createLoading || updateLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
              sx={{ mt: 2 }}
            >
              {createLoading || updateLoading
                ? "Processing..."
                : selectedProduct
                ? "Update"
                : "Create"}
            </Button>
          </Stack>
        </Form>
      </ModalComponent>

      <ModalComponent
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <Typography>Are you sure you want to delete this product?</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
        </Stack>
      </ModalComponent>
    </Box>
  );
};

export default Product;
