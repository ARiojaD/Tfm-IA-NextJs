import { compareTopicsChronologically, type HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { HISTORICAL_ERAS, type HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { failure, success, type Result } from "@/shared/Result";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import type { AuthService } from "../ports/AuthService";
import type { LibraryRepository } from "../ports/LibraryRepository";
import type { TopicRepository } from "../ports/TopicRepository";

export interface FollowedEra {
  era: HistoricalEra;
  topics: HistoricalTopic[];
}

export interface MyLibrary {
  followedEras: FollowedEra[];
  savedTopics: HistoricalTopic[];
}

export interface GetMyLibraryDependencies {
  topics: TopicRepository;
  library: LibraryRepository;
  auth: AuthService;
}

// La página "Mi biblioteca": todos los temas de cada civilización que se sigue (se leen en cada petición,
// así que los temas que se añadan después aparecen solos) y los temas guardados uno a uno.
export class GetMyLibraryUseCase {
  constructor(private readonly dependencies: GetMyLibraryDependencies) {}

  async execute(): Promise<Result<MyLibrary, AuthenticationRequiredError>> {
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("ver tu biblioteca"));
    }

    const { topics, library } = this.dependencies;
    const [followed, savedTopicIds] = await Promise.all([
      library.listFollowedEras(user.id),
      library.listSavedTopicIds(user.id),
    ]);

    // Las civilizaciones en el orden fijo de la portada; sus temas, en orden cronológico.
    const followedEras = await Promise.all(
      HISTORICAL_ERAS.filter((era) => followed.includes(era)).map(async (era) => ({
        era,
        topics: (await topics.listByEra(era)).toSorted(compareTopicsChronologically),
      })),
    );

    // `findByIds` no conserva el orden: los temas se recolocan en el orden en que se guardaron, saltando
    // los que se hayan borrado.
    const topicsById = new Map((await topics.findByIds(savedTopicIds)).map((topic) => [topic.id, topic]));
    const savedTopics = savedTopicIds.flatMap((id) => topicsById.get(id) ?? []);

    return success({ followedEras, savedTopics });
  }
}
