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
import FormInput from "../../components/forms/FormInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ModalComponent from "../../components/ui/ModalComponent";
import PaginationComponent from "../../components/ui/PaginationComponent";
import TableComponent from "../../components/ui/TableComponent";

import FormSelectField from "../../components/forms/FormSelectField";
import { useGetProductQuery } from "../../redux/api/productApi";
import {
  useCreatePromotionMutation,
  useDeletePromotionMutation,
  useGetPromotionQuery,
  useUpdatePromotionMutation,
} from "../../redux/api/promotion";
import type { Product, Promotion } from "../../types/product";

interface FormValues {
  type: string;
  discountPercentage: string;
  productId: string;
}

interface Column {
  id: string;
  label: string;
  format?: (value: any, row?: Promotion) => React.ReactNode;
}

const Promotion = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const query = {
    limit: size,
    page,
    ...(searchTerm && { searchTerm }),
  };

  const [createPromotion, { isLoading: createLoading }] =
    useCreatePromotionMutation();
  const [updatePromotion, { isLoading: updateLoading }] =
    useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: deleteLoading }] =
    useDeletePromotionMutation();

  const { data: promotions, isLoading: promotionsLoading } =
    useGetPromotionQuery(query);

  const { data: products, isLoading: productsLoading } = useGetProductQuery({});

  const promotionOptions = [
    { value: "FEATURED", label: "Featured" },
    { value: "FLASH_SALE", label: "Flash Sale" },
    { value: "NEW_ARRIVAL", label: "New Arrival" },
    { value: "BEST_DEAL", label: "Best Deal" },
    { value: "TOP_SELLING", label: "Top Selling" },
  ];

  const productOptions =
    products?.data?.map((product: Product) => ({
      value: product.id,
      label: product.name,
    })) || [];

  const columns: Column[] = [
    {
      id: "product.imageUrls",
      label: "Photo",
      format: (_: any, row?: any) => (
        <Avatar
          src={row?.product?.imageUrls?.[0]?.url || ""}
          alt="Promotion"
          sx={{ width: 50, height: 50 }}
        />
      ),
    },
    {
      id: "product.name",
      label: "Product Name",
      format: (_: any, row?: any) => row?.product?.name || " - ",
    },
    {
      id: "product.price",
      label: "Price",
      format: (_: any, row?: any) => row?.product?.price || 0,
    },
    {
      id: "discountPercentage",
      label: "Discount (%)",
      format: (value: string) => `${value}%`,
    },
    {
      id: "type",
      label: "Discount Type",
    },
    {
      id: "discountedPrice",
      label: "Discounted Price",
      format: (_: any, row?: any) => {
        const price = parseFloat(row?.product?.price ?? "0");
        const discount = row?.discountPercentage;
        if (!discount) return "-";
        const discounted = price * (1 - parseFloat(discount) / 100);
        return `$${discounted.toFixed(2)}`;
      },
    },
    {
      id: "product.inventory.stock",
      label: "Stock",
      format: (_: any, row?: any) => row?.product?.inventory?.stock || 0,
    },
    {
      id: "createdAt",
      label: "Created At",
      format: (value: string) => new Date(value).toLocaleString(),
    },
    {
      id: "actions",
      label: "Actions",
      format: (_: any, row?: any) => (
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
    setSelectedPromotion(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPromotion(null);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const promotionData = {
        type: data.type,
        discountPercentage: data.discountPercentage,
        productId: data.productId,
      };

      if (selectedPromotion) {
        const res = await updatePromotion({
          id: selectedPromotion.id,
          data: promotionData,
        });
        if ("data" in res) {
          toast.success("Promotion updated successfully");
        } else {
          toast.error("Failed to update promotion");
        }
      } else {
        const res = await createPromotion(promotionData);
        if ("data" in res) {
          toast.success("Promotion created successfully");
        } else {
          toast.error("Failed to create promotion");
        }
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      console.error(error);
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPromotionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!promotionToDelete) return;

    try {
      await deletePromotion(promotionToDelete);
      toast.success("Promotion deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsDeleteModalOpen(false);
      setPromotionToDelete(null);
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
    type: selectedPromotion?.type || "",
    discountPercentage: selectedPromotion?.discountPercentage || "",
    productId: selectedPromotion?.productId || "",
  };

  if (promotionsLoading || productsLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Promotions Management
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

      <TableComponent columns={columns} data={promotions?.data || []} />

      <PaginationComponent
        page={page}
        rowsPerPage={size}
        totalItems={promotions?.meta?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <ModalComponent
        open={isModalOpen}
        size="large"
        onClose={handleCloseModal}
        title={selectedPromotion ? "Edit Promotion" : "Create New Promotion"}
      >
        <Form submitHandler={onSubmit} defaultValues={defaultValues}>
          <Stack spacing={2}>
            <FormSelectField
              label="Product"
              name="productId"
              options={productOptions}
              required
            />

            <FormSelectField
              label="Promotion Type"
              name="type"
              options={promotionOptions}
              required
            />
            <FormInput
              label="Discount Percentage"
              name="discountPercentage"
              required
            />
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
                : selectedPromotion
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
        <Typography>Are you sure you want to delete this promotion?</Typography>
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

export default Promotion;
