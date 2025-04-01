import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Controller, FieldValues, useFormContext } from "react-hook-form";

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectFieldProps<T extends FieldValues> {
  name: keyof T;
  label: string;
  options: Option[];
  size?: "small" | "medium";
  required?: boolean;
  defaultValue?: string | number;
}

const FormSelectField = ({
  name,
  label,
  options,
  size = "medium",
  required = false,
  defaultValue = "",
}: FormSelectFieldProps<FieldValues>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Box sx={{ mb: 2, width: "100%" }}>
      <FormControl fullWidth size={size} error={!!errors[name]}>
        <InputLabel id={`${String(name)}-label`} required={required}>
          {label}
        </InputLabel>
        <Controller
          name={name as string}
          control={control}
          defaultValue={defaultValue}
          render={({ field }) => (
            <Select {...field} labelId={`${String(name)}-label`} label={label}>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        {errors[name] && (
          <FormHelperText>{errors[name]?.message as string}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

export default FormSelectField;
