import { useId } from "react";

// La greca (el meandro griego), el adorno de los frisos y los mosaicos antiguos, como separador. Es un
// patrón SVG que hereda el color del texto (`currentColor`), así que se tiñe con una clase de Tailwind y
// funciona en claro y en oscuro. Es decorativo: los lectores de pantalla lo ignoran.
export function Greca({ className = "text-accent/40" }: { className?: string }) {
  const patternId = useId();

  return (
    <svg className={`block h-3 w-full ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern id={patternId} width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 11 H10 V1 H17 V7 H13 V4 M17 11 H24" fill="none" stroke="currentColor" strokeWidth="1.25" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill={`url(#${patternId})`} />
    </svg>
  );
}
