import { createStore, useStore } from "zustand";
import { createContext, useContext } from "react";
import {
  createEntry,
  createSection,
  createSkillGroup,
  type ResumeBasics,
  type ResumeContent,
  type ResumeDTO,
  type ResumeEntry,
  type ResumeSection,
  type ResumeSettings,
  type SectionType,
  type SkillGroup,
} from "@resumeai/shared";

export type SaveStatus = "saved" | "pending" | "saving" | "error";

export interface EditorState {
  id: string;
  title: string;
  content: ResumeContent;
  settings: ResumeSettings;
  /** Bumped on every change; the autosaver compares it with the last saved revision. */
  revision: number;
  savedRevision: number;
  status: SaveStatus;
  error: string | null;
  openSection: string | null;
  openEntry: string | null;

  setTitle: (title: string) => void;
  updateBasics: (patch: Partial<ResumeBasics>) => void;
  updateSection: (id: string, patch: Partial<ResumeSection>) => void;
  addSection: (type: SectionType) => string;
  removeSection: (id: string) => void;
  moveSection: (from: number, to: number) => void;
  addEntry: (sectionId: string) => void;
  updateEntry: (sectionId: string, entryId: string, patch: Partial<ResumeEntry>) => void;
  removeEntry: (sectionId: string, entryId: string) => void;
  duplicateEntry: (sectionId: string, entryId: string) => void;
  moveEntry: (sectionId: string, from: number, to: number) => void;
  addGroup: (sectionId: string) => void;
  updateGroup: (sectionId: string, groupId: string, patch: Partial<SkillGroup>) => void;
  removeGroup: (sectionId: string, groupId: string) => void;
  moveGroup: (sectionId: string, from: number, to: number) => void;
  setSettings: (patch: Partial<ResumeSettings>) => void;
  setOpenSection: (id: string | null) => void;
  setOpenEntry: (id: string | null) => void;
  markSaving: () => void;
  markSaved: (revision: number) => void;
  markError: (message: string) => void;
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

export function createEditorStore(resume: ResumeDTO) {
  return createStore<EditorState>()((set) => {
    /** Applies a content change and marks the document dirty. */
    const edit = (fn: (content: ResumeContent) => ResumeContent) =>
      set((s) => ({ content: fn(s.content), revision: s.revision + 1, status: "pending" }));

    const mapSection = (id: string, fn: (section: ResumeSection) => ResumeSection) =>
      edit((c) => ({ ...c, sections: c.sections.map((s) => (s.id === id ? fn(s) : s)) }));

    return {
      id: resume.id,
      title: resume.title,
      content: resume.content,
      settings: resume.settings,
      revision: 0,
      savedRevision: 0,
      status: "saved",
      error: null,
      openSection: resume.content.sections[0]?.id ?? null,
      openEntry: null,

      setTitle: (title) => set((s) => ({ title, revision: s.revision + 1, status: "pending" })),

      updateBasics: (patch) => edit((c) => ({ ...c, basics: { ...c.basics, ...patch } })),

      updateSection: (id, patch) => mapSection(id, (s) => ({ ...s, ...patch })),

      addSection: (type) => {
        const section = createSection(type, {
          entries: type === "summary" || type === "skills" ? [] : [createEntry({ bullets: [""] })],
          groups: type === "skills" ? [createSkillGroup()] : [],
        });
        edit((c) => ({ ...c, sections: [...c.sections, section] }));
        set({ openSection: section.id, openEntry: section.entries[0]?.id ?? null });
        return section.id;
      },

      removeSection: (id) => edit((c) => ({ ...c, sections: c.sections.filter((s) => s.id !== id) })),

      moveSection: (from, to) => edit((c) => ({ ...c, sections: move(c.sections, from, to) })),

      addEntry: (sectionId) => {
        const entry = createEntry({ bullets: [""] });
        mapSection(sectionId, (s) => ({ ...s, entries: [...s.entries, entry] }));
        set({ openEntry: entry.id });
      },

      updateEntry: (sectionId, entryId, patch) =>
        mapSection(sectionId, (s) => ({
          ...s,
          entries: s.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
        })),

      removeEntry: (sectionId, entryId) =>
        mapSection(sectionId, (s) => ({ ...s, entries: s.entries.filter((e) => e.id !== entryId) })),

      duplicateEntry: (sectionId, entryId) => {
        const copyId = createEntry().id;
        mapSection(sectionId, (s) => {
          const index = s.entries.findIndex((e) => e.id === entryId);
          const source = s.entries[index];
          if (!source) return s;
          const entries = s.entries.slice();
          entries.splice(index + 1, 0, { ...source, id: copyId, bullets: [...source.bullets] });
          return { ...s, entries };
        });
        set({ openEntry: copyId });
      },

      moveEntry: (sectionId, from, to) => mapSection(sectionId, (s) => ({ ...s, entries: move(s.entries, from, to) })),

      addGroup: (sectionId) => mapSection(sectionId, (s) => ({ ...s, groups: [...s.groups, createSkillGroup()] })),

      updateGroup: (sectionId, groupId, patch) =>
        mapSection(sectionId, (s) => ({
          ...s,
          groups: s.groups.map((g) => (g.id === groupId ? { ...g, ...patch } : g)),
        })),

      removeGroup: (sectionId, groupId) =>
        mapSection(sectionId, (s) => ({ ...s, groups: s.groups.filter((g) => g.id !== groupId) })),

      moveGroup: (sectionId, from, to) => mapSection(sectionId, (s) => ({ ...s, groups: move(s.groups, from, to) })),

      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch }, revision: s.revision + 1, status: "pending" })),

      setOpenSection: (id) => set({ openSection: id }),
      setOpenEntry: (id) => set({ openEntry: id }),

      markSaving: () => set({ status: "saving", error: null }),
      markSaved: (revision) =>
        set((s) => ({
          savedRevision: revision,
          status: s.revision === revision ? "saved" : "pending",
          error: null,
        })),
      markError: (message) => set({ status: "error", error: message }),
    };
  });
}

export type EditorStore = ReturnType<typeof createEditorStore>;

export const EditorContext = createContext<EditorStore | null>(null);

export function useEditor<T>(selector: (state: EditorState) => T): T {
  const store = useContext(EditorContext);
  if (!store) throw new Error("useEditor must be used inside the editor");
  return useStore(store, selector);
}

export function useEditorStore(): EditorStore {
  const store = useContext(EditorContext);
  if (!store) throw new Error("useEditorStore must be used inside the editor");
  return store;
}
