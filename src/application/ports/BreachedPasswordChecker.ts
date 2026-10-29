// Tells whether a password appears in known data breaches (OWASP ASVS: reject passwords that are known
// to be compromised). Implementations may fail (e.g. the external service is down): they throw, and the
// use case decides what to do.
export interface BreachedPasswordChecker {
  isBreached(password: string): Promise<boolean>;
}
