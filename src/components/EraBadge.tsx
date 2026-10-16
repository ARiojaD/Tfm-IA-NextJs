import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { ERA_LABELS } from "@/lib/sampleEvents";

const ERA_STYLES: Record<HistoricalEra, { text: string; dot: string }> = {
  ANCIENT_GREECE: { text: "text-era-greece", dot: "bg-era-greece" },
  ROMAN: { text: "text-era-rome", dot: "bg-era-rome" },
  HISPANIA: { text: "text-era-hispania", dot: "bg-era-hispania" },
};

export function eraDotClass(era: HistoricalEra): string {
  return ERA_STYLES[era].dot;
}

export function EraBadge({ era }: { era: HistoricalEra }) {
  const styles = ERA_STYLES[era];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium ${styles.text}`}
    >
      <span className={`size-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
      {ERA_LABELS[era]}
    </span>
  );
}
