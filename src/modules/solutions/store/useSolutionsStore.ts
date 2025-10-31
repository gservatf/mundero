// Solutions Zustand Store
// FASE 7.0 - SOLUCIONES EMPRESARIALES

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { solutionsService } from '../services/solutionsService';
import type { SolutionsStore, Solution, OrgSolution, CreateSolutionData, CreateOrgSolutionData, SolutionAccess, SolutionEvent } from '../types';

const useSolutionsStore = create<SolutionsStore>()(
    devtools(
        (set, get) => ({
            // State
            solutions: [],
            orgSolutions: [],
            loading: false,
            error: null,
            selectedSolution: null,

            // Actions
            fetchSolutions: async () => {
                set({ loading: true, error: null });
                try {
                    const solutions = await solutionsService.getAllSolutions();
                    set({ solutions, loading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch solutions',
                        loading: false
                    });
                    throw error;
                }
            },

            fetchOrgSolutions: async (orgId: string) => {
                set({ loading: true, error: null });
                try {
                    const orgSolutions = await solutionsService.getOrgSolutions(orgId);
                    set({ orgSolutions, loading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch organization solutions',
                        loading: false
                    });
                    throw error;
                }
            },

            createSolution: async (data: CreateSolutionData): Promise<Solution> => {
                set({ loading: true, error: null });
                try {
                    // Get current user from auth (you might need to inject this)
                    const createdBy = 'current-user-id'; // TODO: Get from auth context
                    const solution = await solutionsService.createSolution(data, createdBy);

                    const { solutions } = get();
                    set({
                        solutions: [...solutions, solution],
                        loading: false
                    });

                    return solution;
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to create solution',
                        loading: false
                    });
                    throw error;
                }
            },

            updateSolution: async (id: string, data: Partial<Solution>) => {
                set({ loading: true, error: null });
                try {
                    await solutionsService.updateSolution(id, data);

                    const { solutions } = get();
                    const updatedSolutions = solutions.map(solution =>
                        solution.id === id
                            ? { ...solution, ...data, updatedAt: new Date() }
                            : solution
                    );

                    set({ solutions: updatedSolutions, loading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update solution',
                        loading: false
                    });
                    throw error;
                }
            },

            deleteSolution: async (id: string) => {
                set({ loading: true, error: null });
                try {
                    await solutionsService.deleteSolution(id);

                    const { solutions } = get();
                    const filteredSolutions = solutions.filter(solution => solution.id !== id);

                    set({ solutions: filteredSolutions, loading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to delete solution',
                        loading: false
                    });
                    throw error;
                }
            },

            grantSolutionAccess: async (data: CreateOrgSolutionData) => {
                set({ loading: true, error: null });
                try {
                    // Get current user from auth
                    const grantedBy = 'current-user-id'; // TODO: Get from auth context
                    await solutionsService.grantSolutionAccess(data, grantedBy);

                    // Refresh org solutions if we're viewing the same org
                    const { orgSolutions } = get();
                    if (orgSolutions.length > 0 && orgSolutions[0].orgId === data.orgId) {
                        await get().fetchOrgSolutions(data.orgId);
                    }

                    set({ loading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to grant solution access',
                        loading: false
                    });
                    throw error;
                }
            },

            revokeSolutionAccess: async (orgId: string, solutionKey: string) => {
                set({ loading: true, error: null });
                try {
                    await solutionsService.revokeSolutionAccess(orgId, solutionKey);

                    const { orgSolutions } = get();
                    const filteredOrgSolutions = orgSolutions.filter(
                        orgSolution => !(orgSolution.orgId === orgId && orgSolution.solutionKey === solutionKey)
                    );

                    set({ orgSolutions: filteredOrgSolutions, loading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to revoke solution access',
                        loading: false
                    });
                    throw error;
                }
            },

            validateAccess: async (orgId: string, solutionKey: string): Promise<SolutionAccess> => {
                try {
                    return await solutionsService.validateSolutionAccess(orgId, solutionKey);
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to validate access'
                    });
                    throw error;
                }
            },

            trackEvent: async (event: Omit<SolutionEvent, 'id' | 'timestamp'>) => {
                try {
                    await solutionsService.trackSolutionEvent(event);
                } catch (error) {
                    // Log error but don't throw to avoid breaking user flow
                    console.error('Failed to track solution event:', error);
                }
            },

            setSelectedSolution: (solution: Solution | null) => {
                set({ selectedSolution: solution });
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'solutions-store',
        }
    )
);

export default useSolutionsStore;