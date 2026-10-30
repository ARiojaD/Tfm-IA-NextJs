import Link from "next/link";

// What anonymous visitors see instead of the "Seguir" / "Guardar" buttons: the same button, leading to the
// sign-in page and back here, with a line on what an account gives them.
export function SignInToSave({ label, hint, returnTo }: { label: string; hint: string; returnTo: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={`/iniciar-sesion?volver=${encodeURIComponent(returnTo)}`}
        className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
      >
        {label}
      </Link>
      <p className="text-sm text-muted">{hint}</p>
    </div>
  );
}
