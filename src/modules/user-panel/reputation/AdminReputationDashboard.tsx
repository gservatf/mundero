// Panel de Administración de Reputación
// Gestión completa del sistema para administradores

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { reputationService, REPUTATION_ENABLED } from './reputationService';
import { UserReputation, DEFAULT_BADGES, DEFAULT_LEVELS } from './types';
import { LevelChip } from './components/LevelChip';
import { BadgesList } from './components/BadgesList';
import {
    FiSearch,
    FiUser,
    FiEdit3,
    FiPlus,
    FiMinus,
    FiSave,
    FiX,
    FiShield,
    FiAlertTriangle,
    FiCheck,
    FiFilter,
    FiRefreshCw,
    FiDownload,
    FiSettings
} from 'react-icons/fi';

interface UserWithReputation extends UserReputation {
    displayName?: string;
    email?: string;
    company?: string;
}

interface AdminAction {
    id: string;
    userId: string;
    adminId: string;
    action: 'points_add' | 'points_subtract' | 'badge_add' | 'badge_remove' | 'level_change';
    value: string | number;
    reason: string;
    timestamp: number;
}

export const AdminReputationDashboard: React.FC = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserWithReputation[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserWithReputation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [filterLevel, setFilterLevel] = useState<number | null>(null);
    const [tempChanges, setTempChanges] = useState<{
        points: number;
        badges: string[];
        reason: string;
    }>({ points: 0, badges: [], reason: '' });

    // Verificar permisos de admin
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';    // Cargar usuarios con reputación
    const loadUsers = async () => {
        if (!REPUTATION_ENABLED) return;

        try {
            setLoading(true);
            setError(null);
            const leaderboard = await reputationService.getUserLeaderboard(100);

            // Simular datos adicionales de usuario (en producción vendrían de una colección users)
            const usersWithDetails = leaderboard.map((user, index) => ({
                ...user,
                displayName: `Usuario ${user.userId.slice(-6)}`,
                email: `user${index}@ejemplo.com`,
                company: ['Grupo Servat', 'Empresa A', 'Empresa B'][index % 3]
            }));

            setUsers(usersWithDetails);
        } catch (err) {
            console.error('Error loading users:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar usuarios
    useEffect(() => {
        let filtered = users.filter(user =>
            (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterLevel === null || user.level === filterLevel)
        );

        setFilteredUsers(filtered);
    }, [users, searchTerm, filterLevel]);

    // Cargar datos al montar
    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    // Abrir modal de edición
    const openEditModal = (userId: string) => {
        const user = users.find(u => u.userId === userId);
        if (user) {
            setEditingUser(userId);
            setTempChanges({
                points: user.totalPoints,
                badges: [...user.badges],
                reason: ''
            });
        }
    };

    // Cerrar modal de edición
    const closeEditModal = () => {
        setEditingUser(null);
        setTempChanges({ points: 0, badges: [], reason: '' });
    };

    // Aplicar cambios administrativos
    const applyAdminChanges = async () => {
        if (!editingUser || !tempChanges.reason.trim()) {
            alert('Por favor, proporciona una razón para el cambio');
            return;
        }

        const user = users.find(u => u.userId === editingUser);
        if (!user) return;

        try {
            const pointsDiff = tempChanges.points - user.totalPoints;

            // Registrar acción de auditoría
            const adminAction: AdminAction = {
                id: Date.now().toString(),
                userId: editingUser,
                adminId: user?.userId || 'admin',
                action: pointsDiff > 0 ? 'points_add' : 'points_subtract',
                value: Math.abs(pointsDiff),
                reason: tempChanges.reason,
                timestamp: Date.now()
            };

            // Simular guardado en Firestore (en producción sería una colección admin_actions)
            setAdminActions(prev => [...prev, adminAction]);

            // Actualizar usuario localmente (en producción habría que llamar al servicio)
            setUsers(prev => prev.map(u =>
                u.userId === editingUser
                    ? { ...u, totalPoints: tempChanges.points, badges: tempChanges.badges }
                    : u
            ));

            alert(`Cambios aplicados exitosamente para ${user.displayName}`);
            closeEditModal();

        } catch (error) {
            console.error('Error applying admin changes:', error);
            alert('Error al aplicar cambios');
        }
    };

    // Alternar badge
    const toggleBadge = (badgeId: string) => {
        setTempChanges(prev => ({
            ...prev,
            badges: prev.badges.includes(badgeId)
                ? prev.badges.filter(b => b !== badgeId)
                : [...prev.badges, badgeId]
        }));
    };

    // Exportar datos
    const exportData = () => {
        const csvContent = [
            ['Usuario', 'Email', 'Nivel', 'Puntos', 'Badges', 'Empresa'].join(','),
            ...filteredUsers.map(user => [
                user.displayName || user.userId,
                user.email || '',
                user.level,
                user.totalPoints,
                user.badges.length,
                user.company || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reputacion_usuarios_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!REPUTATION_ENABLED) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
                    <FiSettings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        Panel Admin No Disponible
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        El panel administrativo estará disponible cuando se active el sistema de reputación.
                    </p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                    <FiShield className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                        Acceso Denegado
                    </h3>
                    <p className="text-red-500 dark:text-red-400">
                        Solo los administradores pueden acceder a este panel.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                        <FiShield className="w-8 h-8 text-red-600" />
                        <span>Panel de Administración</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gestión completa del sistema de reputación
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowAuditLog(!showAuditLog)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                        <FiEdit3 className="w-4 h-4" />
                        <span>Log de Auditoría</span>
                    </button>
                    <button
                        onClick={exportData}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                        <FiDownload className="w-4 h-4" />
                        <span>Exportar</span>
                    </button>
                    <button
                        onClick={loadUsers}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualizar</span>
                    </button>
                </div>
            </motion.div>

            {/* Controles de filtrado */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-gray-200 dark:border-neutral-700"
            >
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar usuario, email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FiFilter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterLevel || ''}
                                onChange={(e) => setFilterLevel(e.target.value ? parseInt(e.target.value) : null)}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Todos los niveles</option>
                                {DEFAULT_LEVELS.map(level => (
                                    <option key={level.id} value={level.id}>
                                        Nivel {level.id} - {level.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredUsers.length} usuarios
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Lista de usuarios */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-neutral-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nivel
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Puntos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Insignias
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchTerm || filterLevel ? 'No se encontraron usuarios con esos filtros' : 'No hay usuarios cargados'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {user.displayName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.displayName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <LevelChip
                                                level={user.level}
                                                name={DEFAULT_LEVELS.find(l => l.id === user.level)?.name || 'Explorador'}
                                                size="small"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.totalPoints.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {user.badges.length} insignias
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.company}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(user.userId)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modal de edición */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {(() => {
                                const user = users.find(u => u.userId === editingUser);
                                if (!user) return null;

                                return (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Editar Usuario: {user.displayName}
                                            </h3>
                                            <button
                                                onClick={closeEditModal}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                <FiX className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Puntos */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Puntos Totales
                                                </label>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setTempChanges(prev => ({ ...prev, points: Math.max(0, prev.points - 50) }))}
                                                        className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                                                    >
                                                        <FiMinus className="w-4 h-4" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={tempChanges.points}
                                                        onChange={(e) => setTempChanges(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                                                        className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                                                    />
                                                    <button
                                                        onClick={() => setTempChanges(prev => ({ ...prev, points: prev.points + 50 }))}
                                                        className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                                                    >
                                                        <FiPlus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Actual: {user.totalPoints} puntos
                                                </p>
                                            </div>

                                            {/* Insignias */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Insignias
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {DEFAULT_BADGES.map(badge => (
                                                        <label
                                                            key={badge.id}
                                                            className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={tempChanges.badges.includes(badge.id)}
                                                                onChange={() => toggleBadge(badge.id)}
                                                                className="rounded"
                                                            />
                                                            <span className="text-xl">{badge.icon}</span>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {badge.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {badge.description}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Razón del cambio */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Razón del Cambio *
                                                </label>
                                                <textarea
                                                    value={tempChanges.reason}
                                                    onChange={(e) => setTempChanges(prev => ({ ...prev, reason: e.target.value }))}
                                                    placeholder="Explica por qué estás haciendo estos cambios..."
                                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white resize-none"
                                                    rows={3}
                                                    required
                                                />
                                            </div>

                                            {/* Botones */}
                                            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={closeEditModal}
                                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={applyAdminChanges}
                                                    disabled={!tempChanges.reason.trim()}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                                >
                                                    <FiSave className="w-4 h-4" />
                                                    <span>Guardar Cambios</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Log de auditoría */}
            <AnimatePresence>
                {showAuditLog && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Log de Auditoría
                                </h3>
                                <button
                                    onClick={() => setShowAuditLog(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {adminActions.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    No hay acciones administrativas registradas
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {adminActions.slice(-10).reverse().map(action => (
                                        <div
                                            key={action.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-700 rounded-lg"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {action.action === 'points_add' ? '➕ Puntos añadidos' :
                                                        action.action === 'points_subtract' ? '➖ Puntos sustraídos' :
                                                            action.action === 'badge_add' ? '🏆 Insignia añadida' :
                                                                action.action === 'badge_remove' ? '🚫 Insignia removida' :
                                                                    '📝 Nivel cambiado'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Usuario: {action.userId} • Valor: {action.value} • {action.reason}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(action.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};