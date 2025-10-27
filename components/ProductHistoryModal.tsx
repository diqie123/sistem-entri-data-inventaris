import React from 'react';
import { Product, AuditLog, AuditLogAction } from '../types';
import { XMarkIcon } from './Icons';

interface ProductHistoryModalProps {
  product: Product;
  logs: AuditLog[];
  onClose: () => void;
}

const ActionBadge: React.FC<{ action: AuditLogAction }> = ({ action }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full inline-block";
    const colorClasses = {
        [AuditLogAction.CREATE]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [AuditLogAction.UPDATE]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        [AuditLogAction.DELETE]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return <span className={`${baseClasses} ${colorClasses[action]}`}>{action}</span>;
};

const ProductHistoryModal: React.FC<ProductHistoryModalProps> = ({ product, logs, onClose }) => {
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full mx-4 flex flex-col max-h-[90vh]">
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Riwayat untuk: {product.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 flex-grow overflow-y-auto">
            {sortedLogs.length > 0 ? (
                <ul className="space-y-4">
                    {sortedLogs.map(log => (
                        <li key={log.id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-700/50">
                           <div className="flex items-center justify-between mb-1">
                                <ActionBadge action={log.action} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                           </div>
                           <p className="text-sm text-gray-700 dark:text-gray-300">{log.details}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Tidak ada riwayat aktivitas untuk produk ini.</p>
            )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductHistoryModal;
