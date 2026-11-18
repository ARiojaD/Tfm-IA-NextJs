import { updateEraFollow } from "@/app/mi-biblioteca/actions";
import type { LibraryStatus } from "@/application/use-cases/GetLibraryStatusUseCase";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { ERA_LABELS } from "@/lib/eraLabels";
import { eraPath } from "@/lib/routes";
import { LibraryToggle } from "./LibraryToggle";
import { SignInToSave } from "./SignInToSave";

// «Seguir Roma»: todos los temas de la civilización, también los que se añadan después, en «Mi biblioteca».
// `status` es null sin sesión.
export function FollowEraButton({ era, status }: { era: HistoricalEra; status: LibraryStatus | null }) {
  if (!status) {
    return (
      <SignInToSave
        label={`Seguir ${ERA_LABELS[era]}`}
        hint={`Con una cuenta tendrás todos los temas de ${ERA_LABELS[era]} en tu biblioteca.`}
        returnTo={eraPath(era)}
      />
    );
  }

  return (
    <LibraryToggle
      action={updateEraFollow}
      fields={{ era }}
      active={status.followedEras.includes(era)}
      activeIntent="follow"
      inactiveIntent="unfollow"
      activeLabel={`✓ Siguiendo ${ERA_LABELS[era]}`}
      inactiveLabel={`Seguir ${ERA_LABELS[era]}`}
      activeTitle="Dejar de seguir"
    />
  );
}
