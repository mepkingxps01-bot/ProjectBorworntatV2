'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Battle, StudyResource, Exam, StudyPlan } from '@/types';

const XP_PER_LEVEL = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
const STAMINA_MAX = 150; // 2.5 hours in minutes

function getTreeStage(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i;
  }
  return 0;
}

function getLevel(xp: number): number {
  return getTreeStage(xp) + 1;
}

interface GameStore extends GameState {
  addXp: (amount: number) => void;
  setResource: (resource: StudyResource) => void;
  setExam: (exam: Exam) => void;
  setStudyPlan: (plan: StudyPlan) => void;
  startBattle: (battle: Battle) => void;
  updateBattle: (battle: Battle) => void;
  endBattle: (xpEarned: number, sessionId?: string) => void;
  tickStamina: (minutes: number) => void;
  startRest: () => void;
  checkRest: () => void;
  startSession: (sessionId: string) => void;
  reset: () => void;
}

const initialState: GameState = {
  xp: 0,
  level: 1,
  treeStage: 0,
  stamina: STAMINA_MAX,
  maxStamina: STAMINA_MAX,
  totalStudyMinutes: 0,
  sessionStartTime: null,
  restUntil: null,
  resource: null,
  exam: null,
  studyPlan: null,
  currentBattle: null,
  currentSessionId: null,
  completedSessions: [],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXp: (amount) =>
        set((s) => {
          const newXp = s.xp + amount;
          return {
            xp: newXp,
            treeStage: getTreeStage(newXp),
            level: getLevel(newXp),
          };
        }),

      setResource: (resource) => set({ resource }),
      setExam: (exam) => set({ exam }),
      setStudyPlan: (studyPlan) => set({ studyPlan }),

      startBattle: (battle) =>
        set({ currentBattle: battle, sessionStartTime: Date.now() }),

      updateBattle: (battle) => set({ currentBattle: battle }),

      endBattle: (xpEarned, sessionId) =>
        set((s) => {
          const completedSessions = sessionId
            ? [...s.completedSessions, sessionId]
            : s.completedSessions;
          const studyPlan = s.studyPlan
            ? {
                ...s.studyPlan,
                sessions: s.studyPlan.sessions.map((sess) =>
                  sess.id === sessionId
                    ? { ...sess, completed: true, xpEarned }
                    : sess
                ),
              }
            : null;
          const newXp = s.xp + xpEarned;
          return {
            currentBattle: null,
            currentSessionId: null,
            completedSessions,
            studyPlan,
            xp: newXp,
            treeStage: getTreeStage(newXp),
            level: getLevel(newXp),
          };
        }),

      tickStamina: (minutes) =>
        set((s) => ({
          stamina: Math.max(0, s.stamina - minutes),
          totalStudyMinutes: s.totalStudyMinutes + minutes,
        })),

      startRest: () =>
        set({
          restUntil: Date.now() + 30 * 60 * 1000,
          stamina: 0,
        }),

      checkRest: () => {
        const { restUntil } = get();
        if (restUntil && Date.now() >= restUntil) {
          set({ restUntil: null, stamina: STAMINA_MAX });
        }
      },

      startSession: (sessionId) => set({ currentSessionId: sessionId }),

      reset: () => set(initialState),
    }),
    { name: 'ophthaquest-game' }
  )
);

export const XP_TABLE = XP_PER_LEVEL;
