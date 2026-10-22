import Link from "next/link";
import { eraDotClass } from "@/components/EraBadge";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { ERA_DESCRIPTIONS, ERA_LABELS } from "@/lib/eraLabels";
import { eraPath } from "@/lib/routes";

export function CivilizationCard({ era, totalTopics }: { era: HistoricalEra; totalTopics: number }) {
  const hasTopics = totalTopics > 0;

  return (
    <Link
      href={eraPath(era)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 pt-8 transition-colors hover:border-foreground/30"
    >
      <span className={`absolute inset-x-0 top-0 h-1.5 ${eraDotClass(era)}`} aria-hidden="true" />
      <h3 className="font-serif text-3xl font-semibold">{ERA_LABELS[era]}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted">{ERA_DESCRIPTIONS[era]}</p>
      <p className="mt-5 flex items-center justify-between text-sm">
        <span className="text-muted">
          {hasTopics ? `${totalTopics} ${totalTopics === 1 ? "tema" : "temas"}` : "Próximamente"}
        </span>
        <span className="font-medium text-accent">
          Explorar <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </p>
    </Link>
  );
}
