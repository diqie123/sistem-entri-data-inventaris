import React, { useState, useMemo, useEffect } from 'react';
import { Product, SortConfig, ProductStatus, Notification, AuditLog, AuditLogAction } from './types';
import { mockProducts } from './data/mockData';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductTable from './components/ProductTable';
import ProductFormModal from './components/ProductFormModal';
import ConfirmationDialog from './components/ConfirmationDialog';
import ImportModal from './components/ImportModal';
import ExportModal from './components/ExportModal';
import SettingsPage from './components/SettingsPage';
import NotificationToast from './components/NotificationToast';
import HistoryPage from './components/HistoryPage';
import ProductHistoryModal from './components/ProductHistoryModal';
import { Cog6ToothIcon, ExclamationTriangleIcon, XMarkIcon, ClockIcon } from './components/Icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [view, setView] = useState<'dashboard' | 'table' | 'settings' | 'history'>('dashboard');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  
  const [productForHistory, setProductForHistory] = useState<Product | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLowStockAlertVisible, setIsLowStockAlertVisible] = useState(true);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const initialCategories = useMemo(() => {
    const uniqueCategories = new Set(mockProducts.map(p => p.category));
    return Array.from(uniqueCategories).sort();
  }, []);
  const [managedCategories, setManagedCategories] = useState<string[]>(initialCategories);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (localStorage.getItem('theme') === 'dark') return true;
    if (localStorage.getItem('theme') === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Clear selection when filters change to avoid confusion
  useEffect(() => {
    setSelectedProductIds([]);
  }, [searchTerm, statusFilter, categoryFilter]);

  const addNotification = (message: string, type: Notification['type']) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addAuditLog = (action: AuditLogAction, product: Product, oldProduct?: Product) => {
    let details = '';
    if (action === AuditLogAction.CREATE) {
        details = `Product "${product.name}" was created.`;
    } else if (action === AuditLogAction.DELETE) {
        details = `Product "${product.name}" (SKU: ${product.sku}) was deleted.`;
    } else if (action === AuditLogAction.UPDATE && oldProduct) {
        const changes: string[] = [];
        (Object.keys(product) as Array<keyof Product>).forEach(key => {
            if (key !== 'id' && key !== 'lastUpdated' && product[key] !== oldProduct[key]) {
                changes.push(`${key} changed from "${oldProduct[key]}" to "${product[key]}"`);
            }
        });
        details = changes.length > 0 ? changes.join('. ') : 'Product saved with no changes.';
    }

    const newLog: AuditLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        action,
        productId: product.id,
        productName: product.name,
        details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };
  
  const addBulkDeleteAuditLog = (deletedProducts: Product[]) => {
    const productNames = deletedProducts.map(p => `${p.name} (SKU: ${p.sku})`).join(', ');
    const newLog: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: AuditLogAction.DELETE,
        productId: 'multiple',
        productName: `${deletedProducts.length} products`,
        details: `Bulk deleted products: ${productNames}.`,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };


  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleAddProduct = (initialData: Partial<Product> | null = null) => {
    if (initialData) {
        setProductToEdit({
            ...initialData,
            id: '', 
        } as Product);
    } else {
        setProductToEdit(null);
    }
    setIsModalOpen(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicatedProductData = {
        ...product,
        id: '', 
        name: `${product.name} (Copy)`,
        sku: '',
        lastUpdated: new Date().toISOString(),
        dateAdded: new Date().toISOString(),
    };
    handleAddProduct(duplicatedProductData);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (product: Product) => {
    setProductToDelete(product);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      addAuditLog(AuditLogAction.DELETE, productToDelete);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      addNotification(`Product "${productToDelete.name}" has been deleted.`, 'success');
      setProductToDelete(null);
    }
  };

  const handleDeleteSelectedRequest = () => {
    if (selectedProductIds.length > 0) {
        setIsBulkDeleteConfirmOpen(true);
    }
  };

  const handleDeleteSelectedConfirm = () => {
    const count = selectedProductIds.length;
    const deletedProducts = products.filter(p => selectedProductIds.includes(p.id));
    addBulkDeleteAuditLog(deletedProducts);
    setProducts(products.filter(p => !selectedProductIds.includes(p.id)));
    setSelectedProductIds([]);
    setIsBulkDeleteConfirmOpen(false);
    addNotification(`${count} products have been deleted.`, 'success');
  };
  
  const downloadAsCSV = (productsToExport: Product[]) => {
      const headers = ['id', 'name', 'sku', 'category', 'description', 'price', 'stock', 'status', 'imageUrl', 'lastUpdated', 'dateAdded', 'isFeatured', 'contactEmail', 'productUrl'];
      const replacer = (key: string, value: any) => value === null ? '' : value;
      const csv = productsToExport.map(row => 
        headers.map(fieldName => JSON.stringify((row as any)[fieldName], replacer)).join(',')
      );
      csv.unshift(headers.join(','));
      const csvContent = "data:text/csv;charset=utf-8," + csv.join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "products_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addNotification('CSV export started.', 'info');
  };

  const downloadAsJSON = (productsToExport: Product[]) => {
    const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(productsToExport, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", "products_export.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('JSON export started.', 'info');
  };

  const downloadAsPDF = (productsToExport: Product[]) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Product Inventory Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    const tableColumns = ["Name", "SKU", "Category", "Price ($)", "Stock", "Status"];
    const tableRows = productsToExport.map(p => [
        p.name,
        p.sku,
        p.category,
        p.price.toFixed(2),
        p.stock.toString(),
        p.status
    ]);

    autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 35,
        headStyles: { fillColor: [37, 99, 235] }, // primary-600 color
        theme: 'striped',
    });

    doc.save('products_export.pdf');
    addNotification('PDF export started.', 'info');
  };

  const handleConfirmExport = (format: 'csv' | 'json' | 'pdf', scope: 'all' | 'filtered' | 'selected') => {
    let productsToExport: Product[] = [];
    if (scope === 'all') {
        productsToExport = products;
    } else if (scope === 'filtered') {
        productsToExport = sortedProducts; // Use sortedProducts to match what user sees
    } else if (scope === 'selected') {
        productsToExport = products.filter(p => selectedProductIds.includes(p.id));
    }

    if (productsToExport.length === 0) {
        addNotification('There is no data to export for the selected scope.', 'warning');
        return;
    }

    if (format === 'csv') {
        downloadAsCSV(productsToExport);
    } else if (format === 'json') {
        downloadAsJSON(productsToExport);
    } else if (format === 'pdf') {
        downloadAsPDF(productsToExport);
    }
    
    setIsExportModalOpen(false);
  };


  const handleShowHistory = (product: Product) => {
    setProductForHistory(product);
    setIsHistoryModalOpen(true);
  };

  const saveProduct = (product: Product, action: 'save' | 'saveAndNew' = 'save') => {
    if (productToEdit && productToEdit.id) {
      const originalProduct = products.find(p => p.id === product.id);
      if (originalProduct) {
        addAuditLog(AuditLogAction.UPDATE, product, originalProduct);
      }
      setProducts(products.map(p => p.id === product.id ? product : p));
      addNotification('Product updated successfully!', 'success');
    } else {
      const newProductWithId = { ...product, id: Date.now().toString() };
      setProducts([newProductWithId, ...products]);
      addAuditLog(AuditLogAction.CREATE, newProductWithId);
      addNotification('Product added successfully!', 'success');
    }
    
    if (action === 'saveAndNew') {
        setProductToEdit(null);
    } else {
        setIsModalOpen(false);
        setProductToEdit(null);
    }
  };

  const handleImportProducts = (csvData: string) => {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      const result = { successCount: 0, errors: [{ row: 1, message: "CSV file is empty or has only a header." }] };
      addNotification("Import failed: CSV file is empty.", "error");
      return result;
    }
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);
    
    const newProducts: Product[] = [];
    const importErrors: { row: number, message: string }[] = [];
    const newCategories = new Set<string>();

    rows.forEach((line, index) => {
      const values = line.split(',');
      const rowData: { [key: string]: string } = {};
      header.forEach((key, i) => {
        rowData[key] = values[i] ? values[i].trim().replace(/"/g, '') : '';
      });

      if (!rowData.name || !rowData.sku || !rowData.price || !rowData.stock) {
        importErrors.push({ row: index + 2, message: 'Baris tidak memiliki kolom wajib diisi: name, sku, price, stock' });
        return;
      }

      const price = parseFloat(rowData.price);
      const stock = parseInt(rowData.stock, 10);

      if (isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
        importErrors.push({ row: index + 2, message: 'Nilai harga atau stok tidak valid.' });
        return;
      }
      
      const status = Object.values(ProductStatus).includes(rowData.status as ProductStatus) ? rowData.status as ProductStatus : ProductStatus.Active;
      const category = rowData.category || 'Uncategorized';
      
      if(category) newCategories.add(category);

      const newProduct: Product = {
        id: `prod_${Date.now()}_${index}`,
        name: rowData.name,
        sku: rowData.sku,
        category: category,
        description: rowData.description || '',
        price,
        stock,
        status,
        imageUrl: rowData.imageUrl || `https://picsum.photos/seed/${Date.now()}_${index}/400/400`,
        lastUpdated: new Date().toISOString(),
        dateAdded: rowData.dateAdded || new Date().toISOString(),
        isFeatured: rowData.isFeatured?.toLowerCase() === 'true' || false,
        contactEmail: rowData.contactEmail || '',
        productUrl: rowData.productUrl || '',
      };

      newProducts.push(newProduct);
      addAuditLog(AuditLogAction.CREATE, newProduct);
    });

    if (newProducts.length > 0) {
      setProducts(prev => [...newProducts, ...prev]);
    }
    if (newCategories.size > 0) {
        setManagedCategories(prev => [...new Set([...prev, ...Array.from(newCategories)])].sort());
    }
    
    const result = { successCount: newProducts.length, errors: importErrors };
    if(result.errors.length > 0 && result.successCount > 0) {
        addNotification(`Import complete: ${result.successCount} products added, ${result.errors.length} errors.`, 'warning');
    } else if (result.errors.length > 0) {
        addNotification(`Import failed with ${result.errors.length} errors.`, 'error');
    } else {
        addNotification(`${result.successCount} products imported successfully.`, 'success');
    }
    return result;
  };
  
  const handleAddCategory = (newCategory: string): boolean => {
    if (managedCategories.some(c => c.toLowerCase() === newCategory.toLowerCase())) {
        addNotification(`Category "${newCategory}" already exists.`, 'warning');
        return false;
    }
    setManagedCategories([...managedCategories, newCategory].sort());
    addNotification(`Category "${newCategory}" added.`, 'success');
    return true;
  };

  const handleUpdateCategory = (oldCategory: string, newCategory: string): boolean => {
    if (managedCategories.some(c => c.toLowerCase() === newCategory.toLowerCase() && c.toLowerCase() !== oldCategory.toLowerCase())) {
        addNotification(`Category "${newCategory}" already exists.`, 'warning');
        return false;
    }
    setManagedCategories(managedCategories.map(c => c === oldCategory ? newCategory : c).sort());
    setProducts(products.map(p => p.category === oldCategory ? { ...p, category: newCategory } : p));
    addNotification(`Category "${oldCategory}" updated to "${newCategory}".`, 'success');
    if (categoryFilter === oldCategory) {
        setCategoryFilter(newCategory);
    }
    return true;
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const isCategoryInUse = products.some(p => p.category === categoryToDelete);
    if (isCategoryInUse) {
        addNotification(`Cannot delete "${categoryToDelete}" as it's in use.`, 'error');
        alert(`Tidak dapat menghapus kategori "${categoryToDelete}" karena sedang digunakan oleh satu atau lebih produk.`);
        return;
    }
    setManagedCategories(managedCategories.filter(c => c !== categoryToDelete));
    addNotification(`Category "${categoryToDelete}" deleted.`, 'success');
    if (categoryFilter === categoryToDelete) {
        setCategoryFilter('all');
    }
  };


  const filteredProducts = useMemo(() => {
    return products
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(product => statusFilter === 'all' || product.status === statusFilter)
      .filter(product => categoryFilter === 'all' || product.category === categoryFilter);
  }, [products, searchTerm, statusFilter, categoryFilter]);

  const sortedProducts = useMemo(() => {
    const sortableItems = [...filteredProducts];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  const lowStockItemsCount = useMemo(() => products.filter(p => p.stock > 0 && p.stock < 10).length, [products]);
  
  const requestSort = (key: keyof Product) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
      <Header onAddProduct={() => handleAddProduct()} onImport={() => setIsImportModalOpen(true)} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {lowStockItemsCount > 0 && isLowStockAlertVisible && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
              <div className="flex">
                  <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-200">
                          Anda memiliki <span className="font-bold">{lowStockItemsCount}</span> item dengan stok menipis.
                          {/* FIX: Use ProductStatus enum member instead of string literal for type safety. */}
                          <a href="#" onClick={(e) => { e.preventDefault(); setView('table'); setStatusFilter(ProductStatus.LowStock); }} className="font-medium underline ml-2 hover:text-yellow-600 dark:hover:text-yellow-100">
                              Lihat sekarang
                          </a>
                      </p>
                  </div>
                  <div className="ml-auto pl-3">
                      <div className="-mx-1.5 -my-1.5">
                          <button onClick={() => setIsLowStockAlertVisible(false)} type="button" className="inline-flex bg-yellow-50 dark:bg-transparent rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600">
                              <span className="sr-only">Dismiss</span>
                              <XMarkIcon className="h-5 w-5" />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
        )}

        <div className="flex items-center justify-center mb-6 space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm w-fit mx-auto">
            <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                Dashboard
            </button>
            <button onClick={() => setView('table')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'table' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                Data Inventaris
            </button>
            <button onClick={() => setView('history')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${view === 'history' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                 <ClockIcon className="h-5 w-5 mr-2" />
                 Riwayat
            </button>
            <button onClick={() => setView('settings')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${view === 'settings' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                 <Cog6ToothIcon className="h-5 w-5 mr-2" />
                 Pengaturan
            </button>
        </div>

        {view === 'dashboard' && <Dashboard products={products} />}
        {view === 'table' && (
          <ProductTable
            products={sortedProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteRequest}
            onShowHistory={handleShowHistory}
            onDuplicate={handleDuplicateProduct}
            sortConfig={sortConfig}
            requestSort={requestSort}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={managedCategories}
            selectedProductIds={selectedProductIds}
            setSelectedProductIds={setSelectedProductIds}
            onDeleteSelected={handleDeleteSelectedRequest}
            onRequestExport={() => setIsExportModalOpen(true)}
          />
        )}
        {view === 'history' && <HistoryPage logs={auditLogs} />}
        {view === 'settings' && (
            <SettingsPage 
                categories={managedCategories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
            />
        )}
      </main>

      {isModalOpen && (
        <ProductFormModal
          productToEdit={productToEdit}
          onClose={() => setIsModalOpen(false)}
          onSave={saveProduct}
          categories={managedCategories}
        />
      )}
      
      {isHistoryModalOpen && productForHistory && (
        <ProductHistoryModal
          product={productForHistory}
          logs={auditLogs.filter(log => log.productId === productForHistory.id)}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {isImportModalOpen && (
          <ImportModal
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImportProducts}
          />
      )}

      {isExportModalOpen && (
        <ExportModal
          onClose={() => setIsExportModalOpen(false)}
          onConfirm={handleConfirmExport}
          hasSelection={selectedProductIds.length > 0}
          filteredCount={sortedProducts.length}
          totalCount={products.length}
        />
      )}
      
      {productToDelete && (
        <ConfirmationDialog
            title="Hapus Produk"
            message={`Anda yakin ingin menghapus produk "${productToDelete.name}"? Tindakan ini tidak dapat diurungkan.`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setProductToDelete(null)}
        />
      )}

      {isBulkDeleteConfirmOpen && (
          <ConfirmationDialog
            title={`Hapus ${selectedProductIds.length} Produk`}
            message={`Anda yakin ingin menghapus ${selectedProductIds.length} produk yang dipilih? Tindakan ini tidak dapat diurungkan.`}
            onConfirm={handleDeleteSelectedConfirm}
            onCancel={() => setIsBulkDeleteConfirmOpen(false)}
          />
      )}

      {/* Notification Container */}
      <div
          aria-live="assertive"
          className="fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6 sm:items-end z-50"
      >
          <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
              {notifications.map((notification) => (
                  <NotificationToast
                      key={notification.id}
                      notification={notification}
                      onDismiss={removeNotification}
                  />
              ))}
          </div>
      </div>
    </div>
  );
};

export default App;