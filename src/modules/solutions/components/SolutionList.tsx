// Solution List Component
// FASE 7.0 - SOLUCIONES EMPRESARIALES

import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Settings, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import useSolutionsStore from '../store/useSolutionsStore';
import type { Solution } from '../types';

interface SolutionListProps {
    onCreateSolution?: () => void;
    onViewSolution?: (solution: Solution) => void;
    onEditSolution?: (solution: Solution) => void;
    onDeleteSolution?: (solution: Solution) => void;
    showActions?: boolean;
}

export const SolutionList: React.FC<SolutionListProps> = ({
    onCreateSolution,
    onViewSolution,
    onEditSolution,
    onDeleteSolution,
    showActions = true,
}) => {
    const {
        solutions,
        loading,
        error,
        fetchSolutions,
        setSelectedSolution,
        clearError
    } = useSolutionsStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);

    useEffect(() => {
        fetchSolutions();
    }, [fetchSolutions]);

    useEffect(() => {
        let filtered = solutions;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(solution =>
                solution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                solution.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                solution.key.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(solution => solution.category === filterCategory);
        }

        setFilteredSolutions(filtered);
    }, [solutions, searchTerm, filterCategory]);

    const getCategoryColor = (category: string) => {
        const colors = {
            assessment: 'bg-blue-100 text-blue-800',
            hr: 'bg-green-100 text-green-800',
            marketing: 'bg-purple-100 text-purple-800',
            analytics: 'bg-orange-100 text-orange-800',
            other: 'bg-gray-100 text-gray-800',
        };
        return colors[category as keyof typeof colors] || colors.other;
    };

    const handleSolutionClick = (solution: Solution) => {
        setSelectedSolution(solution);
        onViewSolution?.(solution);
    };

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-red-800">
                            <strong>Error:</strong> {error}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearError}
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Solutions</h2>
                    <p className="text-gray-600">Manage enterprise solutions and access</p>
                </div>
                {showActions && onCreateSolution && (
                    <Button onClick={onCreateSolution}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Solution
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search solutions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                            <option value="all">All Categories</option>
                            <option value="assessment">Assessment</option>
                            <option value="hr">Human Resources</option>
                            <option value="marketing">Marketing</option>
                            <option value="analytics">Analytics</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Solutions Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-20 bg-gray-200 rounded mb-4"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-6 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 bg-gray-200 rounded w-8"></div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : filteredSolutions.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="text-gray-500">
                        {searchTerm || filterCategory !== 'all'
                            ? 'No solutions match your filters.'
                            : 'No solutions available.'
                        }
                    </div>
                    {showActions && onCreateSolution && !searchTerm && filterCategory === 'all' && (
                        <Button
                            onClick={onCreateSolution}
                            className="mt-4"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Solution
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSolutions.map((solution) => (
                        <Card
                            key={solution.id}
                            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleSolutionClick(solution)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                        {solution.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        {solution.key}
                                    </p>
                                </div>
                                {showActions && (
                                    <div className="relative group">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Handle dropdown menu
                                            }}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {solution.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <Badge
                                    className={getCategoryColor(solution.category)}
                                    variant="secondary"
                                >
                                    {solution.category}
                                </Badge>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${solution.active ? 'bg-green-400' : 'bg-gray-400'
                                        }`}></div>
                                    <span className="text-xs text-gray-500">
                                        {solution.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-400">
                                {solution.allowedOrgs.length} organizations • Created {solution.createdAt.toLocaleDateString()}
                            </div>

                            {showActions && (
                                <div className="mt-4 flex items-center space-x-2 pt-4 border-t border-gray-100">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewSolution?.(solution);
                                        }}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditSolution?.(solution);
                                        }}
                                    >
                                        <Settings className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteSolution?.(solution);
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};