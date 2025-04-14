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
  DropdownMenuRadioItem,
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
import { InviteCode } from "@prisma/client";
import { getInviteCodes } from "@/app/actions/getInviteCodes";
import { Skeleton } from "@/components/ui/skeleton";

import { useDeferredValue } from "react";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
} from "@radix-ui/react-dropdown-menu";

export const columns: ColumnDef<InviteCode>[] = [
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
    accessorKey: "used", // 🔥 use actual model field
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => {
      const isUsed = row.getValue("used") as boolean;
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

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export function DataTable() {
  const [data, setData] = React.useState<InviteCode[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [emailFilter, setEmailFilter] = React.useState("");
  const [codeFilter, setCodeFilter] = React.useState("");

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

  const debouncedEmailFilter = useDebounce(emailFilter, 600);
  const debouncedCodeFilter = useDebounce(codeFilter, 600);

  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [statusFilter, emailFilter, codeFilter]);

  const fetchPage = React.useCallback(async () => {
    setLoading(true);
    try {
      const status =
        statusFilter === "all"
          ? undefined
          : statusFilter === "used"
          ? true
          : false;

      const res = await getInviteCodes(
        pagination.pageIndex,
        pagination.pageSize,
        status,
        debouncedEmailFilter,
        debouncedCodeFilter
      );
      setData(res.data);
      setTotalCount(res.total);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    statusFilter,
    debouncedEmailFilter,
    debouncedCodeFilter,
  ]);

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
      <div className="flex flex-col md:flex-row items-center py-4 gap-2">
        <div className="relative w-full md:max-w-sm">
          <Input
            placeholder="Filter emails..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="pr-8"
          />
          {emailFilter && (
            <button
              type="button"
              onClick={() => setEmailFilter("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          )}
        </div>

        <div className="relative w-full md:max-w-sm">
          <Input
            placeholder="Filter code..."
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
            className="pr-8"
          />
          {codeFilter && (
            <button
              type="button"
              onClick={() => setCodeFilter("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          )}
        </div>

        <div className="w-full">
          <div className="flex justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="px-3 py-2 text-sm">
                  {statusFilter === "all"
                    ? "Status"
                    : statusFilter === "used"
                    ? "Used"
                    : "Unused"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(val) =>
                    setStatusFilter(val as "all" | "used" | "unused")
                  }
                >
                  <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="used">
                    Used
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unused">
                    Unused
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
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
