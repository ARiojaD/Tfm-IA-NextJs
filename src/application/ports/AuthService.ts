import type { DisplayName } from "@/domain/value-objects/DisplayName";
import type { Email } from "@/domain/value-objects/Email";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Quién ha iniciado sesión, tal como lo ve el resto de la aplicación: solo lo que necesita. Nunca el correo
// ni la contraseña.
export interface AuthenticatedUser {
  id: EntityId;
  name: DisplayName;
}

export type RegistrationResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; reason: "EMAIL_ALREADY_REGISTERED" };

// Una contraseña incorrecta y un correo desconocido dan la misma respuesta, para que nadie pueda averiguar
// qué correos están registrados.
export type SignInResult = { ok: true; user: AuthenticatedUser } | { ok: false; reason: "INVALID_CREDENTIALS" };

// Cuentas y sesiones. Los casos de uso validan la entrada antes de llamarlo; la implementación guarda la
// contraseña con hash y mantiene la sesión de la petición en curso (en la real, con una cookie).
export interface AuthService {
  // Crea la cuenta e inicia la sesión del usuario.
  register(input: { name: DisplayName; email: Email; password: string }): Promise<RegistrationResult>;
  signIn(input: { email: Email; password: string }): Promise<SignInResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthenticatedUser | null>;
}
