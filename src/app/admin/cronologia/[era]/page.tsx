import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MilestonesForm } from "@/components/admin/MilestonesForm";
import { getContainer } from "@/composition/container";
import { ERA_LABELS } from "@/lib/eraLabels";
import { eraFromRouteSlug, eraTimelinePath } from "@/lib/routes";
import { AdminPageLayout, AdminSection } from "../../AdminPageLayout";
import { adminPageMetadata, denyAdminPage } from "../../adminPageAccess";
import { updateEraMilestones } from "../actions";

export function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("Editar cronología");
}

// El editor de la cronología completa de una civilización (/admin/cronologia/roma). El caso de uso
// comprueba el rol ADMIN; una civilización desconocida es un 404, igual que en la parte pública.
export default async function EditEraTimelinePage({ params }: PageProps<"/admin/cronologia/[era]">) {
  const { era: eraSlug } = await params;
  const era = eraFromRouteSlug(eraSlug);
  if (!era) {
    notFound();
  }

  const result = await getContainer().getEraTimelineForEditing.execute(era);
  if (!result.success) {
    denyAdminPage(result.error, `/admin/cronologia/${eraSlug}`);
  }
  const { milestones, topicOptions } = result.data;

  return (
    <AdminPageLayout
      title={`Cronología de ${ERA_LABELS[era]}`}
      intro={
        <Link href={eraTimelinePath(era)} className="text-sm font-medium text-accent hover:underline">
          Ver la cronología pública <span aria-hidden="true">→</span>
        </Link>
      }
    >
      <AdminSection
        title="Hitos"
        description="Los momentos clave de la civilización. Las etapas no se escriben aquí: salen solas de los temas de la categoría Etapas."
      >
        <MilestonesForm
          action={updateEraMilestones}
          era={era}
          milestones={milestones}
          topicOptions={topicOptions}
        />
      </AdminSection>
    </AdminPageLayout>
  );
}
