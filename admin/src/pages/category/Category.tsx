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
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ModalComponent from "../../components/ui/ModalComponent";
import PaginationComponent from "../../components/ui/PaginationComponent";
import TableComponent from "../../components/ui/TableComponent";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryQuery,
  useUpdateCategoryMutation,
} from "../../redux/api/categoryApi";

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt: string;
}

interface FormValues {
  name: string;
  file?: File;
}

const Category = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const query: Record<string, any> = {};

  query["limit"] = size;
  query["page"] = page;
  if (searchTerm) query["searchTerm"] = searchTerm;

  const [createCategory, { isLoading: createLoading }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: updateLoading }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleteLoading }] =
    useDeleteCategoryMutation();

  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoryQuery(query);

  const columns = [
    {
      id: "imageUrl",
      label: "Photo",
      format: (value: string) => (
        <Avatar src={value} alt="Category" sx={{ width: 50, height: 50 }} />
      ),
    },
    { id: "name", label: "Category Name" },
    {
      id: "createdAt",
      label: "Created At",
      format: (value: string) => new Date(value).toLocaleString(),
    },
    {
      id: "actions",
      label: "Actions",
      format: (_: any, row: Category) => (
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
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const categoryData = {
        name: data.name,
      };

      if (selectedCategory) {
        const res = await updateCategory({
          id: selectedCategory.id,
          data: JSON.stringify(categoryData),
        });
        if ("data" in res) {
          toast.success("Category updated successfully");
        } else {
          toast.error("Failed to update category");
        }
      } else {
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.file) formData.append("file", data.file);

        formData.append("data", JSON.stringify(categoryData));

        const res = await createCategory(formData);
        if ("data" in res) {
          toast.success("Category created successfully");
        } else {
          toast.error("Failed to create category");
        }
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      console.error(error);
    }
  };

  const handleEdit = (row: Category) => {
    setSelectedCategory(row);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete);
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
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
    name: selectedCategory?.name || "",
  };

  if (categoriesLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Categories Management
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

      <TableComponent columns={columns} data={categories?.data || []} />

      <PaginationComponent
        page={page}
        rowsPerPage={size}
        totalItems={categories?.meta?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <ModalComponent
        open={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCategory ? "Edit Category" : "Create New Category"}
      >
        <Form submitHandler={onSubmit} defaultValues={defaultValues}>
          <Stack spacing={2}>
            <FormInput label="Category Name" name="name" required />

            {!selectedCategory && (
              <FormFileUpload
                name="file"
                label="Upload Category Image"
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
            >
              {createLoading || updateLoading
                ? "Processing..."
                : selectedCategory
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
        <Typography>Are you sure you want to delete this category?</Typography>
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

export default Category;
