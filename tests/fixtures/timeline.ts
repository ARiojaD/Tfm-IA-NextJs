import type { TimelineMilestone } from "@/domain/entities/TimelineMilestone";

export function aMilestone(overrides: Partial<TimelineMilestone> = {}): TimelineMilestone {
  return {
    id: "milestone-1",
    era: "ROMAN",
    date: { year: -264 },
    title: "Hito de prueba",
    description: "Descripción del hito de prueba.",
    ...overrides,
  };
}
