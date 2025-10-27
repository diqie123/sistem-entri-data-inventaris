import React, { useState, useMemo, useEffect } from 'react';
import { AuditLog, AuditLogAction } from '../types';
import { ArrowPathIcon } from './Icons';

interface HistoryPageProps {
  logs: AuditLog[];
}

const ITEMS_PER_PAGE = 15;

const ActionBadge: React.FC<{ action: AuditLogAction }> = ({ action }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
    const colorClasses = {
        [AuditLogAction.CREATE]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [AuditLogAction.UPDATE]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        [AuditLogAction.DELETE]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return <span className={`${baseClasses} ${colorClasses[action]}`}>{action}</span>;
};

const HistoryPage: React.FC<HistoryPageProps> = ({ logs }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditLogAction | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const resetFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setDateRange({ start: '', end: '' });
  };
  
  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => 
        log.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(log => actionFilter === 'all' || log.action === actionFilter)
      .filter(log => {
        const logDate = new Date(log.timestamp);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && logDate < startDate) return false;
        if (endDate) {
            endDate.setHours(23, 59, 59, 999); // Include the whole end day
            if (logDate > endDate) return false;
        }
        return true;
      });
  }, [logs, searchTerm, actionFilter, dateRange]);
  
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter, dateRange]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Riwayat Aktivitas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                    type="text"
                    placeholder="Cari nama produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full lg:col-span-2 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                />
                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value as AuditLogAction | 'all')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="all">Semua Aksi</option>
                    <option value={AuditLogAction.CREATE}>Create</option>
                    <option value={AuditLogAction.UPDATE}>Update</option>
                    <option value={AuditLogAction.DELETE}>Delete</option>
                </select>
                <div className="flex items-center space-x-2">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                    />
                     <span className="text-gray-500 dark:text-gray-400">-</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <button onClick={resetFilters} className="col-start-4 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
                    <ArrowPathIcon className="h-4 w-4 mr-1"/>
                    Reset Filter
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Waktu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Detail</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><ActionBadge action={log.action} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{log.productName}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">{log.details}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-400">
                Menampilkan <span className="font-medium">{filteredLogs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> - <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}</span> dari <span className="font-medium">{filteredLogs.length}</span> hasil
            </div>
             <div className="flex-1 flex justify-end">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50">
                    Sebelumnya
                </button>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50">
                    Selanjutnya
                </button>
            </div>
        </div>
    </div>
  );
};

export default HistoryPage;
