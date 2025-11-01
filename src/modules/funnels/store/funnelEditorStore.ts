// Funnel Editor Store
// Zustand store for managing funnel editor state

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Funnel, FunnelStep, FunnelEditorState } from "../types";

const useFunnelEditorStore = create<FunnelEditorState>()(
  devtools(
    (set, get) => ({
      currentFunnel: null,
      isLoading: false,
      error: null,
      previewMode: false,
      selectedStep: null,

      setCurrentFunnel: (funnel) =>
        set({ currentFunnel: funnel }, false, "setCurrentFunnel"),

      updateFunnelStep: (stepId, updates) =>
        set(
          (state) => {
            if (!state.currentFunnel?.steps) return state;

            const updatedSteps = state.currentFunnel.steps.map((step) =>
              step.id === stepId ? { ...step, ...updates } : step,
            );

            return {
              currentFunnel: {
                ...state.currentFunnel,
                steps: updatedSteps,
                updatedAt: new Date(),
              },
            };
          },
          false,
          "updateFunnelStep",
        ),

      addFunnelStep: (step) =>
        set(
          (state) => {
            if (!state.currentFunnel) return state;

            const newStep: FunnelStep = {
              ...step,
              id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              order: state.currentFunnel.steps?.length || 0,
            };

            return {
              currentFunnel: {
                ...state.currentFunnel,
                steps: [...(state.currentFunnel.steps || []), newStep],
                updatedAt: new Date(),
              },
            };
          },
          false,
          "addFunnelStep",
        ),

      removeFunnelStep: (stepId) =>
        set(
          (state) => {
            if (!state.currentFunnel?.steps) return state;

            const filteredSteps = state.currentFunnel.steps
              .filter((step) => step.id !== stepId)
              .map((step, index) => ({ ...step, order: index }));

            return {
              currentFunnel: {
                ...state.currentFunnel,
                steps: filteredSteps,
                updatedAt: new Date(),
              },
              selectedStep:
                state.selectedStep === stepId ? null : state.selectedStep,
            };
          },
          false,
          "removeFunnelStep",
        ),

      reorderSteps: (startIndex, endIndex) =>
        set(
          (state) => {
            if (!state.currentFunnel?.steps) return state;

            const steps = [...state.currentFunnel.steps];
            const [removed] = steps.splice(startIndex, 1);
            steps.splice(endIndex, 0, removed);

            // Update order
            const reorderedSteps = steps.map((step, index) => ({
              ...step,
              order: index,
            }));

            return {
              currentFunnel: {
                ...state.currentFunnel,
                steps: reorderedSteps,
                updatedAt: new Date(),
              },
            };
          },
          false,
          "reorderSteps",
        ),

      setPreviewMode: (enabled) =>
        set({ previewMode: enabled }, false, "setPreviewMode"),

      setSelectedStep: (stepId) =>
        set({ selectedStep: stepId }, false, "setSelectedStep"),

      setLoading: (loading) => set({ isLoading: loading }, false, "setLoading"),

      setError: (error) => set({ error }, false, "setError"),
    }),
    {
      name: "funnel-editor-store",
    },
  ),
);

export default useFunnelEditorStore;
