export const STUDENT_LOGIN_DOMAIN = "alumnado.maristasbadajoz.invalid";

export function normalizeStudentUsername(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".");
}

export function loginIdentifierToEmail(value: string) {
  const identifier = value.trim();
  if (identifier.includes("@")) return identifier;
  const username = normalizeStudentUsername(identifier);
  if (!/^[a-z0-9]+(?:\.[a-z0-9]+)+$/.test(username)) {
    throw new Error("Escribe el usuario facilitado por el profesor, por ejemplo nombre.apellido.");
  }
  return `${username}@${STUDENT_LOGIN_DOMAIN}`;
}
