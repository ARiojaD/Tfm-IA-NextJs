import Image from "next/image";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { TopicImage } from "@/domain/value-objects/TopicImage";

// The narrative of a topic next to its fact sheet, which stay balanced side by side; the image comes
// after both, closing the introduction. A landscape image (a painting of a battle) spans the full width;
// a portrait one (a bust) is centred at a contained width, so it does not tower over the page.
export function TopicIntroduction({ topic }: { topic: HistoricalTopic }) {
  const { introduction, keyFacts, image } = topic;

  return (
    <div className="space-y-12">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5 text-lg leading-8">
          {introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-4 font-serif text-xl font-semibold">Datos clave</h3>
          <dl className="space-y-4">
            {keyFacts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs uppercase tracking-wider text-muted">{fact.label}</dt>
                <dd className="mt-1 text-sm leading-6">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {image && <TopicFigure image={image} />}
    </div>
  );
}

function TopicFigure({ image }: { image: TopicImage }) {
  const isLandscape = image.width > image.height;

  return (
    <figure className={isLandscape ? "" : "mx-auto max-w-xs text-center"}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={isLandscape ? "(min-width: 896px) 848px, 100vw" : "20rem"}
        className={`h-auto w-full rounded-2xl border border-border bg-surface ${
          // A bust's pedestal adds height without adding anything: crop from the bottom.
          isLandscape ? "" : "max-h-[26rem] object-cover object-top"
        }`}
      />
      <figcaption className="mt-3 text-xs leading-5 text-muted">
        {image.caption}
        <span className="block opacity-70">{image.credit}</span>
      </figcaption>
    </figure>
  );
}
