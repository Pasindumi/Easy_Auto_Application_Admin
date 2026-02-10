import React from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function DataTable({
    columns,
    data,
    loading,
    onSearch,
    searchPlaceholder = "Search...",
    actions,
    pagination = false,
    emptyState = { title: "No items found", description: "Try changing your search query or add a new item." }
}) {
    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-slide-up">
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-700"
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                </div>
                {actions && (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {actions}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
                                    style={{ width: col.width }}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            // Loading Skeletons
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((_, idx) => (
                                        <td key={idx} className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            // Empty State
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Inbox className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{emptyState.title}</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">{emptyState.description}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            // Data Rows
                            data.map((row, rowIdx) => (
                                <tr key={row.id || rowIdx} className="group hover:bg-blue-50/30 transition-colors duration-200">
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={`px-6 py-4 text-sm font-medium text-gray-700 ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
                                        >
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Optional) */}
            {pagination && (
                <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50/30 gap-4">
                    <p className="text-sm text-gray-500 font-medium">
                        Showing <span className="font-bold text-gray-900">{Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}</span> to <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-bold text-gray-900">{pagination.total}</span> items
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold text-gray-600"
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                        >
                            <ChevronLeft size={16} />
                            Prev
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                // Simple sliding window for page numbers
                                let pageNum = pagination.page;
                                if (pagination.pages <= 5) pageNum = i + 1;
                                else if (pagination.page <= 3) pageNum = i + 1;
                                else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                                else pageNum = pagination.page - 2 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => pagination.onPageChange(pageNum)}
                                        disabled={loading}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${pagination.page === pageNum
                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold text-gray-600"
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages || loading}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
