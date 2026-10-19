// Fixed time zone so the server renders the same date regardless of where it runs.
const COMMENT_DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Madrid",
});

export function formatCommentDate(date: Date): string {
  return COMMENT_DATE_FORMAT.format(date);
}
