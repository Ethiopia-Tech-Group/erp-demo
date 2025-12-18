import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => unknown)
  cell?: (value: unknown, row?: T) => React.ReactNode
}


interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            (data || []).map((row, index) => (
              <TableRow key={row?.id || `row-${index}`}>
                {columns.map((column, colIndex) => {
                  try {
                    const value = typeof column.accessor === "function" 
                      ? column.accessor(row) 
                      : row && row[column.accessor] !== undefined 
                        ? row[column.accessor] 
                        : undefined
                    
                    return (
                      <TableCell key={colIndex}>
                        {column.cell ? column.cell(value, row) : (value !== undefined ? String(value) : "")}
                      </TableCell>
                    )
                  } catch (error) {
                    console.warn(`Error rendering cell at row ${index}, column ${colIndex}:`, error)
                    return <TableCell key={colIndex}></TableCell>
                  }
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}