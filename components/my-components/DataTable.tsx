"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Trash2 } from "lucide-react";
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
import { GeneratedCodes } from "@prisma/client";
import { getGeneratedCodes } from "@/app/actions/getGeneratedCodes";
import { Skeleton } from "@/components/ui/skeleton";

export const columns: ColumnDef<GeneratedCodes>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <div className="capitalize">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
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
            <span className="w-[70px] text-center bg-green-100 text-green-800 text-xs font-medium py-0.5 rounded dark:bg-gray-800 dark:text-green-400 border border-green-400 inline-block">
              Unused
            </span>
          ) : (
            <span className="w-[70px] text-center bg-red-100 text-red-800 text-xs font-medium py-0.5 rounded dark:bg-gray-800 dark:text-red-400 border border-red-400 inline-block">
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
      const updatedAt = row.getValue("updatedAt") as Date | string | undefined;
      const createdAt = row.original.createdAt;
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
      const [isDialogOpen, setIsDialogOpen] = React.useState(false);

      const handleDelete = () => {
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

export function DataTable() {
  const [data, setData] = React.useState<GeneratedCodes[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [emailFilter, setEmailFilter] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "used" | "unused"
  >("all");

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

  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [statusFilter, emailFilter]);

  const fetchPage = React.useCallback(async () => {
    setLoading(true);
    try {
      const status =
        statusFilter === "all"
          ? undefined
          : statusFilter === "used"
          ? true
          : false;

      const res = await getGeneratedCodes(
        pagination.pageIndex,
        pagination.pageSize,
        status,
        emailFilter
      );
      setData(res.data);
      setTotalCount(res.total);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, statusFilter, emailFilter]);

  React.useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    manualPagination: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div className="w-full p-2 md:p-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          className="max-w-sm"
        />
        <select
          className="ml-4 px-3 py-2 text-sm border rounded"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "used" | "unused")
          }
        >
          <option value="all">Status</option>
          <option value="used">Used</option>
          <option value="unused">Unused</option>
        </select>

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
            {loading ? (
              Array.from({ length: pagination.pageSize }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col, i) => (
                    <TableCell key={col.id ?? `skeleton-cell-${i}`}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
          Page {pagination.pageIndex + 1} of{" "}
          {Math.ceil(totalCount / pagination.pageSize)}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={pagination.pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={
              (pagination.pageIndex + 1) * pagination.pageSize >= totalCount
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
