export const secondYearWorkClosedMessage = "La edición de esta actividad está cerrada. Puedes consultar lo que ya guardaste.";

export function secondYearWorkClosureMessage(closed: boolean | null) {
  return closed === null
    ? "No se ha podido comprobar si la edición está disponible. Puedes consultar lo guardado."
    : secondYearWorkClosedMessage;
}
