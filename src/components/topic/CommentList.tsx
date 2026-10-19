import type { Comment } from "@/domain/entities/Comment";
import { formatCommentDate } from "@/lib/formatCommentDate";

export function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div>
      {comments.length === 0 ? (
        <p className="text-muted">Todavía no hay comentarios. ¡Sé el primero!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-serif text-lg font-semibold text-accent"
                aria-hidden="true"
              >
                {comment.author.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-medium">{comment.author}</span>
                  <time dateTime={comment.createdAt.toISOString()} className="text-xs text-muted">
                    {formatCommentDate(comment.createdAt)}
                  </time>
                </p>
                {/* Rendered as text: React escapes any HTML a visitor writes. */}
                <p className="mt-1 break-words text-sm leading-6">{comment.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
