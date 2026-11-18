import type { Recommendation } from "@/domain/entities/Recommendation";
import { RECOMMENDATION_TYPES } from "@/domain/value-objects/RecommendationType";
import { RECOMMENDATION_TYPE_LABELS } from "@/lib/recommendationTypeLabels";

// Recibe las recomendaciones ya ordenadas por GetTopicDetailUseCase; las agrupa por tipo para mostrarlas.
export function RecommendationList({ recommendations }: { recommendations: Recommendation[] }) {
  const groups = RECOMMENDATION_TYPES.map((type) => ({
    type,
    items: recommendations.filter((recommendation) => recommendation.type === type),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return <p className="text-muted">Todavía no hay recomendaciones para este tema.</p>;
  }

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.type} aria-labelledby={`recomendaciones-${group.type}`}>
          <h3 id={`recomendaciones-${group.type}`} className="mb-4 font-serif text-2xl font-semibold">
            {RECOMMENDATION_TYPE_LABELS[group.type]}
          </h3>
          <ul className="grid gap-4 md:grid-cols-2">
            {group.items.map((recommendation) => (
              <li key={recommendation.id} className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
                {/* Placeholder cover until real covers exist. */}
                <span
                  className="flex h-20 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-dawn-from to-dawn-to font-serif text-2xl font-semibold text-foreground/70"
                  aria-hidden="true"
                >
                  {recommendation.title.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="font-serif text-lg font-semibold leading-snug">{recommendation.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {recommendation.creator} · {recommendation.year}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{recommendation.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
