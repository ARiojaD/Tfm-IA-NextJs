import type { Metadata } from "next";
import { TopicBasicsForm } from "@/components/admin/TopicBasicsForm";
import { getContainer } from "@/composition/container";
import { HistoricalEraSchema } from "@/domain/value-objects/HistoricalEra";
import { emptyTopicBasicsValues } from "@/lib/topicBasicsValues";
import { AdminPageLayout, AdminSection } from "../../AdminPageLayout";
import { adminPageMetadata, denyAdminPage } from "../../adminPageAccess";
import { createTopic } from "../actions";

export function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("Nuevo tema");
}

// Primer paso de un tema nuevo: sus datos básicos. Se guarda como borrador y se abre el editor para el resto.
export default async function NewTopicPage({ searchParams }: PageProps<"/admin/temas/nuevo">) {
  const access = await getContainer().getAdminAccess.execute();
  if (!access.success) {
    denyAdminPage(access.error, "/admin/temas/nuevo");
  }

  // ?era=HISPANIA preselecciona la civilización («Añadir tema a Hispania»); cualquier otro valor se ignora.
  const era = HistoricalEraSchema.safeParse((await searchParams).era);

  return (
    <AdminPageLayout
      title="Nuevo tema"
      intro="Empieza por los datos básicos. Se guardará como borrador y después podrás escribir la introducción y el resto."
    >
      <AdminSection title="Datos básicos">
        <TopicBasicsForm
          action={createTopic}
          initialValues={emptyTopicBasicsValues(era.success ? era.data : "ROMAN")}
          submitLabel="Crear borrador"
        />
      </AdminSection>
    </AdminPageLayout>
  );
}
