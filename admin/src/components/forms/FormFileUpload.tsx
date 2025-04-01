import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

interface FormFileUploadProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

const FormFileUpload = <T extends FieldValues>({
  name,
  label = "Upload File",
  acceptedFileTypes,
  maxFileSize = 5_000_000, // 5MB default
}: FormFileUploadProps<T>) => {
  const { control, setError, clearErrors } = useFormContext<T>();
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File | null) => void
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
        setError(name, {
          type: "manual",
          message: `Invalid file type. Accepted types: ${acceptedFileTypes.join(
            ", "
          )}`,
        });
        return;
      }

      if (file.size > maxFileSize) {
        setError(name, {
          type: "manual",
          message: `File size should not exceed ${maxFileSize / 1_000_000}MB`,
        });
        return;
      }

      clearErrors(name);
      setFileName(file.name);
      onChange(file);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={undefined}
      render={({ field: { onChange }, fieldState: { error } }) => (
        <Box sx={{ mb: 2 }}>
          <input
            accept={acceptedFileTypes?.join(",")}
            style={{ display: "none" }}
            id={`file-upload-${String(name)}`}
            type="file"
            onChange={(e) => handleFileChange(e, onChange)}
          />
          <label htmlFor={`file-upload-${String(name)}`}>
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              {label}
            </Button>
          </label>
          {fileName && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {fileName}
            </Typography>
          )}
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error.message}
            </Typography>
          )}
        </Box>
      )}
    />
  );
};

export default FormFileUpload;
