"use client";

import * as React from "react";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming shadcn/ui table components
import { Button } from "@/components/ui/button"; // Need Button for pagination
import { Input } from "@/components/ui/input"; // Need Input for filtering
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"; // Icons for filter and sort
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel, // Import for sorting
  getFilteredRowModel, // Import for filtering
  getPaginationRowModel, // Import for pagination
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils"; // Assuming you have a utility like this for class names

// Declare the component type using the generic interface
export function CustomTable({
  columns,
  data,
  filterBy, // Receive the column key to filter on
  className = "",
}) {
  // State for TanStack Table features
  const [sorting, setSorting] = useState();
  const [columnFilters, setColumnFilters] = useState();
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Initial page index
    pageSize: 10, // Default page size
  });

  // Initialize TanStack Table with features
  const table = useReactTable({
    data,
    columns,
    // State Management
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    // Pipelines
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // State Updaters
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    // Debugging (optional)
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: true,
  });

  const filterColumn = filterBy ? table.getColumn(filterBy) : null;

  return (
    // Outer container styling remains
    <div
      className={cn(
        "rounded-lg border-2 p-4 overflow-hidden  border-purple-600 flex flex-col gap-4", // Added flex layout and gap
        className
      )}
    >
      {/* Filter Input Section */}
      {filterBy && filterColumn && (
        <div className="inline-flex items-center self-start w-full max-w-sm py-1 px-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          <Search color="#707070" size={18} />
          <Input
            placeholder={`Search by ${filterBy}...`}
            value={filterColumn?.getFilterValue() ?? ""}
            onChange={(event) =>
              filterColumn?.setFilterValue(event.target.value)
            }
            className="max-w-sm border-0 focus:outline-none focus:ring-0 focus:border-none h-8 bg-transparent text-black dark:text-white placeholder-gray-400"
            style={{ boxShadow: "none" }} // Remove default browser outline/shadow on focus
          />
        </div>
      )}

      {/* Table Section */}
      <div className="">
        {" "}
        {/* Make table scrollable horizontally if needed */}
        <Table className="bg-transparent overflow-hidden table-fixed min-w-full">
          {" "}
          {/* Ensure table takes minimum full width */}
          {/* Table Header with gradient and sorting */}
          <TableHeader
            className={
              "bg-gradient-to-r from-purple-700 to-purple-500 overflow-hidden"
            }
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header, index) => {
                  const isFirstHeader = index === 0;
                  const isLastHeader = index === headerGroup.headers.length - 1;
                  const canSort = header.column.getCanSort();

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-white font-medium px-4 py-3 text-left", // Adjusted padding
                        isFirstHeader && "rounded-tl-lg rounded-bl-lg",
                        isLastHeader && "rounded-tr-lg rounded-br-lg",
                        canSort && "cursor-pointer select-none" // Add cursor if sortable
                      )}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {" "}
                        {/* Flex for header text + sort icon */}
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {/* Sorting Indicator */}
                        {
                          canSort &&
                            (header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )) // Default icon
                        }
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {/* Table Body */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-purple-600/30 hover:bg-purple-900/20" // Original border + hover effect
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-white px-4 py-3 overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{
                        width:
                          cell.column.getSize() !== 150
                            ? cell.column.getSize()
                            : undefined,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-white border-purple-600/30"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      <div className="flex items-center justify-between space-x-2 pt-16">
        <span className="text-sm text-gray-400 dark:text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="border-purple-500 text-purple-500 "
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="border-purple-500 text-purple-500 "
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
