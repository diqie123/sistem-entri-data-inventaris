import React, { useState } from 'react';
import { XMarkIcon } from './Icons';

type ExportFormat = 'csv' | 'json' | 'pdf';
type ExportScope = 'all' | 'filtered' | 'selected';

interface ExportModalProps {
  onClose: () => void;
  onConfirm: (format: ExportFormat, scope: ExportScope) => void;
  hasSelection: boolean;
  filteredCount: number;
  totalCount: number;
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose, onConfirm, hasSelection, filteredCount, totalCount }) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [scope, setScope] = useState<ExportScope>(hasSelection ? 'selected' : 'filtered');

  const handleConfirm = () => {
    onConfirm(format, scope);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-md sm:w-full mx-4">
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
              Ekspor Data Produk
            </h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-4 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Format File</h4>
              <fieldset className="mt-2">
                <legend className="sr-only">Pilih format file</legend>
                <div className="flex space-x-4">
                  {(['csv', 'json', 'pdf'] as ExportFormat[]).map((f) => (
                    <div key={f} className="flex items-center">
                      <input id={`format-${f}`} name="format" type="radio" checked={format === f} onChange={() => setFormat(f)} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                      <label htmlFor={`format-${f}`} className="ml-2 block text-sm text-gray-800 dark:text-gray-200 uppercase">{f}</label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Data yang Akan Diekspor</h4>
              <fieldset className="mt-2">
                 <legend className="sr-only">Pilih data yang akan diekspor</legend>
                 <div className="space-y-2">
                    <div className="flex items-center">
                        <input id="scope-filtered" name="scope" type="radio" checked={scope === 'filtered'} onChange={() => setScope('filtered')} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                        <label htmlFor="scope-filtered" className="ml-2 block text-sm text-gray-800 dark:text-gray-200">Hanya hasil yang difilter saat ini ({filteredCount} produk)</label>
                    </div>
                    {hasSelection && (
                        <div className="flex items-center">
                            <input id="scope-selected" name="scope" type="radio" checked={scope === 'selected'} onChange={() => setScope('selected')} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                            <label htmlFor="scope-selected" className="ml-2 block text-sm text-gray-800 dark:text-gray-200">Hanya produk yang dipilih ({hasSelection ? 'aktif' : 'tidak ada'})</label>
                        </div>
                    )}
                     <div className="flex items-center">
                        <input id="scope-all" name="scope" type="radio" checked={scope === 'all'} onChange={() => setScope('all')} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                        <label htmlFor="scope-all" className="ml-2 block text-sm text-gray-800 dark:text-gray-200">Semua produk ({totalCount} produk)</label>
                    </div>
                 </div>
              </fieldset>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Mulai Ekspor
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
