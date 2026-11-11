// Zona horaria fija para que el servidor pinte la misma fecha esté donde esté.
const COMMENT_DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Madrid",
});

export function formatCommentDate(date: Date): string {
  return COMMENT_DATE_FORMAT.format(date);
}
