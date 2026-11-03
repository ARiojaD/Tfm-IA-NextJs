import type { Metadata } from "next";
import { IntroductionForm } from "@/components/admin/IntroductionForm";
import { KeyFactsForm } from "@/components/admin/KeyFactsForm";
import { TopicBasicsForm } from "@/components/admin/TopicBasicsForm";
import { TopicStatusPanel } from "@/components/admin/TopicStatusPanel";
import { getContainer } from "@/composition/container";
import { topicPath } from "@/lib/routes";
import { toTopicBasicsValues } from "@/lib/topicBasicsValues";
import { AdminPageLayout, AdminSection } from "../../AdminPageLayout";
import { adminPageMetadata, denyAdminPage } from "../../adminPageAccess";
import {
  changeTopicStatus,
  deleteTopic,
  updateTopicBasics,
  updateTopicIntroduction,
  updateTopicKeyFacts,
} from "../actions";

export function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("Editar tema");
}

// The topic editor: its state on top, then one section per part of the topic, each saved on its own.
// The forms are keyed by the saved data, so after a save they start again from what is stored.
export default async function EditTopicPage({ params }: PageProps<"/admin/temas/[id]">) {
  const { id } = await params;
  const result = await getContainer().getTopicForEditing.execute(id);
  if (!result.success) {
    denyAdminPage(result.error, `/admin/temas/${id}`);
  }
  const topic = result.data;

  return (
    <AdminPageLayout title={topic.title} intro={<span className="font-mono text-sm">{topicPath(topic)}</span>}>
      <TopicStatusPanel
        topicId={topic.id}
        status={topic.status}
        previewHref={`/admin/temas/${topic.id}/vista-previa`}
        publicHref={topicPath(topic)}
        changeStatus={changeTopicStatus}
        deleteTopic={deleteTopic}
      />

      <AdminSection title="Datos básicos" description="La dirección (URL) del tema no cambia aunque cambies el título.">
        <TopicBasicsForm
          key={JSON.stringify(toTopicBasicsValues(topic))}
          action={updateTopicBasics}
          initialValues={toTopicBasicsValues(topic)}
          topicId={topic.id}
          submitLabel="Guardar"
        />
      </AdminSection>

      <AdminSection title="Introducción" description="El texto principal del tema. Es también lo que consultará la IA.">
        <IntroductionForm action={updateTopicIntroduction} topicId={topic.id} paragraphs={topic.introduction} />
      </AdminSection>

      <AdminSection title="Datos clave" description="La ficha que acompaña a la introducción: etiqueta y valor.">
        <KeyFactsForm action={updateTopicKeyFacts} topicId={topic.id} keyFacts={topic.keyFacts} />
      </AdminSection>
    </AdminPageLayout>
  );
}
