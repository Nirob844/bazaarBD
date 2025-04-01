/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

// Define types for the columns and rows
interface Column {
  id: string;
  label: string;
  format?: (value: any, row: any) => React.ReactNode;
}

interface Row {
  [key: string]: any;
}

interface TableProps {
  columns: Column[];
  data: Row[];
}

const TableComponent: React.FC<TableProps> = ({ columns, data }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                sx={{
                  fontWeight: "bold",
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.format
                    ? column.format(row[column.id], row) // Pass the whole row for formatted columns
                    : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableComponent;
