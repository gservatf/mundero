import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CalendarDays,
    Clock,
    Activity,
    TrendingUp,
    Users,
    Building2,
    RefreshCw
} from 'lucide-react';
import { behaviorService, ActivityMatrix } from './behaviorService.ts';

interface ActivityHeatmapProps {
    companyId?: string;
    className?: string;
}

interface HeatmapCell {
    day: number;
    hour: number;
    activity: number;
    posts: number;
    interactions: number;
    users: number;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ companyId, className = '' }) => {
    const [activityMatrix, setActivityMatrix] = useState<ActivityMatrix | null>(null);
    const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
    const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
    const [viewMode, setViewMode] = useState<'activity' | 'posts' | 'interactions' | 'users'>('activity');
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const loadActivityData = async () => {
        try {
            setLoading(true);
            const matrix = await behaviorService.getActivityMatrix(companyId);
            setActivityMatrix(matrix);

            // Convertir la matriz en datos para el heatmap
            const cells: HeatmapCell[] = [];

            for (let day = 0; day < 7; day++) {
                for (let hour = 0; hour < 24; hour++) {
                    const dayData = matrix.byDay[day] || {};
                    const hourData = dayData[hour] || { posts: 0, interactions: 0, users: 0 };

                    const activity = hourData.posts * 1 + hourData.interactions * 0.5 + hourData.users * 2;

                    cells.push({
                        day,
                        hour,
                        activity,
                        posts: hourData.posts,
                        interactions: hourData.interactions,
                        users: hourData.users
                    });
                }
            }

            setHeatmapData(cells);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error loading activity data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivityData();

        // Auto-refresh cada 5 minutos
        const interval = setInterval(loadActivityData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [companyId]);

    const getIntensityColor = (value: number, maxValue: number): string => {
        if (maxValue === 0) return 'bg-gray-100';

        const intensity = value / maxValue;

        if (intensity === 0) return 'bg-gray-100';
        if (intensity <= 0.25) return 'bg-blue-100';
        if (intensity <= 0.5) return 'bg-blue-200';
        if (intensity <= 0.75) return 'bg-blue-400';
        return 'bg-blue-600';
    };

    const getMaxValue = (): number => {
        if (heatmapData.length === 0) return 1;

        switch (viewMode) {
            case 'posts':
                return Math.max(...heatmapData.map(cell => cell.posts), 1);
            case 'interactions':
                return Math.max(...heatmapData.map(cell => cell.interactions), 1);
            case 'users':
                return Math.max(...heatmapData.map(cell => cell.users), 1);
            default:
                return Math.max(...heatmapData.map(cell => cell.activity), 1);
        }
    };

    const getCurrentValue = (cell: HeatmapCell): number => {
        switch (viewMode) {
            case 'posts':
                return cell.posts;
            case 'interactions':
                return cell.interactions;
            case 'users':
                return cell.users;
            default:
                return cell.activity;
        }
    };

    const getViewModeIcon = () => {
        switch (viewMode) {
            case 'posts':
                return <CalendarDays className="w-4 h-4" />;
            case 'interactions':
                return <TrendingUp className="w-4 h-4" />;
            case 'users':
                return <Users className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const getViewModeLabel = () => {
        switch (viewMode) {
            case 'posts':
                return 'Posts';
            case 'interactions':
                return 'Interacciones';
            case 'users':
                return 'Usuarios';
            default:
                return 'Actividad General';
        }
    };

    const formatHour = (hour: number): string => {
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    const maxValue = getMaxValue();

    return (
        <Card className={`w-full ${className}`}>
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Mapa de Calor de Actividad
                        {companyId && (
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Building2 className="w-4 h-4" />
                                Empresa específica
                            </span>
                        )}
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadActivityData}
                            disabled={loading}
                            className="flex items-center gap-1"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                    </div>
                </div>

                {/* Selector de modo de visualización */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { mode: 'activity' as const, label: 'Actividad', icon: Activity },
                        { mode: 'posts' as const, label: 'Posts', icon: CalendarDays },
                        { mode: 'interactions' as const, label: 'Interacciones', icon: TrendingUp },
                        { mode: 'users' as const, label: 'Usuarios', icon: Users }
                    ].map(({ mode, label, icon: Icon }) => (
                        <Button
                            key={mode}
                            variant={viewMode === mode ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode(mode)}
                            className="flex items-center gap-1"
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Button>
                    ))}
                </div>

                <div className="text-sm text-gray-500">
                    Última actualización: {lastUpdate.toLocaleTimeString()}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Cargando datos de actividad...
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Heatmap */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium flex items-center gap-2">
                                    {getViewModeIcon()}
                                    {getViewModeLabel()}
                                </h3>

                                {/* Leyenda de intensidad */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>Menos</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-blue-100 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                                    </div>
                                    <span>Más</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full">
                                    {/* Encabezado de horas */}
                                    <div className="flex mb-2">
                                        <div className="w-12"></div> {/* Espacio para los días */}
                                        {hours.map(hour => (
                                            <div key={hour} className="w-6 text-xs text-center text-gray-500">
                                                {hour % 6 === 0 ? formatHour(hour).substring(0, 2) : ''}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Matriz de actividad */}
                                    {days.map((day, dayIndex) => (
                                        <div key={dayIndex} className="flex items-center mb-1">
                                            <div className="w-12 text-xs text-gray-500 text-right pr-2">
                                                {day}
                                            </div>
                                            {hours.map(hour => {
                                                const cell = heatmapData.find(c => c.day === dayIndex && c.hour === hour);
                                                const value = cell ? getCurrentValue(cell) : 0;
                                                const colorClass = getIntensityColor(value, maxValue);

                                                return (
                                                    <motion.div
                                                        key={`${dayIndex}-${hour}`}
                                                        className={`w-6 h-6 ${colorClass} rounded-sm cursor-pointer border border-gray-200 hover:border-gray-400 transition-all duration-200`}
                                                        whileHover={{ scale: 1.2, zIndex: 10 }}
                                                        onClick={() => setSelectedCell(cell || null)}
                                                        title={`${day} ${formatHour(hour)}: ${value} ${getViewModeLabel().toLowerCase()}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Información de celda seleccionada */}
                        {selectedCell && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-50 rounded-lg p-4"
                            >
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {days[selectedCell.day]} {formatHour(selectedCell.hour)}
                                </h4>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Actividad Total:</span>
                                        <div className="font-medium">{Math.round(selectedCell.activity)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Posts:</span>
                                        <div className="font-medium">{selectedCell.posts}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Interacciones:</span>
                                        <div className="font-medium">{selectedCell.interactions}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Usuarios:</span>
                                        <div className="font-medium">{selectedCell.users}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Estadísticas rápidas */}
                        {activityMatrix && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {Object.values(activityMatrix.totalsByHour).reduce((a: number, b: any) => a + (b.posts || 0), 0)}
                                    </div>
                                    <div className="text-sm text-gray-500">Posts Totales</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {Object.values(activityMatrix.totalsByHour).reduce((a: number, b: any) => a + (b.interactions || 0), 0)}
                                    </div>
                                    <div className="text-sm text-gray-500">Interacciones</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {Object.values(activityMatrix.totalsByHour).reduce((a: number, b: any) => a + (b.users || 0), 0)}
                                    </div>
                                    <div className="text-sm text-gray-500">Usuarios Activos</div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ActivityHeatmap;