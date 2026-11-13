export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 font-display text-sm font-medium uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      <h2 className="font-serif text-4xl font-semibold tracking-tight">{title}</h2>
      {text && <p className="mt-4 leading-7 text-muted">{text}</p>}
    </div>
  );
}
