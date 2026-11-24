import { flexRender, type Table } from '@tanstack/react-table';
import { EstadoVacio } from './EstadoVacio';
import { Paginacion } from './Paginacion';

interface DataTableProps<T> {
    table: Table<T>;
    totalItems: number;
    mensajeVacio?: string;
    accionVacio?: { etiqueta: string; onClick: () => void };
}

/** Tabla de TanStack Table con orden por columna y paginación del lado del cliente. */
export function DataTable<T>({
    table,
    totalItems,
    mensajeVacio = 'No hay registros.',
    accionVacio,
}: DataTableProps<T>) {
    if (totalItems === 0) {
        return <EstadoVacio titulo={mensajeVacio} accion={accionVacio} />;
    }

    const { pageIndex } = table.getState().pagination;

    return (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const ordenable = header.column.getCanSort();
                                    const orden = header.column.getIsSorted();
                                    return (
                                        <th
                                            key={header.id}
                                            onClick={ordenable ? header.column.getToggleSortingHandler() : undefined}
                                            className={`select-none px-4 py-3 font-semibold ${
                                                ordenable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-1">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                                {orden === 'asc' && <span>▲</span>}
                                                {orden === 'desc' && <span>▼</span>}
                                                {ordenable && !orden && <span className="text-xs text-gray-400">↕</span>}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3 align-middle text-gray-800 dark:text-gray-100">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
                <Paginacion
                    pagina={pageIndex}
                    totalPaginas={table.getPageCount()}
                    totalItems={totalItems}
                    onCambiar={(p) => table.setPageIndex(p)}
                />
            </div>
        </div>
    );
}
