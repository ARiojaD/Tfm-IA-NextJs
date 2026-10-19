"use client";

import { useActionState, useState } from "react";
import { COMMENT_AUTHOR_MAX_LENGTH, COMMENT_MESSAGE_MAX_LENGTH } from "@/domain/entities/Comment";

export interface CommentFormState {
  status: "idle" | "success" | "error";
  fieldErrors?: { author?: string[]; message?: string[] };
  formError?: string;
}

const INITIAL_STATE: CommentFormState = { status: "idle" };

// maxLength here only helps the visitor; the real validation happens on the server (AddCommentUseCase).
export function CommentForm({
  topicSlug,
  action,
}: {
  topicSlug: string;
  action: (state: CommentFormState, formData: FormData) => Promise<CommentFormState>;
}) {
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");

  const [state, formAction, isPending] = useActionState(async (previous: CommentFormState, formData: FormData) => {
    const next = await action(previous, formData);
    if (next.status === "success") {
      setMessage(""); // Keep the name: the visitor will probably comment again.
    }
    return next;
  }, INITIAL_STATE);

  const authorError = state.fieldErrors?.author?.[0];
  const messageError = state.fieldErrors?.message?.[0];

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-surface p-5" noValidate>
      <input type="hidden" name="topicSlug" value={topicSlug} />

      <div>
        <label htmlFor="comment-author" className="text-sm font-medium">
          Tu nombre
        </label>
        <input
          id="comment-author"
          name="author"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          maxLength={COMMENT_AUTHOR_MAX_LENGTH}
          autoComplete="nickname"
          aria-invalid={Boolean(authorError)}
          aria-describedby={authorError ? "comment-author-error" : undefined}
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent aria-invalid:border-danger"
        />
        {authorError && (
          <p id="comment-author-error" className="mt-1.5 text-xs text-danger">
            {authorError}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="comment-message" className="text-sm font-medium">
            Comentario
          </label>
          <span className="text-xs text-muted" aria-hidden="true">
            {message.length}/{COMMENT_MESSAGE_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="comment-message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={COMMENT_MESSAGE_MAX_LENGTH}
          rows={3}
          aria-invalid={Boolean(messageError)}
          aria-describedby={messageError ? "comment-message-error" : undefined}
          className="mt-1.5 w-full resize-y rounded-xl border border-border bg-background px-4 py-2.5 text-sm leading-6 outline-none focus:border-accent aria-invalid:border-danger"
        />
        {messageError && (
          <p id="comment-message-error" className="mt-1.5 text-xs text-danger">
            {messageError}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {isPending ? "Publicando…" : "Publicar comentario"}
        </button>
        <p aria-live="polite" className="text-sm">
          {state.status === "success" && <span className="text-success">¡Comentario publicado!</span>}
          {state.formError && <span className="text-danger">{state.formError}</span>}
        </p>
      </div>
    </form>
  );
}
