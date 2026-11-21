import { flexRender, type Table } from '@tanstack/react-table';
import { EmptyState } from './UiStates';

interface DataTableProps<T> {
    table: Table<T>;
    totalItems: number;
    emptyMessage?: string;
    onAddFirst?: () => void;
}

export function DataTable<T>({
    table,
    totalItems,
    emptyMessage = 'No hay registros. ¡Agrega uno nuevo!',
    onAddFirst,
}: DataTableProps<T>) {
    if (totalItems === 0) {
        return (
            <EmptyState
                message={emptyMessage}
                actionLabel={onAddFirst ? 'Crear primer registro' : undefined}
                onAction={onAddFirst}
            />
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort();
                                    const sorted = header.column.getIsSorted();
                                    return (
                                        <th
                                            key={header.id}
                                            onClick={
                                                canSort
                                                    ? header.column.getToggleSortingHandler()
                                                    : undefined
                                            }
                                            className={`px-4 py-3 font-semibold select-none ${
                                                canSort
                                                    ? 'cursor-pointer hover:bg-gray-100 transition-colors'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-1">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                                {sorted === 'asc' && <span>▲</span>}
                                                {sorted === 'desc' && <span>▼</span>}
                                                {canSort && !sorted && (
                                                    <span className="text-gray-400 text-xs">↕</span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3 text-gray-800">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Controles de Paginación (HU-01) */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                <span>
                    Página{' '}
                    <strong>
                        {table.getState().pagination.pageIndex + 1} de{' '}
                        {Math.max(table.getPageCount(), 1)}
                    </strong>{' '}
                    ({totalItems} registros totales)
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="px-3 py-1.5 rounded-md border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="px-3 py-1.5 rounded-md border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}