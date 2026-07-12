"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MigrationState,
  ComponentStatus,
  MigrationMode,
  Phase,
  PHASES,
} from "./schema";
import { COMPONENTS } from "./data/components";

interface Store extends MigrationState {
  setMode: (mode: MigrationMode) => void;
  setTenantLabel: (which: "sourceLabel" | "destinationLabel", value: string) => void;
  setComponentStatus: (componentId: string, status: ComponentStatus) => void;
  setBlocker: (componentId: string, blocker: string) => void;
  toggleStep: (componentId: string, stepId: string) => void;
  setPhaseStatus: (phase: Phase, status: ComponentStatus) => void;
  toggleAssessment: (id: string) => void;
  togglePrerequisite: (id: string) => void;
  reset: () => void;
  overallProgress: () => number;
  componentProgress: (componentId: string) => number;
}

function emptyState(): MigrationState {
  const phases = {} as MigrationState["phases"];
  PHASES.forEach((p) => (phases[p] = { status: "not_started" }));
  return {
    version: 1,
    tenants: { sourceLabel: "Tenant B (Source)", destinationLabel: "Tenant A (Destination)" },
    mode: undefined,
    components: {},
    phases,
    assessment: {},
    prerequisites: {},
    updatedAt: new Date().toISOString(),
  };
}

const now = () => new Date().toISOString();

export const useMigrationStore = create<Store>()(
  persist(
    (set, get) => ({
      ...emptyState(),

      setMode: (mode) => set({ mode, updatedAt: now() }),

      setTenantLabel: (which, value) =>
        set((s) => ({ tenants: { ...s.tenants, [which]: value }, updatedAt: now() })),

      setComponentStatus: (componentId, status) =>
        set((s) => ({
          components: {
            ...s.components,
            [componentId]: {
              ...(s.components[componentId] ?? { steps: {} }),
              status,
            },
          },
          updatedAt: now(),
        })),

      setBlocker: (componentId, blocker) =>
        set((s) => ({
          components: {
            ...s.components,
            [componentId]: {
              ...(s.components[componentId] ?? { status: "blocked", steps: {} }),
              status: blocker ? "blocked" : "in_progress",
              blocker,
            },
          },
          updatedAt: now(),
        })),

      toggleStep: (componentId, stepId) =>
        set((s) => {
          const comp = s.components[componentId] ?? { status: "not_started" as ComponentStatus, steps: {} };
          const current = comp.steps[stepId]?.done ?? false;
          const steps = { ...comp.steps, [stepId]: { done: !current, at: !current ? now() : undefined } };
          const def = COMPONENTS.find((c) => c.id === componentId);
          const total = def ? def.exportSteps.length + def.importSteps.length + def.validationSteps.length : 0;
          const done = Object.values(steps).filter((x) => x.done).length;
          let status: ComponentStatus = comp.status;
          if (total > 0 && done === total) status = "completed";
          else if (done > 0) status = "in_progress";
          else if (status !== "blocked") status = "not_started";
          return {
            components: { ...s.components, [componentId]: { ...comp, steps, status } },
            updatedAt: now(),
          };
        }),

      setPhaseStatus: (phase, status) =>
        set((s) => ({
          phases: {
            ...s.phases,
            [phase]: {
              status,
              startedAt: status === "in_progress" ? s.phases[phase].startedAt ?? now() : s.phases[phase].startedAt,
              completedAt: status === "completed" ? now() : s.phases[phase].completedAt,
            },
          },
          updatedAt: now(),
        })),

      toggleAssessment: (id) =>
        set((s) => ({ assessment: { ...s.assessment, [id]: !s.assessment[id] }, updatedAt: now() })),

      togglePrerequisite: (id) =>
        set((s) => ({ prerequisites: { ...s.prerequisites, [id]: !s.prerequisites[id] }, updatedAt: now() })),

      reset: () => set({ ...emptyState() }),

      componentProgress: (componentId) => {
        const def = COMPONENTS.find((c) => c.id === componentId);
        if (!def) return 0;
        const total = def.exportSteps.length + def.importSteps.length + def.validationSteps.length;
        if (total === 0) return 0;
        const comp = get().components[componentId];
        if (!comp) return 0;
        const done = Object.values(comp.steps).filter((x) => x.done).length;
        return Math.round((done / total) * 100);
      },

      overallProgress: () => {
        const comps = COMPONENTS;
        if (comps.length === 0) return 0;
        const sum = comps.reduce((acc, c) => acc + get().componentProgress(c.id), 0);
        return Math.round(sum / comps.length);
      },
    }),
    {
      name: "sma-migration-state",
      version: 1,
    }
  )
);
