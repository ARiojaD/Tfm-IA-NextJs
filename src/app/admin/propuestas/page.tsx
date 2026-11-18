import type { Metadata } from "next";
import { ProposalDetails } from "@/components/proposals/ProposalDetails";
import { ReviewProposalForm } from "@/components/proposals/ReviewProposalForm";
import { getContainer } from "@/composition/container";
import type { Proposal } from "@/domain/entities/Proposal";
import { AdminPageLayout } from "../AdminPageLayout";
import { adminPageMetadata, denyAdminPage } from "../adminPageAccess";
import { reviewProposal } from "./actions";

export function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("Propuestas");
}

// Qué hace aprobar, para que el administrador lo sepa antes de pulsar.
const APPROVE_LABELS: Record<Proposal["kind"], string> = {
  EVENT: "Aprobar y añadir a la cronología",
  RECOMMENDATION: "Aprobar y añadir al tema",
  CORRECTION: "Marcar como resuelta",
  NEW_TOPIC: "Aprobar y crear borrador",
};

// La bandeja: las propuestas pendientes de los usuarios, de la más antigua a la más reciente. El caso de uso comprueba el rol ADMIN por su cuenta.
export default async function ProposalsInboxPage() {
  const result = await getContainer().listPendingProposals.execute();
  if (!result.success) {
    denyAdminPage(result.error, "/admin/propuestas");
  }

  return (
    <AdminPageLayout
      title="Propuestas"
      intro="Las propuestas de los usuarios, de la más antigua a la más reciente. Aprobar un evento o una recomendación lo añade al tema; un tema nuevo se crea como borrador para completarlo; una corrección la aplicas tú en el editor."
    >
      {result.data.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted">No hay propuestas pendientes.</p>
      ) : (
        <ul className="space-y-6">
          {result.data.map((proposal) => (
            <li key={proposal.id} className="space-y-5 rounded-3xl border border-border bg-surface p-6">
              <ProposalDetails proposal={proposal} showAuthor />
              <ReviewProposalForm action={reviewProposal} proposalId={proposal.id} approveLabel={APPROVE_LABELS[proposal.kind]} />
            </li>
          ))}
        </ul>
      )}
    </AdminPageLayout>
  );
}
