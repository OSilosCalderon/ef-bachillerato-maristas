import type { SecondYearTheoryTopic } from "@/lib/second-year-theory-topics";

// Classroom examples and scoring rules are specific to this school olympiad.
export const sa4TheoryTopic: Omit<SecondYearTheoryTopic, "foundation" | "sourceLinks"> = {
  slug: "2bach-sa4-evento-deportivo", number: 4, sa: "SA4",
  title: "Creamos un evento deportivo", subtitle: "Ocho delegaciones organizan, participan y evalúan una olimpiada",
  summary: "Cada delegación de cuatro personas propone un logo y organiza un deporte para las ocho delegaciones. Aprenderás a preparar reglas, responsabilidades, material, horarios y comunicación, comprobar si el plan cabe en el tiempo disponible y registrar resultados para la clasificación general.",
  visual: "event", visualCaption: "Preparar, ensayar, organizar y evaluar. Cada decisión debe servir para que el evento se pueda llevar a la práctica.",
  keyIdeas: ["Cada equipo organiza una actividad y participa en las demás", "Primero se comprueba el tiempo y después se confirma el formato", "Las reglas y los puntos se conocen antes de jugar", "La participación, la seguridad y el trabajo del equipo también se evalúan"],
  concepts: [
    { name: "Propósito", definition: "Lo que queremos conseguir con el evento y a quién va dirigido.", example: "Que las ocho delegaciones practiquen deportes diferentes y aprendan a organizarse." },
    { name: "Reglamento", definition: "Acuerdos escritos que explican cómo se juega, puntúa y resuelven las incidencias.", example: "Definir saque inicial, cambios, faltas, final del partido y desempate." },
    { name: "Cronograma", definition: "Orden de tareas con duración, responsable y espacio.", example: "Reservar montaje, calentamiento, explicación, encuentros, cambios de pista y recogida." },
    { name: "Acta del partido", definition: "Registro del enfrentamiento, resultado y decisión de desempate cuando sea necesaria.", example: "Guardar un 0–0 si se jugó y hubo empate. Un campo vacío significa que falta el resultado." },
    { name: "Logística", definition: "Preparación y coordinación de espacios, materiales y personas.", example: "Contar balones y petos, marcar dos campos y prever dónde espera cada equipo." },
    { name: "Plan alternativo", definition: "Respuesta acordada a una dificultad previsible, con una persona responsable de activarla.", example: "Si la pista está mojada, avisar al profesor y aplicar la alternativa de espacio que haya autorizado." },
  ],
  sections: [
    { title: "1. El encargo de nuestra olimpiada", anchor: { id: "sa4-encargo", label: "El encargo" }, paragraphs: [
      "Sois ocho delegaciones de cuatro integrantes. Cada una diseña una actividad deportiva diferente, prepara su organización y participa en las propuestas de las demás. El proyecto compartido está en «Creación del evento». Lo guardado en cada paso lo ven los integrantes de la delegación.",
      "Acordad con el profesor qué instalaciones y sesiones podéis utilizar antes de prometer una fecha. Como todos los países participan en cada deporte, dos actividades simultáneas pueden exigir que una misma delegación esté en dos lugares. El calendario general debe evitar ese solapamiento.",
    ], bullets: ["Una identidad común elegida en el concurso de logos", "Ocho actividades con reglamento y cuadro de juego", "Responsabilidades y recursos preparados", "Resultados, clasificación y balance final"] },
    { title: "2. Del propósito al reparto de tareas", anchor: { id: "sa4-equipo", label: "Equipo y propósito" }, paragraphs: [
      "Definid el éxito antes de preparar los partidos. Podéis observar si todos participan, si se entiende el reglamento y si se respeta el horario. Estos objetivos os ayudarán a valorar la organización al terminar.",
      "Entre las cuatro personas repartid coordinación y horario, reglamento y arbitraje, material y espacio, y comunicación y registro. Anotad para cada tarea quién la hace, cuándo y quién le releva. Si una persona juega, otra debe poder controlar el tiempo o registrar el resultado. Acordad apoyos de otros equipos con el profesor.",
    ] },
    { title: "3. Elegir un formato que se pueda completar", anchor: { id: "sa4-formato", label: "Formato y tiempos" }, paragraphs: [
      "La plataforma permite liguilla y eliminación directa. Con ocho delegaciones, la liguilla necesita 8 × 7 / 2 = 28 partidos, siete por país. Ofrece más encuentros, pero requiere más tiempo. La eliminación directa tiene cuatro cuartos de final, dos semifinales y una final: siete partidos en total. Quien pierde en cuartos solo disputa un partido del cuadro.",
      "Calculad turnos, no solo minutos de juego. Con dos pistas, una liguilla necesita al menos 14 turnos. Si cada turno ocupa seis minutos de juego y dos de cambio, son 112 minutos, más preparación y recogida. Ese plan no cabe en una sesión de 55 minutos.",
      "Ejemplo de eliminatoria para una sesión de 55 minutos y dos pistas: 6 minutos de montaje, 4 de explicación, 4 de calentamiento, 32 para cuatro turnos de 8 minutos, 4 de margen y 5 de recogida. Primero se disputan los cuartos en dos turnos, después las semifinales y por último la final. Es un ejemplo de aula: comprobad con un ensayo si vuestra actividad admite ese ritmo.",
      "Antes de elegir eliminatorias, explicad cómo participarían quienes quedan eliminados: arbitraje con apoyo, registro o tareas motrices paralelas autorizadas y con espacio seguro. Esas tareas complementarias no añaden partidos ni puntos al cuadro de la plataforma. Si necesitáis más encuentros oficiales por persona, planificad la liguilla en más sesiones.",
    ] },
    { title: "4. Un reglamento que permita jugar sin dudas", anchor: { id: "sa4-reglas", label: "Reglamento" }, paragraphs: [
      "El reglamento debe permitir que otra delegación empiece a jugar sin depender de explicaciones continuas. Describid el objetivo, número de jugadores, espacio, inicio y final, acciones permitidas, faltas, sanciones, cambios y puntuación. Incluid un ejemplo de una acción válida y de una infracción frecuente.",
      "Diferenciad los tantos del partido y los puntos de clasificación. En la liguilla de la plataforma, ganar aporta 3 puntos, empatar 1 y perder 0. La tabla ordena por puntos, diferencia de tantos y tantos a favor. Si todos esos valores coinciden, permanece el empate. En eliminación directa necesitáis acordar cómo se decide un ganador cuando el marcador termina igualado.",
      "Probad las normas con un encuentro breve. Si aparece una duda, corregid el texto y explicad el cambio a todos antes del comienzo de la competición. Cuando ya hay resultados guardados, el formato y el sorteo quedan fijados para proteger el cuadro.",
    ] },
    { title: "5. Material, espacio y presupuesto", anchor: { id: "sa4-recursos", label: "Recursos" }, paragraphs: [
      "Comprobad lo disponible antes de diseñar la pista. En un plano sencillo marcad zona de juego, espera, circulación y ubicación del material. Revisad con el profesor que los desplazamientos entre actividades sean viables.",
      "El inventario necesita cantidades, procedencia y responsable. Ejemplo: dos balones del almacén, ocho conos y dos juegos de petos que recoge la persona de material. Diferenciad los recursos prestados de las compras. Si todo se reutiliza, el gasto previsto puede ser 0 €. Si faltan dos rollos de cinta estimados a 3 € cada uno, la previsión de gasto es 6 €, pendiente de autorización y precio real.",
      "Reutilizad carteles y material cuando sea posible. Preved la recogida y revisad que vuelva la misma cantidad de material que salió. Estas decisiones también forman parte del balance del evento.",
    ] },
    { title: "6. Seguridad, inclusión y respuesta a incidencias", anchor: { id: "sa4-seguridad", label: "Seguridad e inclusión" }, paragraphs: [
      "Antes del evento, identificad riesgos concretos y asociad a cada uno una medida y una persona que lo compruebe. Durante la actividad, verificad que esas medidas siguen funcionando. La revisión incluye montaje y recogida. El profesor supervisa y determina cómo aplicar el protocolo del centro.",
      "Ejemplo de aula: si un balón invade otra pista, separad las zonas y acordad una señal para detener el juego. Si el suelo está resbaladizo o una persona se encuentra mal, parad y avisad al profesor. La alternativa de espacio, material o ritmo debe estar acordada previamente.",
      "Buscad barreras de participación y proponed adaptaciones de reglas, material, distancias o rotaciones con el profesor. El referente educativo del COI destaca excelencia, respeto y amistad. En nuestra olimpiada podéis expresarlos al esforzaros, respetar las decisiones y ayudar a otra delegación a participar.",
    ] },
    { title: "7. Logo, lema y comunicación del evento", anchor: { id: "sa4-comunicacion", label: "Logo y publicidad" }, paragraphs: [
      "El logo debe reconocerse en pequeño y representar el evento. Preparad una imagen propia o con permiso de uso y explicad qué significan sus símbolos y colores. El lema debe ser breve y coherente con el propósito. Nombre, logo, lema y explicación se guardan en el primer paso del proyecto.",
      "Cuando estén las ocho propuestas, el profesor abrirá la votación. Cada alumno valora todos los logos, incluido el suyo, usando los números del 1 al 8 una sola vez. El 1 corresponde al que menos le gusta y el 8 al que más. Una votación completa reparte 36 puntos. La propuesta con mayor suma gana y, si hay empate, se muestran las propuestas empatadas. Las puntuaciones se pueden modificar hasta el cierre.",
      "Preparad un anuncio que permita actuar al leerlo: nombre, lema, deporte, participantes, fecha, horario, lugar y qué deben llevar. Acordad la difusión con el profesor y actualizad el anuncio si cambia la organización. Un cartel atractivo necesita información comprensible y legible en el móvil.",
    ] },
    { title: "8. Ensayo, dirección y registro de resultados", anchor: { id: "sa4-desarrollo", label: "Puesta en marcha" }, paragraphs: [
      "Ensayad un turno completo con entradas, explicación, partido, anotación y salida. Cronometradlo y ajustad el plan si tarda más de lo previsto. Antes de empezar, cada responsable confirma que conoce su tarea y su relevo.",
      "Durante la competición, comunicad el siguiente encuentro y comprobad país, marcador y ronda antes de guardar. El cero es un resultado válido; dejar una casilla vacía significa que falta un dato. En una eliminatoria empatada, registrad el ganador tras aplicar el desempate previsto.",
      "La delegación organizadora y el profesor pueden registrar resultados de su actividad. Si corregís un partido de una ronda anterior, revisad las siguientes: cambiar el equipo que avanza invalida los resultados posteriores. La interfaz os pide confirmar esa corrección.",
    ] },
    { title: "9. Clasificación general de delegaciones", anchor: { id: "sa4-general", label: "Clasificación general" }, paragraphs: [
      "En «Clasificación total» aparecen las ocho delegaciones, los puntos por deporte y su suma. Cada actividad completada reparte 8 puntos al 1.º, 7 al 2.º y así hasta 1 al 8.º. Solo se incorpora cuando están guardados todos sus resultados y desempates. Mientras falten pruebas, la general es provisional.",
      "Los empates comparten los puntos de los puestos ocupados. En eliminatorias sin partido por el bronce, las dos delegaciones que pierden en semifinales reciben 5,5 puntos cada una, y las cuatro eliminadas en cuartos, 2,5. Así cada deporte reparte los mismos 36 puntos. Si dos países suman lo mismo en la general, comparten puesto.",
      "Ejemplo: una delegación gana un deporte y obtiene 8 puntos. En otro queda empatada con una segunda delegación entre los puestos 2.º y 3.º y recibe (7 + 6) / 2 = 6,5. Su total con esas dos pruebas es 14,5 puntos. Los puntos del concurso de logos se consultan aparte. La clasificación deportiva tampoco equivale a la nota académica.",
    ] },
    { title: "10. Evaluar y proponer una segunda edición", anchor: { id: "sa4-evaluacion", label: "Balance" }, paragraphs: [
      "Al terminar, reunid los registros y comparad el plan con lo ocurrido. En el balance explicad participación, tiempos, incidencias, recursos y aportación de cada integrante. Elegid una mejora concreta apoyada en una evidencia.",
      "Ejemplo de aula: «Previmos dos minutos de transición, pero el ensayo y tres cambios tardaron cuatro porque los petos estaban lejos. En una segunda edición dejaríamos cada juego de petos junto a la pista y asignaríamos una persona de apoyo». Esta conclusión permite ajustar una decisión real.",
    ] },
  ],
  cases: [
    { sport: "Baloncesto adaptado", capacity: "Organizar y participar", situation: "Las cuatro personas del país organizador tienen un partido mientras deben arbitrar y llevar el marcador.", proposal: "Acordar antes un relevo de otra delegación y comprobar con el profesor que conoce reglas y tiempos.", why: "Un responsable sin relevo deja una tarea sin atender cuando entra en pista.", progression: "Ensayar un turno y registrar si el relevo permite jugar y anotar sin retrasos." },
    { sport: "Balonmano adaptado", capacity: "Resolver un empate", situation: "Una semifinal termina 3–3 y nadie ha indicado cómo decidir al equipo finalista.", proposal: "Antes del torneo, concretar un desempate breve y aplicarlo de igual forma a todos. Registrar después el marcador y el ganador del desempate.", why: "El cuadro necesita un ganador y la decisión debe conocerse antes del partido.", progression: "Probar el procedimiento y comprobar que cabe en el tiempo reservado." },
    { sport: "Olimpiada de clase", capacity: "Interpretar la clasificación", situation: "Dos países pierden las semifinales y no se ha programado partido por el bronce.", proposal: "Compartir los puestos 3.º y 4.º y repartir (6 + 5) / 2 = 5,5 puntos a cada uno.", why: "No existe un resultado que permita separar sus puestos y cada prueba debe repartir 36 puntos.", progression: "Comprobar el desglose por deporte antes de interpretar el puesto general." },
  ],
  challenge: "Explica una decisión de vuestra delegación sobre el formato y demuéstrala con un cálculo de partidos y minutos. Añade una responsabilidad con relevo, una adaptación para facilitar la participación y una mejora que comprobaríais en el ensayo. Guarda tu reflexión individual y trasladad los acuerdos al proyecto compartido.",
  extension: "Compara organizar la misma actividad en liguilla y en eliminatorias con ocho países y dos pistas. Justifica el tiempo, las oportunidades de participación y cómo se aportan puntos a la general. Propón cómo repartir las tareas para que los cuatro integrantes también jueguen.",
  sources: ["Eventbrite · How to Organize & Promote a Sporting Event", "Eventbrite · The Ultimate Event Planning Checklist", "Health and Safety Executive · Getting started y Managing an event", "Comité Olímpico Internacional · Olympic Values Education Programme", "Proyecto de aula · Ejemplos y reglas de la olimpiada de ocho delegaciones"],
  quiz: [
    { question: "¿Qué necesita concretar una delegación antes de confirmar su deporte?", options: ["El ganador y los premios", "Propósito, participantes, tiempo, espacio y material disponible", "Solo el color del logo"], correct: 1, feedback: "La propuesta debe poder realizarse con los recursos y el tiempo acordados." },
    { question: "¿Cuántos partidos necesita una liguilla de ocho delegaciones a una vuelta?", options: ["7", "16", "28"], correct: 2, feedback: "8 × 7 / 2 = 28 partidos. Cada delegación juega contra las otras siete." },
    { question: "Una eliminatoria de ocho países tiene…", options: ["Siete partidos y puede dejar a un país con un solo encuentro", "Veintiocho partidos", "Siete partidos por país"], correct: 0, feedback: "Son cuatro cuartos, dos semifinales y una final. Hay que prever cómo participan quienes quedan eliminados." },
    { question: "¿Qué debe incluir el cronograma además de los partidos?", options: ["Solo la entrega de premios", "Montaje, explicación, calentamiento, transiciones, margen y recogida", "Únicamente el nombre de los países"], correct: 1, feedback: "La preparación y los cambios también consumen tiempo y necesitan responsables." },
    { question: "La persona que registra resultados debe jugar. ¿Qué conviene hacer?", options: ["Dejar el marcador sin registrar", "Buscar ayuda cuando ya haya terminado", "Acordar previamente un relevo que conozca la tarea"], correct: 2, feedback: "El reparto de tareas debe permitir organizar y participar sin dejar funciones sin atender." },
    { question: "Detectas que el suelo resbala antes del partido. ¿Cómo actúas?", options: ["Paras y avisas al profesor para aplicar la alternativa acordada", "Empiezas para no perder tiempo", "Cambias de espacio sin comunicarlo"], correct: 0, feedback: "La prevención exige revisar las condiciones reales y actuar con la supervisión del profesor." },
    { question: "¿Cómo se guarda una votación válida de logos?", options: ["Dando 8 a todos", "Puntuando los ocho logos del 1 al 8, sin repetir números", "Eligiendo únicamente un logo"], correct: 1, feedback: "Cada alumno reparte 36 puntos y todos los logos reciben una valoración." },
    { question: "Un 0–0 jugado en liguilla debe registrarse…", options: ["Dejando las dos casillas vacías", "Como si no se hubiera disputado", "Con cero en ambas casillas"], correct: 2, feedback: "El cero es válido. Una casilla vacía indica un resultado pendiente." },
    { question: "Dos países comparten los puestos 2.º y 3.º de un deporte. ¿Qué recibe cada uno para la general?", options: ["6,5 puntos", "7 puntos", "3 puntos"], correct: 0, feedback: "Comparten los puntos de esos puestos: (7 + 6) / 2 = 6,5. Solo cuentan las pruebas completadas." },
    { question: "¿Qué conclusión ayuda a mejorar el evento?", options: ["Ha estado bien", "Una comparación entre lo previsto y los registros, con un cambio concreto", "El nombre del campeón sin más datos"], correct: 1, feedback: "La evaluación necesita evidencias sobre el funcionamiento y una propuesta aplicable." },
  ],
};

export const sa4TheoryFoundation = "Organizar un evento deportivo conecta decisiones sobre finalidad, formato, instalaciones, recursos y comunicación. Las guías de Eventbrite ayudan a reconocer esas áreas. HSE propone planificar, supervisar y revisar la seguridad según el tamaño y los riesgos del evento. El programa educativo del COI aporta los valores de excelencia, respeto y amistad. Los ejemplos, cálculos y reglas de estas páginas son una adaptación didáctica para nuestra olimpiada escolar, que se organiza con la supervisión del profesor.";
export const sa4TheoryLinks = [
  { title: "Eventbrite · Guía de organización de eventos deportivos (inglés)", url: "https://www.eventbrite.com/how-to-organize/sporting-event/" },
  { title: "Eventbrite · Lista de planificación de un evento (inglés)", url: "https://www.eventbrite.com/blog/ultimate-event-planning-checklist/" },
  { title: "HSE · Preparar el evento y su seguridad (inglés)", url: "https://www.hse.gov.uk/event-safety/getting-started.htm" },
  { title: "HSE · Coordinar y revisar el evento (inglés)", url: "https://www.hse.gov.uk/event-safety/managing-an-event.htm" },
  { title: "COI · Programa de Educación en Valores Olímpicos (inglés)", url: "https://www.olympics.com/ioc/education/olympic-values-education-programme" },
];
