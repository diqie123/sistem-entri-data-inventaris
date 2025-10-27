import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, ProductStatus, SortConfig } from '../types';
import { EditIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, ClockIcon, ArrowDownTrayIcon, DocumentDuplicateIcon } from './Icons';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onShowHistory: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  sortConfig: SortConfig;
  requestSort: (key: keyof Product) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: ProductStatus | 'all';
  setStatusFilter: (status: ProductStatus | 'all') => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  onDeleteSelected: () => void;
  onRequestExport: () => void;
}

const ITEMS_PER_PAGE = 10;

const StatusBadge: React.FC<{ status: ProductStatus }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
    const colorClasses = {
        [ProductStatus.Active]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [ProductStatus.LowStock]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        [ProductStatus.Discontinued]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return <span className={`${baseClasses} ${colorClasses[status]}`}>{status}</span>;
};

const SortableHeader: React.FC<{
  label: string;
  sortKey: keyof Product;
  sortConfig: SortConfig;
  requestSort: (key: keyof Product) => void;
}> = ({ label, sortKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === sortKey;
    const icon = isSorted ? (sortConfig.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />) : null;
    return (
        <th onClick={() => requestSort(sortKey)} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center">
                {label}
                <span className="ml-1">{icon}</span>
            </div>
        </th>
    );
};


const ProductTable: React.FC<ProductTableProps> = ({ 
    products, onEdit, onDelete, onShowHistory, onDuplicate, sortConfig, requestSort, searchTerm, setSearchTerm, 
    statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, categories,
    selectedProductIds, setSelectedProductIds, onDeleteSelected, onRequestExport
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [products, currentPage]);

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    const handleSelectOne = (productId: string, checked: boolean) => {
        setSelectedProductIds(prev => {
            if (checked) {
                return [...prev, productId];
            } else {
                return prev.filter(id => id !== productId);
            }
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allVisibleIds = paginatedProducts.map(p => p.id);
            setSelectedProductIds(prev => [...new Set([...prev, ...allVisibleIds])]);
        } else {
            const allVisibleIdsSet = new Set(paginatedProducts.map(p => p.id));
            setSelectedProductIds(prev => prev.filter(id => !allVisibleIdsSet.has(id)));
        }
    };

    useEffect(() => {
        const visibleSelectedCount = paginatedProducts.filter(p => selectedProductIds.includes(p.id)).length;
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.checked = visibleSelectedCount === paginatedProducts.length && paginatedProducts.length > 0;
            selectAllCheckboxRef.current.indeterminate = visibleSelectedCount > 0 && visibleSelectedCount < paginatedProducts.length;
        }
    }, [selectedProductIds, paginatedProducts]);
    
    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, categoryFilter, products.length]);


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                {selectedProductIds.length > 0 ? (
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{selectedProductIds.length} item dipilih</span>
                        <div className="space-x-2">
                             <button onClick={onRequestExport} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-500 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                Ekspor
                            </button>
                            <button onClick={onDeleteSelected} className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none">
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Hapus
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama atau SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full lg:col-span-2 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ProductStatus | 'all')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">Semua Status</option>
                            <option value={ProductStatus.Active}>Aktif</option>
                            <option value={ProductStatus.LowStock}>Stok Menipis</option>
                            <option value={ProductStatus.Discontinued}>Dihentikan</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <div className="md:col-start-3 lg:col-start-auto">
                            <button onClick={onRequestExport} className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                Ekspor Data
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">
                                <input type="checkbox" ref={selectAllCheckboxRef} onChange={e => handleSelectAll(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produk</th>
                            <SortableHeader label="SKU" sortKey="sku" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Kategori" sortKey="category" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Harga" sortKey="price" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Stok" sortKey="stock" sortConfig={sortConfig} requestSort={requestSort} />
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedProducts.map((product) => (
                            <tr key={product.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedProductIds.includes(product.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                                <td className="px-4 py-4">
                                     <input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={e => handleSelectOne(product.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.sku}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={product.stock > 0 && product.stock < 10 ? ProductStatus.LowStock : product.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => onShowHistory(product)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                            <ClockIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => onDuplicate(product)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title="Duplicate Product">
                                            <DocumentDuplicateIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => onEdit(product)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => onDelete(product)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-400">
                    Menampilkan <span className="font-medium">{products.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> - <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, products.length)}</span> dari <span className="font-medium">{products.length}</span> hasil
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

export default ProductTable;