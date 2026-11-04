import { toTopicImage } from "@/domain/entities/CatalogImage";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { failure, type Result } from "@/shared/Result";
import { UpdateTopicImageInputSchema } from "../dto/TopicEditorInputs";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import type { ImageCatalog } from "../ports/ImageCatalog";
import { loadTopicToEdit, saveValidTopic, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// The topic's image, chosen from the catalog (or none). Nothing is uploaded: an id that is not in the
// catalog is rejected, so only images with a checked licence ever reach a page.
export class UpdateTopicImageUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies & { images: ImageCatalog }) {}

  async execute(input: unknown): Promise<Result<HistoricalTopic, TopicEditingError>> {
    const loaded = await loadTopicToEdit(this.dependencies, UpdateTopicImageInputSchema, input);
    if (!loaded.success) return loaded;

    const { topic, data } = loaded.data;
    const { topicEditor, images } = this.dependencies;
    if (data.imageId === "") {
      return saveValidTopic(topicEditor, { ...topic, image: undefined });
    }

    const image = await images.findById(data.imageId);
    if (!image) {
      return failure(new InvalidTopicError({ imageId: ["Elige una imagen del catálogo"] }));
    }
    return saveValidTopic(topicEditor, { ...topic, image: toTopicImage(image, { alt: data.alt, caption: data.caption }) });
  }
}
