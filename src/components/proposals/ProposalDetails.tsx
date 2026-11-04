import type { Proposal } from "@/domain/entities/Proposal";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_LABELS } from "@/lib/eraLabels";
import { formatHistoricalDate } from "@/lib/formatHistoricalDate";
import { formatHistoricalPeriod } from "@/lib/formatHistoricalPeriod";
import { PROPOSAL_KIND_LABELS, PROPOSAL_STATUS_LABELS } from "@/lib/proposalLabels";
import { RECOMMENDATION_TYPE_SINGULAR_LABELS } from "@/lib/recommendationTypeLabels";

const STATUS_CLASSES: Record<Proposal["status"], string> = {
  PENDING: "border border-dashed border-border text-muted",
  APPROVED: "bg-success-soft text-success",
  REJECTED: "bg-danger-soft text-danger",
};

// What a proposal says, the same for its author ("Mis propuestas") and for the admin (the inbox). All of
// it is text written by a user: React escapes it, and the source is never turned into a link.
export function ProposalDetails({ proposal, showAuthor = false }: { proposal: Proposal; showAuthor?: boolean }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{PROPOSAL_KIND_LABELS[proposal.kind]}</span>
        <span className="text-muted">·</span>
        <span className="text-muted">{proposal.kind === "NEW_TOPIC" ? ERA_LABELS[proposal.newTopic.era] : proposal.topicTitle}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[proposal.status]}`}>
          {PROPOSAL_STATUS_LABELS[proposal.status]}
        </span>
      </div>

      {proposal.kind === "EVENT" && (
        <p>
          <span className="font-medium">{proposal.event.title}</span> ({formatHistoricalDate(proposal.event.date)}).{" "}
          {proposal.event.description}
        </p>
      )}
      {proposal.kind === "RECOMMENDATION" && (
        <p>
          {RECOMMENDATION_TYPE_SINGULAR_LABELS[proposal.recommendation.type]}:{" "}
          <span className="font-medium">{proposal.recommendation.title}</span>, de {proposal.recommendation.creator} (
          {proposal.recommendation.year}). {proposal.recommendation.description}
        </p>
      )}
      {proposal.kind === "CORRECTION" && <p className="whitespace-pre-line">{proposal.message}</p>}
      {proposal.kind === "NEW_TOPIC" && (
        <div className="space-y-1">
          <p>
            <span className="font-medium">{proposal.newTopic.title}</span> · {CATEGORY_LABELS[proposal.newTopic.category]} ·{" "}
            {formatHistoricalPeriod(proposal.newTopic.period)}
          </p>
          <p className="text-muted">{proposal.newTopic.summary}</p>
          <p className="whitespace-pre-line">{proposal.newTopic.description}</p>
        </div>
      )}

      <p className="text-xs text-muted">
        Fuente: {proposal.source}
        {showAuthor && <> · Propuesta por {proposal.authorName}</>} · {proposal.createdAt.toLocaleDateString("es-ES")}
      </p>
      {proposal.reviewNote && (
        <p className="rounded-xl bg-surface px-3 py-2 text-xs">
          <span className="font-medium">Respuesta:</span> {proposal.reviewNote}
        </p>
      )}
    </div>
  );
}
