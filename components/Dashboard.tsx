
import React, { useMemo } from 'react';
import { Product } from '../types';
import { CubeIcon, CurrencyDollarIcon, ExclamationTriangleIcon, CheckCircleIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  products: Product[];
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-6">
        <div className={`rounded-full p-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockItems = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const activeItems = products.filter(p => p.status === 'Active').length;

    return { totalProducts, totalStockValue, lowStockItems, activeItems };
  }, [products]);

  const categoryData = useMemo(() => {
    const categoryCount: { [key: string]: number } = {};
    products.forEach(p => {
        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    return Object.keys(categoryCount).map(name => ({
        name,
        products: categoryCount[name]
    }));
  }, [products]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Produk" 
            value={stats.totalProducts} 
            icon={<CubeIcon className="h-8 w-8 text-white"/>}
            color="bg-blue-500"
        />
        <StatCard 
            title="Nilai Stok Total" 
            value={`$${stats.totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<CurrencyDollarIcon className="h-8 w-8 text-white"/>}
            color="bg-green-500"
        />
        <StatCard 
            title="Stok Menipis (<10)" 
            value={stats.lowStockItems}
            icon={<ExclamationTriangleIcon className="h-8 w-8 text-white"/>}
            color="bg-yellow-500"
        />
        <StatCard 
            title="Item Aktif" 
            value={stats.activeItems}
            icon={<CheckCircleIcon className="h-8 w-8 text-white"/>}
            color="bg-purple-500"
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Jumlah Produk per Kategori</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" stroke="rgb(156 163 175)" />
                    <YAxis stroke="rgb(156 163 175)" />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                            borderColor: 'rgba(128, 128, 128, 0.5)',
                            color: 'white'
                        }}
                    />
                    <Legend />
                    <Bar dataKey="products" fill="#3b82f6" name="Jumlah Produk"/>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
