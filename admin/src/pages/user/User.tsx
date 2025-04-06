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
import FormSelectField from "../../components/forms/FormSelectField";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ModalComponent from "../../components/ui/ModalComponent";
import PaginationComponent from "../../components/ui/PaginationComponent";
import TableComponent from "../../components/ui/TableComponent";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} from "../../redux/api/userApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  profile: {
    avatar: string;
    phone: string;
  };
}

interface FormValues {
  name: string;
  email: string;
  password?: string;
  role: string;
}

const User = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const query: Record<string, any> = {};

  query["limit"] = size;
  query["page"] = page;
  if (searchTerm) query["searchTerm"] = searchTerm;

  const [createUser, { isLoading: createLoading }] = useCreateUserMutation();
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();

  const { data: users, isLoading: usersLoading } = useGetUserQuery(query);

  const columns = [
    {
      id: "profile.avatar",
      label: "Photo",
      format: (_: any, row: User) => (
        <Avatar
          src={row.profile.avatar}
          alt="User"
          sx={{ width: 50, height: 50 }}
        />
      ),
    },
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    {
      id: "profile.phone",
      label: "Phone",
      format: (_: any, row?: User) => row?.profile.phone || "-",
    },
    {
      id: "role",
      label: "Role",
      format: (value: string) =>
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: "isVerified",
      label: "Verified",
      format: (value: boolean) => (value ? "Yes" : "No"),
    },
    {
      id: "createdAt",
      label: "Created At",
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      id: "actions",
      label: "Actions",
      format: (_: any, row: User) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const onSubmit = async (data: FormValues) => {
    console.log("data", data);
    try {
      const userData = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      if (selectedUser) {
        const res = await updateUser({
          id: selectedUser.id,
          data: JSON.stringify(userData),
        });
        console.log(res);
        if ("data" in res) {
          toast.success("User updated successfully");
        } else {
          toast.error("Failed to update user");
        }
      } else {
        const res = await createUser(data);
        if ("data" in res) {
          toast.success("User created successfully");
        } else {
          toast.error("Failed to create user");
        }
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      console.error(error);
    }
  };

  const handleEdit = (row: User) => {
    setSelectedUser(row);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete);
      toast.success("User deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
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
    name: selectedUser?.name || "",
    email: selectedUser?.email || "",
    role: selectedUser?.role || "CUSTOMER",
  };

  if (usersLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Categories
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

      <TableComponent columns={columns} data={users?.data || []} />

      <PaginationComponent
        page={page}
        rowsPerPage={size}
        totalItems={users?.meta?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <ModalComponent
        open={isModalOpen}
        onClose={handleCloseModal}
        title={selectedUser ? "Edit User" : "Create New User"}
      >
        <Form submitHandler={onSubmit} defaultValues={defaultValues}>
          <Stack spacing={2}>
            <FormInput label="User Name" name="name" required />
            <FormSelectField
              name="role"
              label="Role"
              options={[
                { value: "ADMIN", label: "Admin" },
                { value: "CUSTOMER", label: "Customer" },
              ]}
            />
            <FormInput label="Email" name="email" required />
            {!selectedUser && (
              <FormInput
                label="Password"
                name="password"
                type="password"
                required
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
            >
              {createLoading || updateLoading
                ? "Processing..."
                : selectedUser
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
        <Typography>Are you sure you want to delete this user?</Typography>
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

export default User;
