import { PASSWORD_MIN_LENGTH } from "@/domain/value-objects/Password";

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

const LABELS = ["", "Débil: demasiado repetitiva", "Aceptable", "Fuerte", "Muy fuerte"] as const;

// Una pista visual mientras se escribe, no una regla: el servidor solo exige la longitud mínima y rechaza
// las contraseñas filtradas. Lo que más pesa es la longitud (una frase larga es fuerte aunque vaya en
// minúsculas), la variedad suma un poco y unos pocos caracteres repetidos ("aaaa…") se marcan como débil.
export function estimatePasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return { score: 0, label: "" };
  if (password.length < PASSWORD_MIN_LENGTH) return { score: 0, label: `Demasiado corta (mínimo ${PASSWORD_MIN_LENGTH})` };
  if (new Set(password).size < 6) return { score: 1, label: LABELS[1] };

  const characterKinds = [/\p{Ll}/u, /\p{Lu}/u, /\d/, /[^\p{L}\d]/u].filter((kind) => kind.test(password)).length;
  const points = 2 + (password.length >= 16 ? 1 : 0) + (password.length >= 20 ? 1 : 0) + (characterKinds >= 3 ? 1 : 0);
  const score = Math.min(points, 4) as PasswordStrength["score"];

  return { score, label: LABELS[score] };
}
