import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TopicView } from "@/components/topic/TopicView";
import { getContainer } from "@/composition/container";
import { adminPageMetadata, denyAdminPage } from "../../../adminPageAccess";

export function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("Vista previa");
}

// A topic exactly as its public page shows it (same TopicView), drafts included. Only the interactive
// parts are placeholders: the quiz is played and comments are written on the published page.
export default async function TopicPreviewPage({ params }: PageProps<"/admin/temas/[id]/vista-previa">) {
  const { id } = await params;
  const result = await getContainer().getTopicPreview.execute(id);
  if (!result.success) {
    denyAdminPage(result.error, `/admin/temas/${id}/vista-previa`);
  }
  const detail = result.data;
  const questions = detail.quiz?.questions.length ?? 0;

  return (
    <>
      <SiteHeader />
      <TopicView
        detail={detail}
        notice={
          <div role="status" className="border-b border-border bg-accent-soft">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm sm:px-6">
              <p>
                <strong>Vista previa{detail.topic.status === "DRAFT" ? " · Borrador" : ""}.</strong> Así se verá el tema
                {detail.topic.status === "DRAFT" ? " cuando lo publiques" : " en la web"}.
              </p>
              <Link href={`/admin/temas/${detail.topic.id}`} className="font-medium text-accent hover:underline">
                ← Volver al editor
              </Link>
            </div>
          </div>
        }
        quiz={
          <p className="text-muted">
            {questions > 0
              ? `El quiz tiene ${questions} ${questions === 1 ? "pregunta" : "preguntas"}: se juega en la página publicada.`
              : "Este tema todavía no tiene quiz."}
          </p>
        }
        commentForm={<p className="text-sm text-muted">Los comentarios se escriben en la página publicada.</p>}
      />
      <SiteFooter />
    </>
  );
}
