import type { Metadata } from "next";
import { EventsForm } from "@/components/admin/EventsForm";
import { ImageForm } from "@/components/admin/ImageForm";
import { IntroductionForm } from "@/components/admin/IntroductionForm";
import { KeyFactsForm } from "@/components/admin/KeyFactsForm";
import { QuizForm } from "@/components/admin/QuizForm";
import { RecommendationsForm } from "@/components/admin/RecommendationsForm";
import { RelatedTopicsForm } from "@/components/admin/RelatedTopicsForm";
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
  updateRelatedTopics,
  updateTopicBasics,
  updateTopicEvents,
  updateTopicImage,
  updateTopicIntroduction,
  updateTopicKeyFacts,
  updateTopicQuiz,
  updateTopicRecommendations,
} from "../actions";

export function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("Editar tema");
}

// The topic editor: its state on top, then one section per part of the topic, each saved on its own.
// The basics form is keyed by the saved data, so after a save it starts again from what is stored.
export default async function EditTopicPage({ params }: PageProps<"/admin/temas/[id]">) {
  const { id } = await params;
  const result = await getContainer().getTopicForEditing.execute(id);
  if (!result.success) {
    denyAdminPage(result.error, `/admin/temas/${id}`);
  }
  const { topic, events, quiz, recommendations, otherTopics, imageOptions, selectedImageId } = result.data;

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

      <AdminSection title="Imagen" description="Opcional. Si no eliges ninguna, la página del tema no muestra imagen.">
        <ImageForm
          action={updateTopicImage}
          topicId={topic.id}
          options={imageOptions}
          selectedImageId={selectedImageId}
          currentImage={topic.image}
        />
      </AdminSection>

      <AdminSection title="Cronología" description="Los momentos clave del tema. En la página se ordenan solos por fecha.">
        <EventsForm action={updateTopicEvents} topicId={topic.id} events={events} />
      </AdminSection>

      <AdminSection title="Quiz" description="Preguntas con 2 a 4 opciones. Las respuestas correctas nunca llegan al navegador del lector.">
        <QuizForm action={updateTopicQuiz} topicId={topic.id} quiz={quiz} />
      </AdminSection>

      <AdminSection title="Recomendaciones" description="Libros, películas y series para seguir aprendiendo.">
        <RecommendationsForm action={updateTopicRecommendations} topicId={topic.id} recommendations={recommendations} />
      </AdminSection>

      <AdminSection title="Temas relacionados" description="Se enlazan en los dos sentidos: este tema también aparecerá en los que elijas.">
        <RelatedTopicsForm
          action={updateRelatedTopics}
          topicId={topic.id}
          relatedTopicIds={topic.relatedTopicIds}
          otherTopics={otherTopics}
        />
      </AdminSection>
    </AdminPageLayout>
  );
}
