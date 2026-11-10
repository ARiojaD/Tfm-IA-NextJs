const SOURCES = [
  { id: 1, kind: "Introducción", label: "Guerras Médicas" },
  { id: 2, kind: "Cronología", label: "Batalla de Maratón (490 a.C.)" },
];

export function RagPreview() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-8">
      <p className="mb-6 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
        Ejemplo ilustrativo
      </p>

      <div className="mb-6 flex justify-end">
        <p className="max-w-md rounded-2xl rounded-br-sm bg-foreground px-4 py-3 text-sm leading-6 text-background">
          ¿Por qué fue tan importante Maratón para Atenas?
        </p>
      </div>

      <div className="max-w-2xl space-y-4 text-sm leading-7">
        <p>
          Maratón fue la primera gran victoria de los hoplitas atenienses frente
          a un ejército persa en campo abierto
          <sup className="ml-0.5 font-medium text-accent">[1]</sup>. Reforzó el prestigio de la
          joven democracia y del propio Milcíades, y demostró que los persas no eran invencibles
          <sup className="ml-0.5 font-medium text-accent">[2]</sup>.
        </p>

        <ul className="space-y-2 border-t border-border pt-4">
          {SOURCES.map((source) => (
            <li key={source.id} className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted">
              <span className="font-medium text-accent">[{source.id}]</span>
              <span className="font-medium text-foreground">{source.kind}</span>
              <span>· {source.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
