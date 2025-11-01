import { create } from "zustand";

type AnswerMap = Record<number, number>;

interface QuizState {
  userId?: string;
  orgId?: string;
  mode: "user" | "corporate";
  answers: AnswerMap;
  order: number[];
  streak: number;
  startedAt?: number;
  completedAt?: number;
  currentQuestionIndex: number;

  // Corporate mode specific
  companyName?: string;
  area?: string;
  position?: string;
  userName?: string;
  userEmail?: string;

  // UI state
  isLoading: boolean;
  error?: string;
}

interface QuizActions {
  setMode: (m: "user" | "corporate") => void;
  setUser: (uid?: string) => void;
  setOrg: (oid?: string) => void;
  setOrder: (ids: number[]) => void;
  answer: (id: number, value: number) => void;
  setStreak: (v: number) => void;
  markStart: () => void;
  markComplete: () => void;
  reset: () => void;
  clearSession: () => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setCurrentQuestion: (index: number) => void;

  // Corporate mode setters
  setCorporateInfo: (info: {
    companyName: string;
    area: string;
    position: string;
    userName: string;
    userEmail: string;
  }) => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
}

export type QuizStore = QuizState & QuizActions;

export const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state
  mode: "user",
  answers: {},
  order: [],
  streak: 0,
  currentQuestionIndex: 0,
  isLoading: false,

  // Basic actions
  setMode: (mode) => set({ mode }),
  setUser: (userId) => set({ userId }),
  setOrg: (orgId) => set({ orgId }),
  setOrder: (order) => set({ order, currentQuestionIndex: 0 }),

  answer: (id, value) => {
    const state = get();
    const newAnswers = { ...state.answers, [id]: value };

    // Calculate streak (consecutive answers)
    const answeredCount = Object.keys(newAnswers).length;
    const newStreak = answeredCount % 5 === 0 ? state.streak + 1 : state.streak;

    set({
      answers: newAnswers,
      streak: newStreak,
    });
  },

  setStreak: (streak) => set({ streak }),

  markStart: () =>
    set({
      startedAt: Date.now(),
      completedAt: undefined,
      currentQuestionIndex: 0,
      answers: {},
      streak: 0,
      error: undefined,
    }),

  markComplete: () => set({ completedAt: Date.now() }),

  reset: () =>
    set({
      answers: {},
      order: [],
      streak: 0,
      startedAt: undefined,
      completedAt: undefined,
      currentQuestionIndex: 0,
      companyName: undefined,
      area: undefined,
      position: undefined,
      userName: undefined,
      userEmail: undefined,
      isLoading: false,
      error: undefined,
    }),

  clearSession: () =>
    set({
      answers: {},
      order: [],
      streak: 0,
      startedAt: undefined,
      completedAt: undefined,
      currentQuestionIndex: 0,
      isLoading: false,
      error: undefined,
    }),

  // Navigation actions
  nextQuestion: () => {
    const state = get();
    if (state.currentQuestionIndex < state.order.length - 1) {
      set({ currentQuestionIndex: state.currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const state = get();
    if (state.currentQuestionIndex > 0) {
      set({ currentQuestionIndex: state.currentQuestionIndex - 1 });
    }
  },

  setCurrentQuestion: (index) => {
    const state = get();
    if (index >= 0 && index < state.order.length) {
      set({ currentQuestionIndex: index });
    }
  },

  // Corporate mode actions
  setCorporateInfo: (info) =>
    set({
      companyName: info.companyName,
      area: info.area,
      position: info.position,
      userName: info.userName,
      userEmail: info.userEmail,
    }),

  // UI actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
