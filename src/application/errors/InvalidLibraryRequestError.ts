// Petición no válida para cambiar "Mi biblioteca" (civilización desconocida, slug mal formado, campos de
// más). Los botones envían valores fijos, así que solo pasa con una petición manipulada: no hace falta
// detallar los campos.
export class InvalidLibraryRequestError extends Error {
  constructor() {
    super("La petición a tu biblioteca no es válida");
    this.name = "InvalidLibraryRequestError";
  }
}
