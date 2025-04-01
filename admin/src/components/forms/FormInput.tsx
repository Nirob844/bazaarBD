import { Box, TextField } from "@mui/material";
import { Controller, FieldValues, useFormContext } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
  name: keyof T;
  type?: string;
  size?: "small" | "medium";
  label?: string;
  value?: string;
  defaultValue?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
}

const FormInput = ({
  name,
  type = "text",
  size = "medium",
  label,
  value,
  defaultValue,
  id,
  placeholder,
  required,
}: FormInputProps<FieldValues>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Box sx={{ mb: 2, width: "100%" }}>
      <Controller
        control={control}
        name={name as string}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            id={id}
            type={type}
            label={label}
            placeholder={placeholder}
            variant="outlined"
            size={size}
            required={required}
            error={!!errors[name]}
            helperText={errors[name]?.message as string | undefined}
            defaultValue={defaultValue}
            value={value !== undefined ? value : field.value}
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
      />
    </Box>
  );
};

export default FormInput;
