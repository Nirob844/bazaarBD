/* eslint-disable @typescript-eslint/no-explicit-any */
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import {
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
import FormSelectField from "../../components/forms/FormSelectField";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ModalComponent from "../../components/ui/ModalComponent";
import PaginationComponent from "../../components/ui/PaginationComponent";
import TableComponent from "../../components/ui/TableComponent";
import {
  useDeleteOrderMutation,
  useGetOrderQuery,
  useUpdateOrderMutation,
} from "../../redux/api/orderApi";

interface OrderItem {
  product: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  total: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

interface FormValues {
  status: string;
}

interface Column {
  id: keyof Order | "actions";
  label: string;
  format?: (value: any, row?: Order) => React.ReactNode;
}

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "DELIVERED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const Order = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const query = {
    limit: size,
    page,
    ...(searchTerm && { searchTerm }),
  };

  const [updateOrder, { isLoading: updateLoading }] = useUpdateOrderMutation();
  const [deleteOrder, { isLoading: deleteLoading }] = useDeleteOrderMutation();

  const { data: orders, isLoading: ordersLoading } = useGetOrderQuery(query);

  const columns: Column[] = [
    {
      id: "id",
      label: "Order ID",
      format: (value: string) => value.slice(0, 8) + "...",
    },
    {
      id: "userId",
      label: "Customer ID",
      format: (value: string) => value.slice(0, 8) + "...",
    },
    {
      id: "total",
      label: "Total Amount (৳)",
      format: (value: string) => `৳${parseFloat(value).toFixed(2)}`,
    },
    {
      id: "status",
      label: "Status",
      format: (value: string) => (
        <Typography
          color={
            value === "DELIVERED"
              ? "success.main"
              : value === "CANCELLED"
              ? "error.main"
              : "warning.main"
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
        </Typography>
      ),
    },
    {
      id: "items",
      label: "Products",
      format: (items: OrderItem[]) => (
        <Box>
          {items.map((item, index) => (
            <Typography key={index}>
              {item.product?.name} (x{item.quantity})
            </Typography>
          ))}
        </Box>
      ),
    },
    {
      id: "createdAt",
      label: "Ordered At",
      format: (value: string) =>
        new Date(value).toLocaleString("en-BD", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    {
      id: "actions",
      label: "Actions",
      format: (_: any, row?: Order) => (
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
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const orderData = {
        status: data.status,
      };

      if (selectedOrder) {
        const res = await updateOrder({
          id: selectedOrder.id,
          data: JSON.stringify(orderData),
        });
        if ("data" in res) {
          toast.success("Order updated successfully");
        } else {
          toast.error("Failed to update order");
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error(error);
    }
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setOrderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      await deleteOrder(orderToDelete);
      toast.success("Order deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setSize(Number(event.target.value));
    setPage(1);
  };

  const defaultValues: FormValues = {
    status: selectedOrder?.status || "PENDING",
  };

  if (ordersLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Orders
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
        >
          <Typography sx={{ display: { xs: "none", md: "inline" } }}>
            Create New
          </Typography>
        </Button>
      </Box>

      <TableComponent columns={columns} data={orders?.data || []} />

      <PaginationComponent
        page={page}
        rowsPerPage={size}
        totalItems={orders?.meta?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <ModalComponent
        open={isModalOpen}
        size="large"
        onClose={handleCloseModal}
        title={
          selectedOrder
            ? `Edit Order #${selectedOrder.id.slice(0, 8)}`
            : "Create New Order"
        }
      >
        <Form submitHandler={onSubmit} defaultValues={defaultValues}>
          <Stack spacing={3}>
            {selectedOrder && (
              <Box>
                <Typography variant="h6">Order Details</Typography>
                <Typography>Customer ID: {selectedOrder.userId}</Typography>
                <Typography>
                  Total: ৳{parseFloat(selectedOrder.total).toFixed(2)}
                </Typography>
                <Typography>
                  Date: {new Date(selectedOrder.createdAt).toLocaleString()}
                </Typography>
              </Box>
            )}

            <FormSelectField
              name="status"
              label="Order Status"
              options={statusOptions}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={updateLoading}
              startIcon={
                updateLoading && <CircularProgress size={20} color="inherit" />
              }
              sx={{ mt: 2 }}
            >
              {updateLoading ? "Processing..." : "Update Order"}
            </Button>
          </Stack>
        </Form>
      </ModalComponent>

      <ModalComponent
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete this order?
        </Typography>
        {orderToDelete && (
          <Typography variant="body2" color="text.secondary">
            Order ID: {orderToDelete.slice(0, 8)}
          </Typography>
        )}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleteLoading}
            startIcon={
              deleteLoading && <CircularProgress size={20} color="inherit" />
            }
          >
            {deleteLoading ? "Deleting..." : "Delete"}
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

export default Order;
