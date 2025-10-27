import React, { useState, useCallback, useRef } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon } from './Icons';

interface ImportResult {
  successCount: number;
  errors: { row: number; message: string }[];
}

interface ImportModalProps {
  onClose: () => void;
  onImport: (csvData: string) => ImportResult;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      if (files[0].type === 'text/csv' || files[0].name.endsWith('.csv')) {
        setFile(files[0]);
        setImportResult(null);
      } else {
        alert("Please upload a valid .csv file.");
      }
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  }, []);

  const handleDownloadTemplate = () => {
    const headers = ['name', 'sku', 'category', 'description', 'price', 'stock', 'status'];
    const exampleRow = ['"Sample Laptop"', '"SL-001"', '"Electronics"', '"A great sample laptop"', '999.99', '50', '"Active"'];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + exampleRow.join(',') + '\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "product_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSubmit = () => {
    if (!file) return;

    setIsProcessing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const result = onImport(text);
        setImportResult(result);
      }
      setIsProcessing(false);
      setFile(null); // Clear file after processing
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setImportResult({ successCount: 0, errors: [{ row: 0, message: "Gagal membaca file." }] });
    };
    reader.readAsText(file);
  };

  const renderInitialState = () => (
    <>
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
          accept=".csv"
        />
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-primary-600 dark:text-primary-400">Klik untuk mengunggah</span> atau seret dan lepas
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">CSV hingga 10MB</p>
      </div>
      {file && (
        <div className="mt-4 flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-6 w-6 text-gray-500" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
                <XMarkIcon className="h-5 w-5" />
            </button>
        </div>
      )}
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Pastikan file CSV Anda memiliki kolom: <code className="text-xs bg-gray-200 dark:bg-gray-600 p-1 rounded">name</code>, <code className="text-xs bg-gray-200 dark:bg-gray-600 p-1 rounded">sku</code>, <code className="text-xs bg-gray-200 dark:bg-gray-600 p-1 rounded">price</code>, <code className="text-xs bg-gray-200 dark:bg-gray-600 p-1 rounded">stock</code>.
        <button onClick={handleDownloadTemplate} className="ml-2 text-primary-600 hover:underline dark:text-primary-400">Unduh template</button>
      </p>
    </>
  );

  const renderResultState = () => (
    <div className="mt-4">
        <div className="text-center">
            {importResult && importResult.errors.length === 0 ? (
                <>
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                    <h4 className="mt-2 text-lg font-semibold">Impor Berhasil</h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Berhasil mengimpor <span className="font-bold">{importResult.successCount}</span> produk baru.
                    </p>
                </>
            ) : (
                <>
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500" />
                    <h4 className="mt-2 text-lg font-semibold">Impor Selesai dengan Error</h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Berhasil mengimpor <span className="font-bold text-green-600">{importResult?.successCount}</span> produk. Ditemukan <span className="font-bold text-red-600">{importResult?.errors.length}</span> error.
                    </p>
                </>
            )}
        </div>
        {importResult && importResult.errors.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto rounded-md bg-gray-100 dark:bg-gray-900 p-3">
                <h5 className="font-semibold mb-2 text-sm">Detail Error:</h5>
                <ul className="space-y-1 text-xs">
                    {importResult.errors.map((err, index) => (
                        <li key={index}>
                            <span className="font-semibold">Baris {err.row}:</span> {err.message}
                        </li>
                    ))}
                </ul>
            </div>
        )}
        <button onClick={() => setImportResult(null)} className="mt-4 w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:hover:bg-gray-500">
            Impor File Lain
        </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full mx-4">
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Impor Produk dari CSV</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {importResult ? renderResultState() : renderInitialState()}
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          {!importResult && (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file || isProcessing}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Memproses...' : 'Impor Produk'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
              >
                Batal
              </button>
            </>
          )}
          {importResult && (
             <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Tutup
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
