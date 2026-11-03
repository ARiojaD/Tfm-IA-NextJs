import type { TopicStatus } from "@/domain/value-objects/TopicStatus";

export function TopicStatusBadge({ status }: { status: TopicStatus }) {
  return status === "PUBLISHED" ? (
    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">Publicado</span>
  ) : (
    <span className="rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs font-medium text-muted">
      Borrador
    </span>
  );
}
