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

// The "Mi biblioteca" page: every topic of each followed civilization (read at request time, so topics
// added later appear on their own) and the topics saved one by one.
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

    // Civilizations in the fixed order of the home page; their topics in time order.
    const followedEras = await Promise.all(
      HISTORICAL_ERAS.filter((era) => followed.includes(era)).map(async (era) => ({
        era,
        topics: (await topics.listByEra(era)).toSorted(compareTopicsChronologically),
      })),
    );

    // findByIds does not keep the order: put the topics back in saved order, skipping deleted ones.
    const topicsById = new Map((await topics.findByIds(savedTopicIds)).map((topic) => [topic.id, topic]));
    const savedTopics = savedTopicIds.flatMap((id) => topicsById.get(id) ?? []);

    return success({ followedEras, savedTopics });
  }
}
