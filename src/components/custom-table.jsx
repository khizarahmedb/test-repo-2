"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

export function CustomTable({ columns, data, className = "" }) {
  // Initialize TanStack Table with basic features
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    // Outer container: Manages overall height and flex layout.
    // No rounding here, as header and body will manage their own.
    <div
      className={cn(
        "relative flex flex-col h-full", // flex-col to stack header and body, h-full to take max available height
        className
      )}
    >
      {/* Table component for the fixed header */}
      {/* TableHeader now has its own rounding and overflow-hidden */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 rounded-lg overflow-hidden sticky top-0 z-10 shadow-lg">
        <Table className="bg-transparent table-fixed min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-white font-medium px-4 py-3 text-left"
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>

      {/* This div will be the scrollable container for the table body.
          It fills the remaining height and has its own rounding and scrollbar. */}
      <div
        className={cn(
          "flex-1 overflow-y-auto custom-thin-purple-scrollbar min-h-0", // Added min-h-0 here
          "bg-transparent mt-2 rounded-lg shadow-lg" // Add margin-top for separation, rounding, and overflow
        )}
      >
        {/* We need another Table component here for the body content */}
        <Table className="bg-transparent table-fixed min-w-full">
          {/* Table Body */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-purple-600/30 hover:bg-purple-900/20"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-4 text-white overflow-hidden text-ellipsis whitespace-nowrap"
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
                  className="h-24 text-center border-purple-600/30"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
