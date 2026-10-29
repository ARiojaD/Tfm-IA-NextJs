import { estimatePasswordStrength } from "@/lib/passwordStrength";

const BAR_COLORS = ["bg-danger", "bg-danger", "bg-accent", "bg-success", "bg-success"] as const;

// Four bars and a label under the password field. Only a hint: the server applies the real rules.
export function PasswordStrengthMeter({ password, id }: { password: string; id: string }) {
  const { score, label } = estimatePasswordStrength(password);
  if (!label) return null;

  return (
    <div id={id} className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={`h-1.5 flex-1 rounded-full ${bar <= Math.max(score, 1) ? BAR_COLORS[score] : "bg-border"}`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted">
        Seguridad: <span className="font-medium text-foreground">{label}</span>
      </p>
    </div>
  );
}
