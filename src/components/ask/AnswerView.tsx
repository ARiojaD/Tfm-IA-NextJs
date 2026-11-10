import Link from "next/link";
import type { AnswerSourceView, EncyclopediaAnswer } from "@/application/use-cases/AskEncyclopediaUseCase";
import { KNOWLEDGE_SOURCE_NAMES } from "@/domain/entities/KnowledgeChunk";
import { knowledgeChunkPath } from "@/lib/routes";

// The answer is rendered as React text and links built from our own data: nothing the model wrote can
// become HTML or a URL (OWASP LLM02). Citations are plain <a>, not <Link>: client-side navigation does not
// update the browser's :target, and that is what highlights the cited paragraph on arrival.
export function AnswerView({ answer }: { answer: EncyclopediaAnswer }) {
  if (answer.status === "NO_INFORMATION") {
    return <NoInformation />;
  }
  if (answer.status === "SOURCES_ONLY") {
    return (
      <div>
        <p className="text-sm leading-6 text-muted">
          El asistente no ha podido redactar una respuesta ahora mismo. Esto es lo que hemos encontrado en la enciclopedia:
        </p>
        <SourceList sources={answer.sources} />
      </div>
    );
  }

  const pathOf = (number: number) => {
    const source = answer.sources[number - 1];
    return knowledgeChunkPath(source.topic, source.chunk);
  };

  return (
    <div>
      <p className="text-base leading-8">
        {answer.parts.map((part, index) =>
          part.type === "text" ? (
            <span key={index}>{part.text}</span>
          ) : (
            <sup key={index} className="ml-0.5 font-medium">
              <a href={pathOf(part.number)} aria-label={`Fuente ${part.number}`} className="text-accent hover:underline">
                [{part.number}]
              </a>
            </sup>
          ),
        )}
      </p>
      {answer.missing && (
        <p className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-muted">
          <span className="font-medium text-foreground">No aparece en la enciclopedia: </span>
          {answer.missing}
        </p>
      )}
      <SourceList sources={answer.sources} />
      <p className="mt-4 text-xs text-muted">Respuesta redactada por IA a partir de la enciclopedia. Comprueba las fuentes.</p>
    </div>
  );
}

function SourceList({ sources }: { sources: AnswerSourceView[] }) {
  return (
    <ol aria-label="Fuentes" className="mt-6 space-y-3 border-t border-border pt-5">
      {sources.map(({ number, topic, chunk }) => (
        <li key={number} className="text-sm leading-6">
          <a href={knowledgeChunkPath(topic, chunk)} className="font-medium hover:text-accent">
            <span className="text-accent">[{number}]</span> {topic.title} · {KNOWLEDGE_SOURCE_NAMES[chunk.source]}
          </a>
          <p className="text-muted">{chunk.content}</p>
        </li>
      ))}
    </ol>
  );
}

function NoInformation() {
  return (
    <div>
      <p className="font-medium">No hay información sobre esto en MemnonHistory todavía.</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Solo respondemos con lo que está revisado en la enciclopedia. Si crees que debería estar, puedes proponerlo.
      </p>
      <Link
        href="/mi-biblioteca/propuestas?tipo=tema-nuevo"
        className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-foreground/30"
      >
        Proponer un tema nuevo
      </Link>
    </div>
  );
}
