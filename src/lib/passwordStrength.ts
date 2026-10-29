import { PASSWORD_MIN_LENGTH } from "@/domain/value-objects/Password";

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

const LABELS = ["", "Débil: demasiado repetitiva", "Aceptable", "Fuerte", "Muy fuerte"] as const;

// A visual hint while typing, not a rule: the server only enforces the minimum length and rejects
// leaked passwords. Length weighs most (a long passphrase is strong even in lower case), variety adds a
// little, and a few repeated characters ("aaaa…") are flagged as weak.
export function estimatePasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return { score: 0, label: "" };
  if (password.length < PASSWORD_MIN_LENGTH) return { score: 0, label: `Demasiado corta (mínimo ${PASSWORD_MIN_LENGTH})` };
  if (new Set(password).size < 6) return { score: 1, label: LABELS[1] };

  const characterKinds = [/\p{Ll}/u, /\p{Lu}/u, /\d/, /[^\p{L}\d]/u].filter((kind) => kind.test(password)).length;
  const points = 2 + (password.length >= 16 ? 1 : 0) + (password.length >= 20 ? 1 : 0) + (characterKinds >= 3 ? 1 : 0);
  const score = Math.min(points, 4) as PasswordStrength["score"];

  return { score, label: LABELS[score] };
}
