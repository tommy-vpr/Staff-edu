"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import moment from "moment";
import { ConfirmDialog } from "./ConfirmDialog";
// Prisma import
import { GeneratedCodes } from "@prisma/client";

export const columns: ColumnDef<GeneratedCodes>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <div className="capitalize">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => {
      const isUsed = row.getValue("status");
      return (
        <div className="text-left font-medium">
          {!isUsed ? (
            <span className="w-[70px] text-center bg-green-100 text-green-800 text-xs font-medium py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400 inline-block">
              Unused
            </span>
          ) : (
            <span className="w-[70px] text-center bg-red-100 text-red-800 text-xs font-medium py-0.5 rounded dark:bg-gray-700 dark:text-red-400 border border-red-400 inline-block">
              Used
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Used on",
    cell: ({ row }) => {
      // Access `createdAt` directly from `row.original`
      const updatedAt = row.getValue("updatedAt") as Date | string | undefined;
      const createdAt = row.original.createdAt; // `createdAt` is available in `row.original`

      // Only display updatedAt if it differs from createdAt
      const displayDate =
        updatedAt && createdAt && !moment(updatedAt).isSame(moment(createdAt))
          ? moment(updatedAt).format("MM/DD/YYYY")
          : "N/A";

      return <div className="capitalize">{displayDate}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;
      const [isDialogOpen, setIsDialogOpen] = React.useState(false);

      const handleDelete = () => {
        console.log(`Deleted item with ID: ${payment.id}`);
        setIsDialogOpen(false);
      };

      return (
        <>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setIsDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" aria-label="Delete" />
          </Button>

          <ConfirmDialog
            isOpen={isDialogOpen}
            title="Confirm Deletion"
            description="Are you sure you want to delete this item? This action cannot be undone."
            onConfirm={handleDelete}
            onCancel={() => setIsDialogOpen(false)}
            confirmLabel="Delete"
            cancelLabel="Cancel"
          />
        </>
      );
    },
  },
];

type DataTableProps = {
  data: GeneratedCodes[];
};

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination, // Add this to handle pagination updates
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
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

export default DataTable;
