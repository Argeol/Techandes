'use client';

import { Loader2 } from 'lucide-react';

export function DataTable({
    data = [],
    idKey = 'id',
    columns = [],
    actions = null,
    loading = false,
    emptyMessage = 'No hay registros disponibles.',
}) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center gap-2 shadow-xs">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-sm font-medium">Cargando datos...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm shadow-xs">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900 text-slate-200 text-xs uppercase tracking-wider">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={col.accessor || idx}
                                    className={`px-6 py-3.5 font-semibold ${col.headerClassName || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {actions && (
                                <th className="px-6 py-3.5 text-right font-semibold">Acciones</th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={row[idKey] ?? rowIndex}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={col.accessor || colIndex}
                                        className={`px-6 py-4 text-slate-700 ${col.cellClassName || ''}`}
                                    >
                                        {/* Si la columna tiene render personalizado (badges, moneda, etc.) lo ejecuta; si no, lee el campo */}
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}

                                {actions && (
                                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                        {actions(row)}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}