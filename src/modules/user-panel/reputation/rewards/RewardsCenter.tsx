// Centro de Recompensas principal
// Interfaz completa para navegar y canjear recompensas

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiAward,
    FiFilter,
    FiGrid,
    FiList,
    FiRefreshCw,
    FiSearch,
    FiStar,
    FiClock,
    FiGift,
    FiDollarSign,
    FiSettings
} from 'react-icons/fi';
import { RewardCard } from './RewardCard';
import { RedemptionHistory } from './RedemptionHistory';
import { UserRewardStats } from './UserRewardStats';
import { useRewards } from './useRewards';
import { RewardCategory } from './types';

interface RewardsCenterProps {
    userId: string;
    onRewardRedeem?: (rewardId: string) => void;
}

type ViewMode = 'grid' | 'list';
type ActiveTab = 'catalog' | 'history' | 'stats';

export const RewardsCenter: React.FC<RewardsCenterProps> = ({
    userId,
    onRewardRedeem
}) => {
    const {
        rewards,
        userStats,
        userRedemptions,
        loading,
        error,
        redeemReward,
        getRewardsByCategory,
        canUserRedeem,
        refreshRewards
    } = useRewards(userId);

    const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
    const [selectedCategory, setSelectedCategory] = useState<RewardCategory | 'all'>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'points' | 'popularity' | 'newest'>('points');
    const [showFilters, setShowFilters] = useState(false);

    // Filtrar y ordenar recompensas
    const filteredRewards = rewards
        .filter(reward => {
            if (selectedCategory !== 'all' && reward.category !== selectedCategory) {
                return false;
            }
            if (searchQuery && !reward.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !reward.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            return reward.isActive;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'points':
                    return a.pointsCost - b.pointsCost;
                case 'popularity':
                    return b.redemptionCount - a.redemptionCount;
                case 'newest':
                    return b.createdAt - a.createdAt;
                default:
                    return 0;
            }
        });

    const categories: { id: RewardCategory | 'all'; name: string; icon: string; count: number }[] = [
        { id: 'all', name: 'Todas', icon: '🎁', count: rewards.length },
        { id: 'premium', name: 'Premium', icon: '👑', count: getRewardsByCategory('premium').length },
        { id: 'discounts', name: 'Descuentos', icon: '🎟️', count: getRewardsByCategory('discounts').length },
        { id: 'physical', name: 'Físicas', icon: '📦', count: getRewardsByCategory('physical').length },
        { id: 'digital', name: 'Digitales', icon: '💻', count: getRewardsByCategory('digital').length },
        { id: 'experiences', name: 'Experiencias', icon: '🎯', count: getRewardsByCategory('experiences').length },
        { id: 'badges', name: 'Badges', icon: '🏅', count: getRewardsByCategory('badges').length },
        { id: 'features', name: 'Funciones', icon: '⚡', count: getRewardsByCategory('features').length }
    ];

    const handleRewardRedeem = async (rewardId: string) => {
        const success = await redeemReward(rewardId);
        if (success) {
            onRewardRedeem?.(rewardId);
        }
    };

    const tabs = [
        { id: 'catalog', name: 'Catálogo', icon: FiGift },
        { id: 'history', name: 'Historial', icon: FiClock },
        { id: 'stats', name: 'Estadísticas', icon: FiStar }
    ];

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <FiAward className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">Centro de Recompensas</h1>
                            <p className="text-purple-100">Canjea tus puntos por increíbles premios</p>
                        </div>
                    </div>

                    {userStats && (
                        <div className="text-right">
                            <div className="text-2xl font-bold">{userStats.availablePoints.toLocaleString()}</div>
                            <div className="text-purple-100 text-sm">puntos disponibles</div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white/20 rounded-lg p-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ActiveTab)}
                                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors flex-1
                  ${activeTab === tab.id
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-white hover:bg-white/20'
                                    }
                `}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* Catalog Tab */}
                    {activeTab === 'catalog' && (
                        <motion.div
                            key="catalog"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Search and Filters */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Buscar recompensas..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <FiFilter className="w-4 h-4" />
                                        <span>Filtros</span>
                                    </button>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="points">Menor precio</option>
                                        <option value="popularity">Más popular</option>
                                        <option value="newest">Más reciente</option>
                                    </select>

                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <FiGrid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <FiList className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={refreshRewards}
                                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                                    >
                                        <FiRefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Categories */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-gray-50 rounded-lg p-4"
                                    >
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">Categorías</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => setSelectedCategory(category.id)}
                                                    className={`
                            flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors
                            ${selectedCategory === category.id
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                                                        }
                          `}
                                                >
                                                    <span>{category.icon}</span>
                                                    <span>{category.name}</span>
                                                    <span className="bg-black/20 text-xs px-2 py-0.5 rounded-full">
                                                        {category.count}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Rewards Grid/List */}
                            <div className={`
                ${viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                    : 'space-y-4'
                                }
              `}>
                                <AnimatePresence>
                                    {filteredRewards.map((reward, index) => (
                                        <motion.div
                                            key={reward.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <RewardCard
                                                reward={reward}
                                                userStats={userStats}
                                                canRedeem={canUserRedeem(reward.id).canRedeem}
                                                redemptionReason={canUserRedeem(reward.id).reason}
                                                onRedeem={() => handleRewardRedeem(reward.id)}
                                                viewMode={viewMode}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {filteredRewards.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <FiGift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No se encontraron recompensas</p>
                                    <p>Intenta cambiar los filtros o buscar algo diferente</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <RedemptionHistory
                                userId={userId}
                                redemptions={userRedemptions}
                                rewards={rewards}
                            />
                        </motion.div>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <UserRewardStats
                                userId={userId}
                                stats={userStats}
                                rewards={rewards}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RewardsCenter;