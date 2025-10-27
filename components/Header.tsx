import React from 'react';
import { PlusIcon, CubeIcon, SunIcon, MoonIcon, ArrowUpTrayIcon } from './Icons';

interface HeaderProps {
    onAddProduct: () => void;
    onImport: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddProduct, onImport, isDarkMode, toggleDarkMode }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <CubeIcon className="h-8 w-8 text-primary-500" />
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Sistem Inventaris
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button
                            type="button"
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? <SunIcon className="h-6 w-6 pointer-events-none" /> : <MoonIcon className="h-6 w-6 pointer-events-none" />}
                        </button>
                        <button
                            type="button"
                            onClick={onImport}
                            className="hidden sm:inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                        >
                            <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5 pointer-events-none" />
                            <span>Impor</span>
                        </button>
                        <button
                             type="button"
                             onClick={onAddProduct}
                             className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5 pointer-events-none" />
                            <span className="hidden sm:inline">Tambah Produk</span>
                             <span className="sm:hidden">Baru</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
