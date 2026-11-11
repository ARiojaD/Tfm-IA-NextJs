// Dice si una contraseña aparece en filtraciones de datos conocidas (OWASP ASVS: rechazar contraseñas que
// se sabe que están comprometidas). Las implementaciones pueden fallar (por ejemplo, si el servicio externo
// está caído): lanzan un error y el caso de uso decide qué hacer.
export interface BreachedPasswordChecker {
  isBreached(password: string): Promise<boolean>;
}
