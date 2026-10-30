import type { LibraryRepository } from "@/application/ports/LibraryRepository";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

interface StoredLibrary {
  followedEras: Set<HistoricalEra>;
  savedTopics: Map<EntityId, Date>;
}

// Each user's library lives only in this process: it is lost when the server restarts.
export class InMemoryLibraryRepository implements LibraryRepository {
  private readonly libraries = new Map<EntityId, StoredLibrary>();

  followEra(userId: EntityId, era: HistoricalEra): Promise<void> {
    this.libraryOf(userId).followedEras.add(era);
    return Promise.resolve();
  }

  unfollowEra(userId: EntityId, era: HistoricalEra): Promise<void> {
    this.libraryOf(userId).followedEras.delete(era);
    return Promise.resolve();
  }

  listFollowedEras(userId: EntityId): Promise<HistoricalEra[]> {
    return Promise.resolve([...this.libraryOf(userId).followedEras]);
  }

  saveTopic(userId: EntityId, topicId: EntityId, savedAt: Date): Promise<void> {
    const { savedTopics } = this.libraryOf(userId);
    if (!savedTopics.has(topicId)) {
      savedTopics.set(topicId, new Date(savedAt));
    }
    return Promise.resolve();
  }

  removeSavedTopic(userId: EntityId, topicId: EntityId): Promise<void> {
    this.libraryOf(userId).savedTopics.delete(topicId);
    return Promise.resolve();
  }

  listSavedTopicIds(userId: EntityId): Promise<EntityId[]> {
    const saved = [...this.libraryOf(userId).savedTopics].toSorted(
      ([, a], [, b]) => b.getTime() - a.getTime(),
    );
    return Promise.resolve(saved.map(([topicId]) => topicId));
  }

  private libraryOf(userId: EntityId): StoredLibrary {
    let library = this.libraries.get(userId);
    if (!library) {
      library = { followedEras: new Set(), savedTopics: new Map() };
      this.libraries.set(userId, library);
    }
    return library;
  }
}
