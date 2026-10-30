import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { AuthService } from "../ports/AuthService";
import type { LibraryRepository } from "../ports/LibraryRepository";

export interface LibraryStatus {
  followedEras: HistoricalEra[];
  savedTopicIds: EntityId[];
}

// What the civilization and topic pages need to draw their buttons as "Siguiendo" / "Guardado".
// null without a session: the pages then show the same buttons, leading to the sign-in page.
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
