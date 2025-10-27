import React, { useState } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from './Icons';
import ConfirmationDialog from './ConfirmationDialog';

interface SettingsPageProps {
  categories: string[];
  onAddCategory: (newCategory: string) => boolean;
  onUpdateCategory: (oldCategory: string, newCategory: string) => boolean;
  onDeleteCategory: (category: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ originalName: string; currentName: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      const success = onAddCategory(newCategoryName.trim());
      if (success) {
        setNewCategoryName('');
      }
    }
  };

  const handleEditClick = (category: string) => {
    setEditingCategory({ originalName: category, currentName: category });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && editingCategory.currentName.trim() && editingCategory.currentName.trim() !== editingCategory.originalName) {
      const success = onUpdateCategory(editingCategory.originalName, editingCategory.currentName.trim());
      if (success) {
        setEditingCategory(null);
      }
    } else {
        setEditingCategory(null); // Cancel if name is unchanged or empty
    }
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
        onDeleteCategory(categoryToDelete);
        setCategoryToDelete(null);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Kelola Kategori Produk</h2>

        {/* Add Category Form */}
        <form onSubmit={handleAddSubmit} className="flex items-center space-x-2 mb-6">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nama kategori baru"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </form>

        {/* Category List */}
        <div className="space-y-3">
            {categories.length > 0 ? categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-700/50">
                {editingCategory?.originalName === category ? (
                    <form onSubmit={handleUpdateSubmit} className="flex-grow flex items-center space-x-2">
                        <input
                            type="text"
                            value={editingCategory.currentName}
                            onChange={(e) => setEditingCategory({ ...editingCategory, currentName: e.target.value })}
                            className="flex-grow px-3 py-1 border border-primary-500 rounded-md dark:bg-gray-600 focus:ring-primary-500 focus:border-primary-500"
                            autoFocus
                        />
                        <button type="submit" className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">Simpan</button>
                        <button type="button" onClick={() => setEditingCategory(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Batal</button>
                    </form>
                ) : (
                    <>
                        <span className="text-gray-800 dark:text-gray-200">{category}</span>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => handleEditClick(category)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                                <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setCategoryToDelete(category)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </>
                )}
                </div>
            )) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Belum ada kategori yang ditambahkan.</p>
            )}
        </div>
      </div>

       {categoryToDelete && (
        <ConfirmationDialog
            title="Hapus Kategori"
            message={`Anda yakin ingin menghapus kategori "${categoryToDelete}"? Tindakan ini tidak dapat diurungkan.`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setCategoryToDelete(null)}
        />
      )}
    </div>
  );
};

export default SettingsPage;
