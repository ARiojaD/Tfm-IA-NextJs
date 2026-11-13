import Image from "next/image";
import Link from "next/link";
import { eraDotClass } from "@/components/EraBadge";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { ERA_IMAGES } from "@/lib/eraImages";
import { ERA_DESCRIPTIONS, ERA_LABELS } from "@/lib/eraLabels";
import { eraPath, eraTimelinePath } from "@/lib/routes";

// La tarjeta de una civilización en la portada: su imagen, su descripción, cuántos temas tiene y dos
// entradas, sus temas y su cronología. El título es el enlace principal y se estira a toda la tarjeta
// (`after:inset-0`); el de la cronología queda por encima, porque dos enlaces no pueden ir uno dentro de otro.
export function CivilizationCard({ era, totalTopics }: { era: HistoricalEra; totalTopics: number }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-foreground/30">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={ERA_IMAGES[era].src}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" aria-hidden="true" />
        <span className={`absolute inset-x-0 top-0 h-1.5 ${eraDotClass(era)}`} aria-hidden="true" />
      </div>

      <div className="flex flex-1 flex-col p-6 pt-3">
        <h3 className="font-serif text-3xl font-semibold">
          <Link href={eraPath(era)} className="after:absolute after:inset-0">
            {ERA_LABELS[era]}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted">{ERA_DESCRIPTIONS[era]}</p>
        <p className="mt-5 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">
            {totalTopics > 0 ? `${totalTopics} ${totalTopics === 1 ? "tema" : "temas"}` : "Próximamente"}
          </span>
          <Link href={eraTimelinePath(era)} className="relative z-10 font-medium text-accent hover:underline">
            Cronología <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </article>
  );
}
