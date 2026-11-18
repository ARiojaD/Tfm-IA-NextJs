import Image from "next/image";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { TopicImage } from "@/domain/value-objects/TopicImage";

// Las keys usan la posición: un administrador puede escribir dos párrafos o etiquetas iguales.
// El relato del tema junto a su ficha de datos, equilibrados uno al lado del otro; la imagen va después de
// ambos y cierra la introducción. Una imagen apaisada (el cuadro de una batalla) ocupa todo el ancho; una
// vertical (un busto) se centra con un ancho contenido, para que no domine la página.
export function TopicIntroduction({ topic }: { topic: HistoricalTopic }) {
  const { introduction, keyFacts, image } = topic;

  return (
    <div className="space-y-12">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5 text-lg leading-8">
          {introduction.map((paragraph, index) => (
            <p key={index} id={`introduccion-${index}`} className="scroll-mt-8 rounded-lg target:bg-accent-soft">
              {paragraph}
            </p>
          ))}
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-4 font-serif text-xl font-semibold">Datos clave</h3>
          <dl className="space-y-4">
            {keyFacts.map((fact, index) => (
              <div key={`${index}-${fact.label}`} id={`dato-clave-${index}`} className="scroll-mt-8 rounded-lg target:bg-accent-soft">
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
          // El pedestal de un busto añade altura sin aportar nada: se recorta por abajo.
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
