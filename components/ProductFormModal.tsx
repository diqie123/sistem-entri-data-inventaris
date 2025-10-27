import React, { useState, useEffect } from 'react';
import { Product, ProductStatus } from '../types';
import { XMarkIcon, ArrowUpTrayIcon, ArrowUturnLeftIcon } from './Icons';

interface ProductFormModalProps {
  productToEdit: Product | null;
  onClose: () => void;
  onSave: (product: Product, action?: 'save' | 'saveAndNew') => void;
  categories: string[];
}

const DRAFT_STORAGE_KEY = 'productFormDraft';

// Utility to format ISO date string to datetime-local input format
const formatToDateTimeLocal = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({ productToEdit, onClose, onSave, categories }) => {
  const getInitialFormData = () => ({
    name: '',
    sku: '',
    category: categories[0] || '',
    description: '',
    price: 0,
    stock: 0,
    status: ProductStatus.Active,
    imageUrl: `https://picsum.photos/seed/${Date.now()}/400/400`,
    dateAdded: new Date().toISOString(),
    isFeatured: false,
    contactEmail: '',
    productUrl: '',
  });

  const [formData, setFormData] = useState<Omit<Product, 'id' | 'lastUpdated'>>(getInitialFormData());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!productToEdit) { // Only auto-save for new products
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error("Could not save draft to localStorage", error);
      }
    }
  }, [formData, productToEdit]);

  // Load draft from localStorage on initial mount
  useEffect(() => {
    if (!productToEdit) { // Only check for drafts when creating a new product
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft);
          if (draftData.name || draftData.sku || draftData.price > 0) {
            if (window.confirm("Ada draf yang belum disimpan. Apakah Anda ingin memulihkannya?")) {
              setFormData(draftData);
            } else {
              localStorage.removeItem(DRAFT_STORAGE_KEY);
            }
          }
        }
      } catch (error) {
        console.error("Could not load draft from localStorage", error);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }
  }, []); // Empty dependency array ensures this runs only once when modal mounts

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      setFormData(getInitialFormData());
    }
  }, [productToEdit, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        let processedValue: string | number = value;
        if (type === 'number') {
            processedValue = value === '' ? '' : parseFloat(value);
        }
        if (type === 'datetime-local') {
            processedValue = value ? new Date(value).toISOString() : '';
        }
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Nama produk wajib diisi';
    if (!formData.sku.trim() && !productToEdit?.id) newErrors.sku = 'SKU wajib diisi untuk produk baru'; // SKU can be empty for duplication
    if (!formData.category.trim()) newErrors.category = 'Kategori wajib diisi';
    if (formData.price <= 0) newErrors.price = 'Harga harus lebih dari 0';
    if (formData.stock < 0) newErrors.stock = 'Stok tidak boleh negatif';
    
    // More robust email validation
    if (formData.contactEmail && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Format email tidak valid';
    }

    // More robust URL validation (handles missing protocol)
    if (formData.productUrl) {
        try {
            let url = formData.productUrl;
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            new URL(url);
        } catch (_) {
            newErrors.productUrl = 'Format URL tidak valid';
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePrimarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const productData: Product = {
          ...formData,
          id: productToEdit?.id || Date.now().toString(),
          lastUpdated: new Date().toISOString()
      };
      onSave(productData, 'save');
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  const handleSaveAndNew = () => {
    if (validate()) {
      const productData: Product = {
          ...formData,
          id: productToEdit?.id || Date.now().toString(),
          lastUpdated: new Date().toISOString()
      };
      onSave(productData, 'saveAndNew');
    }
  };
  
  const resetForm = () => {
    if (window.confirm("Anda yakin ingin mengatur ulang formulir? Semua perubahan yang belum disimpan akan hilang.")) {
        setFormData(getInitialFormData());
        setErrors({});
    }
  };

  const handleClose = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    onClose();
  };
  
  const InputField: React.FC<{name: keyof Omit<Product, 'id' | 'lastUpdated'>, label: string, type?: string, required?: boolean, step?: string}> = ({name, label, type='text', required=false, step}) => (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
          type={type}
          name={name}
          id={name}
          value={
            type === 'datetime-local' 
                ? formatToDateTimeLocal(formData[name] as string)
                : formData[name] as string | number
          }
          onChange={handleChange}
          required={required}
          step={step}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${errors[name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
      </div>
  );
  
  const ToggleSwitch: React.FC<{name: 'isFeatured', label: string, description: string}> = ({name, label, description}) => (
    <div className="flex items-center justify-between">
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <label htmlFor={name} className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox"
                name={name}
                id={name}
                checked={formData[name]}
                onChange={handleChange}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
        </label>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full mx-4 flex flex-col max-h-[90vh]">
        <form onSubmit={handlePrimarySubmit} className="flex flex-col h-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                {productToEdit?.id ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
               <div className="flex items-center space-x-2">
                 <button type="button" onClick={resetForm} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-400" title="Reset Form">
                    <ArrowUturnLeftIcon className="h-5 w-5" />
                 </button>
                 <button type="button" onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
                   <XMarkIcon className="h-6 w-6" />
                 </button>
               </div>
            </div>
          </div>
          <div className="px-4 sm:px-6 py-4 flex-grow overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gambar Produk</label>
                    <img src={formData.imageUrl} alt="Product preview" className="w-full h-32 object-cover rounded-md bg-gray-200 dark:bg-gray-700 mb-2"/>
                    <label htmlFor="image-upload" className="cursor-pointer w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        Unggah Gambar
                    </label>
                    <input id="image-upload" name="imageUrl" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <InputField name="name" label="Nama Produk" required />
                    </div>
                     <InputField name="sku" label="SKU" required={!productToEdit?.id} />
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                        <select
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                    </div>
                </div>
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField name="price" label="Harga" type="number" required step="0.01" />
                    <InputField name="stock" label="Stok" type="number" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                    <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700"
                    ></textarea>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                            <option value={ProductStatus.Active}>Aktif</option>
                            <option value={ProductStatus.Discontinued}>Dihentikan</option>
                        </select>
                    </div>
                    <InputField name="dateAdded" label="Tanggal Ditambahkan" type="datetime-local" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(formData.category === 'Electronics' || formData.category === 'Accessories') &&
                        <InputField name="contactEmail" label="Email Kontak" type="email" />
                    }
                    <InputField name="productUrl" label="URL Produk" type="url" />
                </div>
                <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-700/50">
                    <ToggleSwitch name="isFeatured" label="Produk Unggulan" description="Tampilkan produk ini di halaman utama." />
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
                <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                Simpan
                </button>
                <button
                type="button"
                onClick={handleSaveAndNew}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                Simpan & Baru
                </button>
                <button
                type="button"
                onClick={handleClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 sm:mr-auto"
                >
                Batal
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;