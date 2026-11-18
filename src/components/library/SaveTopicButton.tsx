import { updateSavedTopic } from "@/app/mi-biblioteca/actions";
import type { LibraryStatus } from "@/application/use-cases/GetLibraryStatusUseCase";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { topicPath } from "@/lib/routes";
import { LibraryToggle } from "./LibraryToggle";
import { SignInToSave } from "./SignInToSave";

// «☆ Guardar»: guarda un tema en «Mi biblioteca». `status` es null sin sesión.
export function SaveTopicButton({ topic, status }: { topic: HistoricalTopic; status: LibraryStatus | null }) {
  if (!status) {
    return (
      <SignInToSave
        label="☆ Guardar"
        hint="Inicia sesión para guardar este tema en tu biblioteca."
        returnTo={topicPath(topic)}
      />
    );
  }

  return (
    <LibraryToggle
      action={updateSavedTopic}
      fields={{ topicSlug: topic.slug }}
      active={status.savedTopicIds.includes(topic.id)}
      activeIntent="save"
      inactiveIntent="remove"
      activeLabel="★ Guardado"
      inactiveLabel="☆ Guardar"
      activeTitle="Quitar de mi biblioteca"
    />
  );
}
