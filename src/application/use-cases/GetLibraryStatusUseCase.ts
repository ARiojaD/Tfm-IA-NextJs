import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { AuthService } from "../ports/AuthService";
import type { LibraryRepository } from "../ports/LibraryRepository";

export interface LibraryStatus {
  followedEras: HistoricalEra[];
  savedTopicIds: EntityId[];
}

// Lo que necesitan las páginas de civilización y de tema para pintar sus botones como "Siguiendo" o
// "Guardado". Sin sesión devuelve null: las páginas muestran los mismos botones, que llevan al inicio de
// sesión.
export class GetLibraryStatusUseCase {
  constructor(private readonly dependencies: { library: LibraryRepository; auth: AuthService }) {}

  async execute(): Promise<LibraryStatus | null> {
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) return null;

    const [followedEras, savedTopicIds] = await Promise.all([
      this.dependencies.library.listFollowedEras(user.id),
      this.dependencies.library.listSavedTopicIds(user.id),
    ]);
    return { followedEras, savedTopicIds };
  }
}
