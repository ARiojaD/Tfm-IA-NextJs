// Invalid request to change "Mi biblioteca" (unknown civilization, malformed slug, unexpected fields).
// The buttons send fixed values, so this only happens with a tampered request: no field details needed.
export class InvalidLibraryRequestError extends Error {
  constructor() {
    super("La petición a tu biblioteca no es válida");
    this.name = "InvalidLibraryRequestError";
  }
}
