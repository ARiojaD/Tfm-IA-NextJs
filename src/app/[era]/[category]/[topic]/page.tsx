import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SaveTopicButton } from "@/components/library/SaveTopicButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CommentForm } from "@/components/topic/CommentForm";
import { QuizGame } from "@/components/topic/QuizGame";
import { SignInToComment } from "@/components/topic/SignInToComment";
import { TopicView } from "@/components/topic/TopicView";
import { getContainer } from "@/composition/container";
import { categoryFromRouteSlug, eraFromRouteSlug, topicPath } from "@/lib/routes";
import { addComment, answerQuizQuestion } from "./actions";

// One template for every topic (/roma/personajes/julio-cesar, /grecia/guerras-y-batallas/…): only the data changes.

// cache() dedupes the lookup between generateMetadata and the page within one request.
const getTopicDetail = cache((topicSlug: string) => getContainer().getTopicDetail.execute(topicSlug));

// The topic must exist, be published and match the era and category in the URL:
// /grecia/personajes/julio-cesar and /roma/guerras-y-batallas/julio-cesar are 404s.
async function loadTopic(params: PageProps<"/[era]/[category]/[topic]">["params"]) {
  const { era, category, topic } = await params;
  const result = await getTopicDetail(topic);

  if (
    !result.success ||
    eraFromRouteSlug(era) !== result.data.topic.era ||
    categoryFromRouteSlug(category) !== result.data.topic.category
  ) {
    return null;
  }
  return result.data;
}

export async function generateMetadata({ params }: PageProps<"/[era]/[category]/[topic]">): Promise<Metadata> {
  const detail = await loadTopic(params);

  return detail
    ? { title: `${detail.topic.title} · MemnonHistory AI`, description: detail.topic.summary }
    : { title: "Tema no encontrado · MemnonHistory AI" };
}

export default async function TopicPage({ params }: PageProps<"/[era]/[category]/[topic]">) {
  const detail = await loadTopic(params);
  if (!detail) {
    notFound();
  }

  const { topic, quiz } = detail;
  const container = getContainer();
  const [currentUser, libraryStatus] = await Promise.all([
    container.getCurrentUser.execute(),
    container.getLibraryStatus.execute(),
  ]);

  return (
    <>
      <SiteHeader />
      <TopicView
        detail={detail}
        actions={<SaveTopicButton topic={topic} status={libraryStatus} />}
        quiz={
          quiz ? (
            <QuizGame quiz={quiz} topicSlug={topic.slug} answerQuestion={answerQuizQuestion} />
          ) : (
            <p className="text-muted">Este tema todavía no tiene quiz.</p>
          )
        }
        commentForm={
          currentUser ? (
            <CommentForm topicSlug={topic.slug} authorName={currentUser.name} action={addComment} />
          ) : (
            <SignInToComment returnTo={topicPath(topic)} />
          )
        }
      />
      <SiteFooter />
    </>
  );
}
