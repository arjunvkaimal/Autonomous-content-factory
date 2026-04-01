import { create } from "zustand";

const useStore = create((set) => ({
  sourceText: "",
  factSheet: null,
  drafts: null,
  final: null,

  setSourceText: (text) => set({ sourceText: text }),
  setFactSheet: (data) => set({ factSheet: data }),
  setDrafts: (data) => set({ drafts: data }),
  setFinal: (data) => set({ final: data }),
}));

export default useStore;