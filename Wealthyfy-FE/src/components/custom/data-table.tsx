"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table"
import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  initialSorting?: SortingState
  initialPageSize?: number
  // Server-side pagination props
  pageCount?: number
  total?: number
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  manualPagination?: boolean
  // Server-side sorting props
  sorting?: SortingState
  onSortingChange?: (updater: SortingState | ((old: SortingState) => SortingState)) => void
  manualSorting?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialSorting = [],
  initialPageSize = 10,
  pageCount,
  total,
  pagination: controlledPagination,
  onPaginationChange,
  manualPagination = false,
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(initialSorting)
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  // Use controlled sorting if provided, otherwise use internal state
  // If controlled sorting is provided, use it; otherwise fall back to internal state
  const sorting = controlledSorting !== undefined ? controlledSorting : internalSorting
  
  // Use controlled pagination if provided, otherwise use internal state
  const pagination = controlledPagination ?? internalPagination

  const handlePaginationChange = (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater
    if (controlledPagination) {
      // Controlled: notify parent
      onPaginationChange?.(newPagination)
    } else {
      // Uncontrolled: update internal state
      setInternalPagination(newPagination)
    }
  }

  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater
    // For controlled sorting, notify parent with the new sorting state
    if (controlledSorting !== undefined && onSortingChange) {
      // Pass the updater function directly to parent
      onSortingChange(updater)
    } else {
      // Uncontrolled: update internal state
      setInternalSorting(newSorting)
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    manualSorting,
    pageCount: pageCount ?? -1,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    state: { sorting, pagination },
  })

  // Helper: Returns the correct sorting icon
  const renderSortIcon = (sort: false | "asc" | "desc") => {
    if (sort === "asc") return <ArrowUp className="h-4 w-4" />
    if (sort === "desc") return <ArrowDown className="h-4 w-4" />
    return <ArrowUpDown className="h-4 w-4 opacity-50" />
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/50 border-b">
                {headerGroup.headers.map((header) => {
                  if (header.isPlaceholder) return <TableHead key={header.id} />

                  const column = header.column
                  const sortable = column.getCanSort()
                  const sortState = column.getIsSorted()

                  return (
                    <TableHead key={header.id}>
                      <div
                        className={
                          sortable
                            ? "flex items-center gap-2 cursor-pointer select-none hover:text-foreground"
                            : "flex items-center gap-2"
                        }
                        onClick={
                          sortable
                            ? () =>
                                column.toggleSorting(sortState === "asc")
                            : undefined
                        }
                      >
                        {flexRender(column.columnDef.header, header.getContext())}
                        {sortable && (
                          <span className="inline-flex items-center">
                            {renderSortIcon(sortState)}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

          {/* Pagination Controls in Footer */}
          <TableFooter className="bg-secondary/30 border-t">
            <TableRow className="hover:bg-secondary/30">
              <TableCell colSpan={columns.length}>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {manualPagination && total !== undefined ? (
                        <>
                          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                          {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            total
                          )}{" "}
                          of {total} results
                        </>
                      ) : (
                        <>
                          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                          {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                          )}{" "}
                          of {table.getFilteredRowModel().rows.length} results
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                          table.setPageSize(Number(e.target.value))
                        }}
                        className="h-9 w-[70px] rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                          <option key={pageSize} value={pageSize}>
                            {pageSize}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
