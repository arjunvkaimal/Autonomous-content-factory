import { create } from "zustand";

const useStore = create((set, get) => ({
  // ── Pipeline data ──────────────────────────────────────────────────────
  sourceText: "",
  factSheet: null,
  drafts: null,
  final: null,

  setSourceText: (text) => set({ sourceText: text }),
  setFactSheet: (data) => set({ factSheet: data }),
  setDrafts: (data) => set({ drafts: data }),
  setFinal: (data) => set({ final: data }),

  // ── Live pipeline state ────────────────────────────────────────────────
  pipelineStatus: "idle", // 'idle' | 'running' | 'done' | 'error'
  stepStatuses: {
    researcher: "pending", // 'pending' | 'running' | 'done' | 'error'
    copywriter: "pending",
    editor: "pending",
  },
  agentLogs: [],

  setPipelineStatus: (status) => set({ pipelineStatus: status }),

  setStepStatus: (step, status) =>
    set((state) => ({
      stepStatuses: { ...state.stepStatuses, [step]: status },
    })),

  addLog: (agent, message, type = "info") =>
    set((state) => ({
      agentLogs: [
        ...state.agentLogs,
        {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString("en-US", { hour12: false }),
          agent,
          message,
          type, // 'info' | 'success' | 'warn' | 'error' | 'data'
        },
      ],
    })),

  resetPipeline: () =>
    set({
      agentLogs: [],
      pipelineStatus: "idle",
      stepStatuses: {
        researcher: "pending",
        copywriter: "pending",
        editor: "pending",
      },
      factSheet: null,
      drafts: null,
      final: null,
    }),
}));

export default useStore;