export type SportTrainingCase = {
  sport: string;
  capacity: string;
  situation: string;
  proposal: string;
  why: string;
  progression: string;
};

export type TheoryApplicationBlock = {
  slug: string;
  foundation: string;
  connections: string[];
  image: string;
  imageAlt: string;
  imageCaption: string;
  cases: SportTrainingCase[];
  appliedChallenge: string;
};

export const trainingTheoryApplications: TheoryApplicationBlock[] = [
  {
    slug: "adaptacion-y-supercompensacion",
    foundation: "Entrenar significa provocar un estímulo capaz de alterar temporalmente el equilibrio del organismo. Aparece fatiga, después recuperación y, si la carga ha sido adecuada, una adaptación que permite responder mejor en situaciones similares. El descanso no es tiempo perdido: forma parte del proceso de mejora y condiciona cuándo conviene repetir un estímulo exigente.",
    connections: ["estímulo", "fatiga", "recuperación", "adaptación", "continuidad"],
    image: "/theory/adaptacion-ciclo.png",
    imageAlt: "Esquema visual del ciclo estímulo, fatiga, recuperación y adaptación",
    imageCaption: "Una carga útil necesita recuperación antes de volver a exigir al organismo.",
    cases: [
      { sport: "Fútbol", capacity: "Aceleración y sprints repetidos", situation: "Un jugador quiere mantener la velocidad en acciones de 10–20 metros durante todo el partido.", proposal: "2 bloques de 5 aceleraciones de 15–20 m, con recuperación suficiente para conservar la velocidad y sin colocar otra sesión intensa de sprint al día siguiente.", why: "Si la fatiga hace que todas las repeticiones sean lentas, deja de entrenarse la velocidad con calidad.", progression: "Añadir primero una repetición por bloque y, más adelante, reducir ligeramente la pausa; no cambiar ambas variables a la vez." },
      { sport: "Voleibol", capacity: "Fuerza explosiva de salto", situation: "Una jugadora quiere mejorar su salto de bloqueo.", proposal: "Pocos saltos máximos de calidad combinados con fuerza de tren inferior y recuperación amplia entre series.", why: "La potencia necesita que cada intento se realice con alta intención de velocidad y poca fatiga acumulada.", progression: "Aumentar el volumen solo mientras la altura y la técnica de salto se mantengan." },
    ],
    appliedChallenge: "Organiza tres sesiones semanales para uno de estos deportes y señala cuál es el estímulo principal, dónde colocarías recuperación y cuándo repetirías el trabajo intenso.",
  },
  {
    slug: "principios-del-entrenamiento",
    foundation: "Los principios del entrenamiento son reglas para tomar decisiones coherentes. Individualizar evita copiar cargas de otras personas; progresar permite que el estímulo siga siendo suficiente; la especificidad relaciona la tarea con el objetivo deportivo; continuidad y variedad permiten acumular mejoras sin repetir siempre exactamente lo mismo.",
    connections: ["individualización", "progresión", "sobrecarga", "especificidad", "continuidad"],
    image: "/theory/ejemplos-deportes.png",
    imageAlt: "Ejemplos visuales de distintos deportes y demandas físicas",
    imageCaption: "El mismo principio se aplica de forma distinta según el deporte y la capacidad que queramos mejorar.",
    cases: [
      { sport: "Pádel", capacity: "Reacción y cambio de dirección", situation: "Dos jugadores quieren llegar antes a bolas cortas, pero tienen niveles físicos diferentes.", proposal: "Desplazamientos de 3–5 m hacia derecha o izquierda reaccionando a una señal visual, ajustando repeticiones y pausas a cada jugador.", why: "La tarea es específica por distancia, decisión y dirección, pero la carga debe individualizarse.", progression: "Añadir una decisión previa o una segunda dirección antes de aumentar mucho las repeticiones." },
      { sport: "Baloncesto", capacity: "Fuerza-resistencia defensiva", situation: "Un jugador pierde estabilidad en desplazamientos laterales al final de acciones largas.", proposal: "Circuito corto con desplazamientos laterales, sentadilla, zancadas y estabilidad del tronco.", why: "Los ejercicios reproducen patrones útiles para la defensa sin necesidad de usar cargas máximas.", progression: "Aumentar una serie o algunos segundos de trabajo manteniendo la calidad técnica." },
    ],
    appliedChallenge: "Elige un deporte y explica cómo aplicarías individualización, especificidad y progresión a una capacidad concreta.",
  },
  {
    slug: "carga-y-capacidades-fisicas",
    foundation: "La carga puede describirse mediante volumen, intensidad, frecuencia y densidad. Cambiar una sola variable transforma la sesión: hacer más repeticiones aumenta volumen; correr más rápido eleva intensidad; entrenar más días cambia frecuencia; reducir pausas aumenta densidad. Registrar RPE ayuda a interpretar cómo responde cada persona a esa carga externa.",
    connections: ["volumen", "intensidad", "frecuencia", "densidad", "RPE"],
    image: "/theory/capacidades-fisicas.png",
    imageAlt: "Panel visual con fuerza, resistencia, velocidad y flexibilidad",
    imageCaption: "Las capacidades físicas se entrenan manipulando variables de carga diferentes.",
    cases: [
      { sport: "Bádminton", capacity: "Resistencia específica y velocidad", situation: "Una jugadora quiere repetir desplazamientos rápidos hacia las esquinas sin perder precisión.", proposal: "6 repeticiones de 20 s de desplazamientos específicos con 40 s de recuperación y RPE al final del bloque.", why: "La relación trabajo-pausa permite trabajar acciones rápidas sin convertir todo el ejercicio en carrera continua.", progression: "Pasar de 20/40 a 20/30 antes de aumentar el número total de repeticiones." },
      { sport: "Atletismo", capacity: "Resistencia aeróbica", situation: "Un corredor principiante quiere sostener más tiempo un ritmo cómodo.", proposal: "Carrera continua suave de 15–20 min a intensidad conversacional, dos días por semana.", why: "El objetivo es acumular tiempo de trabajo estable, no correr cada sesión al máximo.", progression: "Añadir 2–3 minutos por sesión cuando el RPE siga siendo moderado." },
    ],
    appliedChallenge: "Diseña dos sesiones para la misma capacidad cambiando solo una variable de carga. Explica qué efecto esperas del cambio.",
  },
  {
    slug: "fuerza-y-contraccion-muscular",
    foundation: "La fuerza puede manifestarse como fuerza máxima, explosiva o fuerza-resistencia. Además, el músculo puede producir tensión mientras se acorta, mientras se alarga controlando una carga o sin movimiento articular apreciable. Comprender esas acciones ayuda a seleccionar ejercicios por su función y no solo por su nombre.",
    connections: ["fuerza explosiva", "fuerza-resistencia", "concéntrica", "excéntrica", "isométrica"],
    image: "/theory/capacidades-fisicas.png",
    imageAlt: "Imágenes de diferentes capacidades físicas y ejercicios de fuerza",
    imageCaption: "La fuerza cambia según la velocidad, la duración y la forma de producir tensión.",
    cases: [
      { sport: "Voleibol", capacity: "Fuerza explosiva", situation: "Una central quiere mejorar el impulso de bloqueo.", proposal: "Sentadillas con autocarga o resistencia moderada, saltos con contramovimiento y descansos amplios.", why: "El objetivo no es acumular cansancio sino producir fuerza rápidamente y transferirla al salto.", progression: "Aumentar ligeramente la dificultad o la resistencia antes que multiplicar saltos sin control." },
      { sport: "Baloncesto", capacity: "Frenada excéntrica", situation: "Un jugador necesita controlar mejor una parada después de una entrada.", proposal: "Zancadas y descensos controlados, aterrizajes desde poca altura y paradas con buena alineación.", why: "La fase excéntrica ayuda a absorber fuerzas y controlar la desaceleración.", progression: "Aumentar velocidad de aproximación o complejidad solo cuando el control sea estable." },
    ],
    appliedChallenge: "Escoge un gesto deportivo y localiza una fase concéntrica, una excéntrica y una situación donde sea útil una acción isométrica.",
  },
  {
    slug: "resistencia-y-metodos",
    foundation: "La resistencia depende de cuánto tiempo podemos sostener o repetir un esfuerzo y de la intensidad a la que lo hacemos. Los métodos continuo, intervalado, intermitente y en circuito son herramientas distintas. Elegir uno u otro depende del deporte, del nivel y del objetivo, no de cuál resulte más agotador.",
    connections: ["continuo", "intervalado", "intermitente", "pausas", "resistencia específica"],
    image: "/theory/ejemplos-deportes.png",
    imageAlt: "Varios deportes con demandas intermitentes y continuas",
    imageCaption: "Fútbol, baloncesto, bádminton o atletismo exigen formas de resistencia diferentes.",
    cases: [
      { sport: "Fútbol", capacity: "Resistencia intermitente", situation: "Un equipo necesita repetir carreras y recuperaciones durante un partido.", proposal: "Bloques de 15 s de carrera intensa y 30 s suaves durante 6–8 minutos.", why: "Alterna fases de esfuerzo y recuperación de forma parecida al carácter intermitente del juego.", progression: "Aumentar un bloque o reducir ligeramente la recuperación, sin perder la intensidad de las fases rápidas." },
      { sport: "Atletismo", capacity: "Resistencia de carrera", situation: "Un alumno prepara una carrera de 1500–2000 m escolar.", proposal: "Una sesión continua suave y otra con intervalos medios separados por recuperación activa.", why: "Combina base aeróbica con la capacidad de sostener ritmos algo más altos.", progression: "Aumentar gradualmente el tiempo total o la distancia de los intervalos." },
    ],
    appliedChallenge: "Convierte una sesión continua en una sesión intervalada manteniendo aproximadamente el mismo tiempo total de trabajo. Compara sensaciones y objetivo.",
  },
  {
    slug: "velocidad-movilidad-y-estabilidad",
    foundation: "La velocidad exige producir acciones de gran calidad en poco tiempo, por lo que necesita recuperación suficiente. La movilidad permite alcanzar posiciones útiles y la estabilidad ayuda a controlar esas posiciones frente a fuerzas internas y externas. En deporte, estas capacidades suelen aparecer juntas durante aceleraciones, frenadas, golpeos, saltos y cambios de dirección.",
    connections: ["aceleración", "reacción", "movilidad", "estabilidad", "coordinación"],
    image: "/theory/ejemplos-deportes.png",
    imageAlt: "Acciones rápidas de pádel, fútbol, baloncesto, bádminton y atletismo",
    imageCaption: "Moverse rápido no significa moverse sin control: velocidad y estabilidad deben convivir.",
    cases: [
      { sport: "Pádel", capacity: "Reacción y estabilidad", situation: "Una jugadora llega tarde a la volea después de un cambio de dirección.", proposal: "Salidas cortas desde posición de espera, reacción a señal y frenada estable antes de simular el golpeo.", why: "Integra velocidad de respuesta con control corporal en una situación próxima al juego.", progression: "Añadir incertidumbre en la señal o una segunda acción, no simplemente hacer el recorrido más largo." },
      { sport: "Bádminton", capacity: "Velocidad de pies y movilidad", situation: "Un jugador quiere recuperar antes la posición central después de un desplazamiento profundo.", proposal: "Secuencias de split-step, desplazamiento a esquina y regreso al centro con pausas amplias.", why: "La técnica de pies y la movilidad de cadera/tobillo permiten desplazarse rápido sin perder equilibrio.", progression: "Pasar de secuencias conocidas a señales aleatorias." },
    ],
    appliedChallenge: "Crea un ejercicio de 10–15 segundos para mejorar velocidad y control en un deporte de raqueta o equipo. Explica por qué necesita pausa suficiente.",
  },
  {
    slug: "planificacion-del-entrenamiento",
    foundation: "Planificar es distribuir objetivos y cargas en el tiempo. Una sesión tiene una intención; varias sesiones forman un microciclo y varios microciclos permiten construir fases más largas. La planificación no es rígida: los registros y la evaluación sirven para ajustar el plan cuando la respuesta real no coincide con lo previsto.",
    connections: ["objetivo", "sesión", "microciclo", "control", "ajuste"],
    image: "/theory/adaptaciones-cuerpo.png",
    imageAlt: "Representación visual de diferentes sistemas corporales que responden al entrenamiento",
    imageCaption: "Planificar permite dar tiempo a cada sistema y capacidad para recibir estímulo y recuperarse.",
    cases: [
      { sport: "Baloncesto", capacity: "Velocidad y fuerza", situation: "Un equipo entrena tres días y juega el sábado.", proposal: "Lunes fuerza y técnica; miércoles velocidad y cambios de dirección; viernes sesión breve y ligera antes del partido.", why: "Las cargas más exigentes quedan alejadas de la competición y el final de semana prioriza frescura.", progression: "Modificar el volumen de cada día según calendario, sensaciones y minutos de competición." },
      { sport: "Atletismo", capacity: "Preparación de una carrera", situation: "Una alumna dispone de cuatro semanas para mejorar en una prueba de resistencia.", proposal: "Alternar rodaje suave, sesión intervalada y trabajo complementario, dejando al menos un día fácil entre cargas principales.", why: "La mejora depende de la suma de semanas, no de una sesión aislada.", progression: "Subir la carga durante dos o tres semanas y reducirla ligeramente antes de la prueba final." },
    ],
    appliedChallenge: "Construye un microciclo de 7 días con tres sesiones. Escribe el objetivo de cada día y justifica por qué están colocadas en ese orden.",
  },
  {
    slug: "periodizacion-y-plan-personal",
    foundation: "Periodizar significa organizar fases con prioridades diferentes para acercarse progresivamente a un objetivo. Al principio puede predominar un trabajo general y con el tiempo aumentar la especificidad. En un plan personal escolar interesa aprender a fijar un punto de partida, seleccionar una prioridad, aplicar progresión y comprobar después si los datos han cambiado.",
    connections: ["fase general", "fase específica", "progresión", "puesta a punto", "evaluación"],
    image: "/theory/adaptacion-ciclo.png",
    imageAlt: "Secuencia visual de estímulo, recuperación y mejora",
    imageCaption: "La periodización encadena ciclos de trabajo y recuperación con un objetivo a medio plazo.",
    cases: [
      { sport: "Fútbol", capacity: "Aceleración", situation: "Un jugador quiere llegar más rápido a balones divididos dentro de seis semanas.", proposal: "Primeras semanas: técnica de carrera y fuerza; fase media: aceleraciones cortas; fase final: tareas reactivas con balón y menos volumen.", why: "La preparación avanza desde bases generales hacia acciones cada vez más específicas.", progression: "Reducir volumen cuando aumenta la velocidad y especificidad de las acciones." },
      { sport: "Voleibol", capacity: "Salto", situation: "Una jugadora busca mejorar su salto antes de una competición escolar.", proposal: "Base de fuerza y control, después saltos de mayor calidad y finalmente menos repeticiones con alta velocidad.", why: "No todas las semanas deben tener el mismo volumen ni el mismo tipo de estímulo.", progression: "Evaluar salto inicial y final para comprobar si el plan produjo cambios." },
    ],
    appliedChallenge: "Diseña cuatro semanas para una capacidad de tu deporte: indica qué cambia de una semana a otra y qué prueba usarías antes y después.",
  },
  {
    slug: "flexibilidad-y-amplitud-de-movimiento",
    foundation: "La flexibilidad y la amplitud de movimiento permiten adoptar posiciones útiles con control. No se trata de alcanzar el máximo rango posible, sino el que necesita una tarea. La velocidad del estiramiento, la tensión muscular y el control neuromuscular modifican la respuesta, por eso conviene diferenciar movilidad dinámica, estiramiento mantenido y técnicas de tensión-relajación.",
    connections: ["amplitud de movimiento", "movilidad", "reflejo de estiramiento", "control", "progresión"],
    image: "/theory/capacidades-fisicas.png",
    imageAlt: "Ejemplos visuales de entrenamiento de fuerza, resistencia, velocidad y flexibilidad",
    imageCaption: "La movilidad debe relacionarse con las posiciones que realmente exige cada deporte.",
    cases: [
      { sport: "Bádminton", capacity: "Movilidad de cadera y tobillo", situation: "Una jugadora necesita llegar a una dejada baja manteniendo equilibrio.", proposal: "Movilidad dinámica de tobillo y cadera, zancadas amplias controladas y desplazamientos técnicos antes de jugar.", why: "La amplitud útil permite bajar el centro de gravedad sin perder una posición desde la que volver al centro.", progression: "Aumentar gradualmente el rango solo mientras exista control y ausencia de dolor." },
      { sport: "Pádel", capacity: "Movilidad de hombro y tronco", situation: "Un jugador quiere preparar mejor posiciones de bandeja y remate.", proposal: "Movilidad torácica, movimientos controlados de hombro y gestos progresivos con pala antes de golpear fuerte.", why: "Un rango útil facilita la colocación del cuerpo, pero debe integrarse con control y técnica.", progression: "Pasar de movimientos lentos y amplios a gestos deportivos progresivamente más rápidos." },
    ],
    appliedChallenge: "Elige una acción deportiva que requiera amplitud de movimiento. Identifica dos articulaciones implicadas y propone un ejercicio de movilidad y otro de control específico.",
  },
];

export function getTheoryApplication(slug: string) {
  return trainingTheoryApplications.find((item) => item.slug === slug) ?? trainingTheoryApplications[0];
}
