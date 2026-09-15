export type SecondYearTheoryConcept = { name: string; definition: string; example: string };
export type SecondYearTheorySection = { title: string; paragraphs: string[]; bullets?: string[] };
export type SecondYearSportCase = { sport: string; capacity: string; situation: string; proposal: string; why: string; progression: string };
export type SecondYearQuizQuestion = { question: string; options: string[]; correct: number; feedback: string };
export type SecondYearTheoryTopic = {
  slug: string;
  number: number;
  sa: string;
  title: string;
  subtitle: string;
  summary: string;
  visual: "diagnosis" | "load" | "habits" | "event" | "expression" | "community";
  visualCaption: string;
  keyIdeas: string[];
  concepts: SecondYearTheoryConcept[];
  sections: SecondYearTheorySection[];
  cases: SecondYearSportCase[];
  challenge: string;
  extension: string;
  sources: string[];
  quiz: SecondYearQuizQuestion[];
};

export const secondYearTheoryTopics: SecondYearTheoryTopic[] = [
  {
    slug: "2bach-sa1-punto-partida", number: 1, sa: "SA1",
    title: "¿Cuál es mi punto de partida?", subtitle: "Evaluar, interpretar y decidir antes de empezar a entrenar",
    summary: "En 2º no basta con completar pruebas: hay que interpretar los datos, priorizar necesidades y convertir la evaluación inicial en decisiones justificadas para un plan personal.",
    visual: "diagnosis", visualCaption: "La evaluación solo cobra sentido cuando conduce a una decisión y vuelve a comprobarse después.",
    keyIdeas: ["Una marca aislada no define tu condición física", "Evaluar sirve para decidir, no para clasificar", "Un plan necesita prioridades y criterios de éxito", "Reevaluar permite saber si la estrategia funciona"],
    concepts: [
      { name: "Evaluación inicial", definition: "Recogida organizada de información antes de iniciar un proceso de mejora.", example: "Registrar resistencia, fuerza, velocidad y movilidad al comienzo de SA1." },
      { name: "Prioridad", definition: "Capacidad o necesidad que recibe más atención porque tiene mayor relación con el objetivo.", example: "Priorizar aceleración si el objetivo es llegar antes a balones divididos en fútbol." },
      { name: "Indicador de éxito", definition: "Dato observable que permite comprobar si el objetivo se está alcanzando.", example: "Mejorar la marca de sprint manteniendo una técnica estable." },
      { name: "Reevaluación", definition: "Repetición de una medida en condiciones semejantes para valorar cambios.", example: "Comparar septiembre y diciembre usando el mismo protocolo." },
    ],
    sections: [
      { title: "De medir a interpretar", paragraphs: ["La evaluación inicial aporta información sobre el punto de partida. Su valor no está en acumular números, sino en relacionarlos con los objetivos personales y con las demandas de la actividad que queremos mejorar.", "En 2º debemos distinguir entre fortaleza, necesidad y prioridad. Una capacidad puede estar menos desarrollada, pero no ser prioritaria si apenas influye en el objetivo elegido."] },
      { title: "Objetivos útiles", paragraphs: ["Un objetivo debe describir qué queremos mejorar, en qué periodo y cómo sabremos si hemos avanzado. Objetivos vagos como 'ponerme en forma' dificultan decidir tareas y valorar resultados.", "Conviene elegir pocos objetivos principales y acompañarlos de indicadores sencillos: una marca, una sensación de esfuerzo, la regularidad del entrenamiento o la calidad técnica de una tarea."] },
      { title: "Del diagnóstico al plan", paragraphs: ["El plan conecta el diagnóstico con sesiones concretas. Debe indicar frecuencia semanal, duración aproximada, tareas, recuperación y una estrategia de progresión.", "Si los registros muestran que la respuesta real no coincide con lo previsto, ajustar el plan forma parte del aprendizaje y no significa que el diseño inicial haya sido inútil."] },
    ],
    cases: [
      { sport: "Fútbol", capacity: "Aceleración", situation: "Un alumno mantiene bien esfuerzos largos, pero pierde balones divididos en los primeros metros.", proposal: "Priorizar aceleraciones de 10–20 m con recuperación amplia y trabajo de fuerza de tren inferior.", why: "La necesidad principal está relacionada con producir fuerza rápidamente, no con añadir más carrera continua.", progression: "Aumentar gradualmente repeticiones o complejidad sin perder velocidad." },
      { sport: "Voleibol", capacity: "Fuerza y salto", situation: "Una alumna quiere mejorar el bloqueo y obtiene resultados moderados en salto horizontal y fuerza.", proposal: "Planificar fuerza básica y saltos de calidad dosificados, manteniendo movilidad y recuperación.", why: "La potencia de salto necesita fuerza suficiente y capacidad de aplicarla rápidamente.", progression: "Primero dominar técnica y control; después aumentar resistencia o dificultad." },
      { sport: "Atletismo", capacity: "Velocidad", situation: "Un alumno quiere mejorar en 60 m, pero su plan anterior solo incluía carrera continua.", proposal: "Introducir sprints cortos, salidas y fuerza específica con pausas completas.", why: "El estímulo debe parecerse a la capacidad que se pretende mejorar.", progression: "Mantener alta calidad y aumentar el volumen de velocidad de forma gradual." },
    ],
    challenge: "Escoge tres datos de tu evaluación: identifica una fortaleza, una prioridad y un objetivo. Después escribe un indicador que te permita comprobar en diciembre si la estrategia ha funcionado.",
    extension: "Justifica por qué dos alumnos con resultados iniciales parecidos podrían necesitar planes diferentes si practican deportes distintos o persiguen objetivos diferentes.",
    sources: ["Tudor O. Bompa · Periodización del entrenamiento deportivo", "Baechle & Earle · Principios del entrenamiento de la fuerza y del acondicionamiento físico", "Michael Boyle · El entrenamiento funcional aplicado a deportes"],
    quiz: [
      { question: "¿Cuál es la finalidad principal de una evaluación inicial?", options: ["Clasificar al alumnado", "Obtener información para tomar decisiones", "Elegir siempre la prueba con mejor resultado"], correct: 1, feedback: "La evaluación inicial debe orientar decisiones y permitir comparaciones posteriores." },
      { question: "¿Qué hace útil a un objetivo?", options: ["Que sea amplio y difícil de medir", "Que describa un cambio y cómo comprobarlo", "Que incluya muchas capacidades a la vez"], correct: 1, feedback: "Un objetivo útil permite decidir tareas y comprobar después si se ha progresado." },
      { question: "Si el plan no produce la respuesta esperada, lo adecuado es…", options: ["Mantenerlo sin cambios", "Revisar registros y reajustar", "Eliminar la evaluación inicial"], correct: 1, feedback: "El reajuste forma parte de una planificación responsable." },
    ],
  },
  {
    slug: "2bach-sa2-condicion-fisica", number: 2, sa: "SA2",
    title: "Entrenar con cabeza", subtitle: "Construye tu condición física controlando la carga",
    summary: "Entrenar mejor no significa cansarse más. Significa combinar volumen, intensidad, frecuencia, densidad y recuperación para provocar adaptaciones útiles y sostenibles.",
    visual: "load", visualCaption: "La carga produce fatiga; la recuperación adecuada permite adaptación y prepara el siguiente estímulo.",
    keyIdeas: ["La carga se puede manipular", "La intensidad y el volumen no significan lo mismo", "La recuperación también se programa", "RPE ayuda a interpretar la carga interna"],
    concepts: [
      { name: "Volumen", definition: "Cantidad total de trabajo realizado.", example: "Número total de sprints, repeticiones o minutos." },
      { name: "Intensidad", definition: "Grado de exigencia del esfuerzo.", example: "Correr más rápido o utilizar una resistencia mayor." },
      { name: "Densidad", definition: "Relación entre tiempo de trabajo y tiempo de recuperación.", example: "20 s de trabajo y 40 s de pausa frente a 20 s y 20 s." },
      { name: "RPE", definition: "Valoración subjetiva de esfuerzo percibido, útil para interpretar cómo responde la persona.", example: "Una misma sesión puede sentirse como RPE 5 para una persona y 8 para otra." },
    ],
    sections: [
      { title: "Carga externa y carga interna", paragraphs: ["La carga externa describe lo que hacemos: metros, repeticiones, tiempo, velocidad o resistencia. La carga interna describe cómo responde la persona a ese trabajo.", "Por eso dos alumnos pueden completar la misma tarea y experimentar exigencias diferentes. Registrar RPE ayuda a interpretar esa respuesta sin convertirlo en una medida clínica."] },
      { title: "Fatiga, recuperación y adaptación", paragraphs: ["Después de un estímulo aparece fatiga. Si el descanso y la alimentación cotidiana son suficientes, el organismo puede recuperar su capacidad y adaptarse.", "Repetir cargas intensas demasiado pronto puede deteriorar la calidad del trabajo; dejar siempre demasiados días entre estímulos puede dificultar la continuidad."] },
      { title: "Progresar sin cambiarlo todo", paragraphs: ["Una progresión clara modifica una variable principal cada vez: añadir una serie, aumentar ligeramente la intensidad o reducir algo la pausa.", "Cambiar simultáneamente volumen, intensidad y densidad hace difícil saber qué ha provocado la respuesta observada."] },
    ],
    cases: [
      { sport: "Fútbol", capacity: "Sprints repetidos", situation: "Un jugador quiere mantener aceleraciones de 10–20 m durante el partido.", proposal: "Bloques breves de sprints de alta calidad con recuperación suficiente.", why: "La velocidad exige que las repeticiones sigan siendo rápidas.", progression: "Añadir primero una repetición antes de reducir la pausa." },
      { sport: "Bádminton", capacity: "Desplazamientos específicos", situation: "Una jugadora pierde velocidad al repetir desplazamientos a las esquinas.", proposal: "Intervalos cortos de desplazamiento con tiempos de pausa definidos y registro RPE.", why: "Permite relacionar densidad, fatiga y calidad del movimiento.", progression: "Reducir ligeramente la pausa cuando se mantenga la técnica." },
      { sport: "Baloncesto", capacity: "Cambio de dirección", situation: "Un jugador necesita frenar y volver a acelerar con control.", proposal: "Tareas de aceleración-frenada con pocas repeticiones y buena recuperación.", why: "La calidad de la desaceleración importa más que acumular repeticiones fatigadas.", progression: "Añadir incertidumbre o una nueva dirección cuando el control sea estable." },
      { sport: "Atletismo", capacity: "Resistencia", situation: "Una alumna quiere sostener más tiempo un ritmo moderado.", proposal: "Aumentar progresivamente el tiempo total de carrera manteniendo RPE controlado.", why: "La prioridad es acumular trabajo sostenible, no terminar cada sesión al máximo.", progression: "Añadir minutos de forma gradual antes de acelerar el ritmo." },
    ],
    challenge: "Diseña dos versiones de la misma tarea: una para priorizar velocidad y otra para priorizar resistencia. Explica qué variables de carga has cambiado.",
    extension: "Compara dos sesiones con el mismo volumen pero diferente densidad y explica por qué pueden producir sensaciones y adaptaciones distintas.",
    sources: ["Tudor O. Bompa · Teoría y metodología del entrenamiento", "Yuri Verkhoshansky · Teoría y metodología del entrenamiento deportivo", "Gillone · Entrenamiento combinado de fuerza y resistencia", "Baechle & Earle · Principios del entrenamiento de la fuerza y del acondicionamiento físico"],
    quiz: [
      { question: "Reducir la pausa manteniendo el mismo trabajo aumenta principalmente…", options: ["La densidad", "La frecuencia semanal", "El número de ejercicios"], correct: 0, feedback: "La densidad relaciona trabajo y recuperación." },
      { question: "¿Qué aporta el RPE?", options: ["Una valoración de esfuerzo percibido", "Una medición médica obligatoria", "El número exacto de calorías"], correct: 0, feedback: "RPE ayuda a interpretar la carga interna de forma educativa." },
      { question: "Una progresión clara suele ser más fácil de interpretar cuando…", options: ["Cambias todas las variables a la vez", "Modificas una variable principal y observas la respuesta", "Eliminas la recuperación"], correct: 1, feedback: "Modificar una variable principal ayuda a relacionar decisión y respuesta." },
    ],
  },
  {
    slug: "2bach-sa3-habitos-saludables", number: 3, sa: "SA3",
    title: "Más que entrenar", subtitle: "Hábitos para una vida saludable y sostenible",
    summary: "La condición física también depende de lo que ocurre fuera de la sesión: sueño, movimiento cotidiano, hidratación, alimentación variada, recuperación, organización y bienestar.",
    visual: "habits", visualCaption: "Los hábitos se relacionan entre sí: mejorar uno puede facilitar otros y sostener mejor el entrenamiento.",
    keyIdeas: ["Dormir y recuperar forman parte del entrenamiento", "Moverse a diario no es lo mismo que entrenar", "Los hábitos deben ser sostenibles", "No usamos peso, calorías ni diagnósticos como objetivo educativo"],
    concepts: [
      { name: "Regularidad", definition: "Capacidad de mantener un hábito de forma estable en el tiempo.", example: "Acostarse en horarios similares la mayoría de días." },
      { name: "Sedentarismo", definition: "Tiempo prolongado en actividades de muy bajo gasto energético, normalmente sentado o reclinado.", example: "Varias horas seguidas de estudio sin pausas de movimiento." },
      { name: "Recuperación", definition: "Conjunto de procesos y hábitos que permiten volver a estar preparado para nuevas demandas.", example: "Dormir, alternar cargas y organizar descansos." },
      { name: "Sostenibilidad del hábito", definition: "Posibilidad real de mantener una conducta sin depender de esfuerzos extremos.", example: "Caminar 20 minutos diarios puede ser más sostenible que un reto excesivo de una semana." },
    ],
    sections: [
      { title: "Sueño y organización", paragraphs: ["La recuperación nocturna influye en las sensaciones, la atención y la capacidad para afrontar una sesión. En clase trabajamos regularidad y percepción del descanso, no diagnósticos médicos.", "Una agenda muy cargada puede hacer que el problema no sea falta de voluntad, sino una organización poco realista entre estudio, ocio, descanso y entrenamiento."] },
      { title: "Movimiento cotidiano y sedentarismo", paragraphs: ["Entrenar dos o tres días no elimina automáticamente muchas horas seguidas de sedentarismo. Las pausas activas, caminar y desplazarse de forma activa aportan movimiento cotidiano.", "La propuesta debe adaptarse a las posibilidades reales de cada persona y no convertirse en una competición de pasos."] },
      { title: "Hidratación y alimentación variada", paragraphs: ["La hidratación depende de duración, intensidad, temperatura y características individuales. Evitamos cifras universales rígidas y aprendemos a anticipar necesidades básicas.", "En alimentación trabajamos variedad, regularidad y organización alrededor de la actividad física. No usamos dietas restrictivas, conteo obligatorio de calorías ni objetivos de peso."] },
    ],
    cases: [
      { sport: "Voleibol", capacity: "Recuperación", situation: "Una jugadora entrena bien pero llega fatigada tras varias noches de sueño irregular.", proposal: "Revisar horarios de estudio y descanso antes de añadir más volumen de entrenamiento.", why: "Más carga no corrige una recuperación insuficiente.", progression: "Buscar una mejora pequeña y sostenible de regularidad durante varias semanas." },
      { sport: "Pádel", capacity: "Hidratación y pausas", situation: "Un alumno juega al aire libre en días calurosos y empieza la sesión sin planificar pausas.", proposal: "Preparar agua, pausas razonables y una rutina sencilla antes y después de jugar.", why: "La organización reduce decisiones improvisadas cuando ya existe fatiga.", progression: "Ajustar la rutina según duración, temperatura y sensaciones." },
    ],
    challenge: "Elige un hábito durante cuatro semanas. Describe situación inicial, cambio concreto, forma de seguimiento y qué reajuste harías si el plan no es sostenible.",
    extension: "Explica por qué una persona puede entrenar con regularidad y seguir teniendo un estilo de vida sedentario durante buena parte del día.",
    sources: ["Baechle & Earle · Principios del entrenamiento de la fuerza y del acondicionamiento físico", "Michael Boyle · El entrenamiento funcional aplicado a deportes", "Tudor O. Bompa · Teoría y metodología del entrenamiento"],
    quiz: [
      { question: "¿Qué afirmación es correcta?", options: ["Entrenar varios días elimina cualquier sedentarismo", "Movimiento cotidiano y entrenamiento son conceptos relacionados pero distintos", "Dormir no influye en la recuperación"], correct: 1, feedback: "Una persona puede entrenar y, a la vez, acumular muchas horas sedentarias." },
      { question: "En esta SA evitamos usar como objetivo educativo…", options: ["La regularidad del sueño", "El peso y el conteo obligatorio de calorías", "Las pausas activas"], correct: 1, feedback: "El seguimiento es educativo y no se centra en peso, calorías o diagnósticos." },
      { question: "Un hábito sostenible es aquel que…", options: ["Puede mantenerse de forma realista", "Exige cambios extremos desde el primer día", "Solo funciona durante una semana"], correct: 0, feedback: "La sostenibilidad es clave para que el cambio tenga continuidad." },
    ],
  },
  {
    slug: "2bach-sa4-evento-deportivo", number: 4, sa: "SA4",
    title: "Creamos un evento deportivo", subtitle: "De la idea a una experiencia segura, inclusiva y viable",
    summary: "Organizar un evento exige transformar una buena idea en decisiones sobre formato, tiempos, roles, recursos, seguridad, inclusión, comunicación y evaluación.",
    visual: "event", visualCaption: "Un evento funciona cuando todas sus fases están conectadas y existe margen para reajustar.",
    keyIdeas: ["El evento empieza mucho antes del primer partido", "El formato debe ajustarse a tiempo y recursos", "Los roles necesitan responsabilidades claras", "Evaluar el evento sirve para mejorarlo"],
    concepts: [
      { name: "Logística", definition: "Organización práctica de espacios, materiales, tiempos y movimientos necesarios.", example: "Preparar dos pistas, balones y rotaciones para seis equipos." },
      { name: "Cronograma", definition: "Secuencia temporal de tareas y actividades.", example: "Montaje, recepción, partidos, recogida y evaluación." },
      { name: "Plan de contingencia", definition: "Alternativa preparada para responder a una incidencia previsible.", example: "Reducir tiempo de partidos si existe un retraso acumulado." },
      { name: "Inclusión", definition: "Diseño que favorece la participación de personas con características y niveles distintos.", example: "Ofrecer roles, reglas y tareas que no dependan de una única habilidad." },
    ],
    sections: [
      { title: "Definir el propósito", paragraphs: ["Antes de elegir un formato hay que aclarar para qué se organiza el evento y quién participará. Un torneo competitivo, una jornada recreativa y un evento solidario necesitan decisiones diferentes.", "El propósito orienta reglas, duración, comunicación y criterios de evaluación."] },
      { title: "Diseñar con límites reales", paragraphs: ["Tiempo, instalaciones, número de participantes y material son restricciones que obligan a elegir. Un formato excelente en teoría puede ser inviable si no cabe en el horario disponible.", "La organización debe calcular transiciones, tiempos muertos y tareas de montaje, no solo el tiempo de juego."] },
      { title: "Seguridad, inclusión y evaluación", paragraphs: ["La prevención de incidencias incluye revisar espacio, material, aforo, normas y responsabilidades. En un contexto escolar también debemos prever formas de participación inclusivas.", "Después del evento conviene recoger evidencias: puntualidad, participación, incidencias, funcionamiento de roles y propuestas de mejora."] },
    ],
    cases: [
      { sport: "Voleibol", capacity: "Organización de torneo", situation: "Hay 6 equipos, 2 pistas y 90 minutos disponibles.", proposal: "Comparar liguilla, grupos y partidos a tiempo antes de elegir el formato.", why: "El formato debe garantizar participación suficiente sin superar el tiempo real.", progression: "Probar el cronograma con tiempos de transición y añadir un margen para retrasos." },
      { sport: "Atletismo", capacity: "Evento por estaciones", situation: "Una jornada combina velocidad, salto y lanzamiento con grupos numerosos.", proposal: "Crear estaciones, rotaciones, responsables de material y registro, y un orden claro de circulación.", why: "Las estaciones distribuyen espacio y reducen esperas si la logística está bien calculada.", progression: "Simular una rotación antes del evento y ajustar tiempos según la prueba." },
    ],
    challenge: "Diseña en una sola página propósito, participantes, formato, recursos, cronograma, medidas de seguridad y criterio de evaluación para un evento escolar.",
    extension: "Compara eliminación directa y fase de grupos para un evento de 90 minutos. Explica qué gana y qué pierde cada formato en participación, emoción y logística.",
    sources: ["Jeroni Saura Aranda · Ejercicios en circuito", "Michael Boyle · El entrenamiento funcional aplicado a deportes", "Baechle & Earle · Principios del entrenamiento de la fuerza y del acondicionamiento físico"],
    quiz: [
      { question: "¿Qué debería decidirse antes del formato competitivo?", options: ["El propósito y los destinatarios", "El color de los carteles", "El equipo ganador"], correct: 0, feedback: "El propósito orienta las decisiones posteriores." },
      { question: "Un plan de contingencia sirve para…", options: ["Prever alternativas ante incidencias", "Eliminar el cronograma", "Evitar repartir roles"], correct: 0, feedback: "Anticipar respuestas mejora la capacidad de organización." },
      { question: "¿Qué evidencia ayuda a evaluar un evento?", options: ["Solo quién ganó", "Participación, tiempos, incidencias y funcionamiento de roles", "Únicamente el presupuesto"], correct: 1, feedback: "La evaluación debe revisar el funcionamiento global del evento." },
    ],
  },
  {
    slug: "2bach-sa5-cultura-cuerpo-expresion", number: 5, sa: "SA5",
    title: "Extremadura se mueve", subtitle: "Cultura, cuerpo y expresión",
    summary: "El cuerpo no solo produce rendimiento: también comunica, crea significados y participa en manifestaciones culturales. Este módulo analiza cómo espacio, tiempo, energía y relación transforman una propuesta expresiva.",
    visual: "expression", visualCaption: "La expresión surge al combinar cuerpo, espacio, tiempo, emoción y cultura con una intención comunicativa.",
    keyIdeas: ["El movimiento puede comunicar sin palabras", "El espacio y el ritmo cambian el significado", "La creación colectiva exige acuerdos", "La cultura corporal también forma parte del patrimonio"],
    concepts: [
      { name: "Comunicación no verbal", definition: "Transmisión de significado mediante postura, gesto, movimiento, mirada o distancia.", example: "Representar tensión aumentando rigidez, velocidad y proximidad." },
      { name: "Nivel", definition: "Altura corporal utilizada en el espacio.", example: "Combinar acciones de suelo, nivel medio y saltos." },
      { name: "Trayectoria", definition: "Recorrido que realiza el cuerpo por el espacio.", example: "Desplazarse en línea, curva o zigzag para crear distintas sensaciones." },
      { name: "Creatividad motriz", definition: "Capacidad para producir respuestas corporales variadas y con intención.", example: "Transformar un gesto cotidiano en una secuencia expresiva." },
    ],
    sections: [
      { title: "El cuerpo como lenguaje", paragraphs: ["Una misma acción puede comunicar sensaciones distintas según velocidad, amplitud, postura y energía. Por eso la expresión corporal no consiste únicamente en memorizar pasos.", "El espectador interpreta relaciones entre movimientos; la intención debe ser reconocible aunque no exista texto hablado."] },
      { title: "Espacio, tiempo y relación", paragraphs: ["Cambiar distancias, formaciones y niveles modifica la percepción de una escena. El tiempo aporta ritmo, pausas, aceleraciones y contrastes.", "En grupo, sincronizar no significa que todos hagan siempre lo mismo: también puede existir canon, oposición, eco o alternancia."] },
      { title: "Cultura y creación", paragraphs: ["Las prácticas corporales pueden relacionarse con celebraciones, juegos, músicas, oficios, paisajes o símbolos de una comunidad. El objetivo no es copiar una tradición de forma superficial, sino comprender qué queremos representar y cómo hacerlo con respeto."] },
    ],
    cases: [
      { sport: "Expresión", capacity: "Contraste corporal", situation: "Un grupo debe representar tensión y calma sin palabras.", proposal: "Modificar velocidad, amplitud, niveles y distancia entre participantes.", why: "Las variables expresivas cambian el significado incluso sin cambiar el gesto básico.", progression: "Añadir transiciones y un elemento cultural coherente con la idea." },
      { sport: "Creación grupal", capacity: "Composición", situation: "Se diseña una secuencia de 60–90 segundos vinculada a Extremadura.", proposal: "Incluir entrada, dos formaciones, contraste, cambio de nivel, sincronización y final.", why: "Una estructura clara facilita que la intención llegue al público.", progression: "Grabar un ensayo, analizar legibilidad y ajustar lo que no se entiende." },
    ],
    challenge: "Crea una secuencia breve que comunique una idea vinculada a Extremadura sin utilizar texto durante la representación. Justifica qué recursos corporales y espaciales elegiste.",
    extension: "Explica cómo cambiaría el significado de una misma secuencia si se realizara muy lentamente, con gran distancia entre intérpretes o en un espacio reducido.",
    sources: ["Materiales docentes de Educación Física y expresión corporal del proyecto", "Jeroni Saura Aranda · Propuestas de organización de tareas y circuitos"],
    quiz: [
      { question: "¿Qué puede modificar el significado de un movimiento?", options: ["Solo la ropa", "Velocidad, amplitud, espacio y energía", "Únicamente la música"], correct: 1, feedback: "Las variables corporales y espaciales transforman la comunicación." },
      { question: "Sincronización grupal significa necesariamente…", options: ["Hacer siempre exactamente lo mismo", "Coordinar acciones, aunque puedan existir alternancias o canon", "No utilizar espacio"], correct: 1, feedback: "La coordinación grupal admite diferentes relaciones temporales." },
      { question: "Una propuesta cultural respetuosa debería…", options: ["Copiar símbolos sin contexto", "Comprender qué representa y justificar su uso", "Evitar cualquier referencia local"], correct: 1, feedback: "La intención y el contexto son parte de una creación responsable." },
    ],
  },
  {
    slug: "2bach-sa6-comunidad-activa", number: 6, sa: "SA6",
    title: "Muévete por tu entorno", subtitle: "Diseñar una comunidad más activa, accesible e inclusiva",
    summary: "La actividad física también depende del entorno. Analizar barreras y facilitadores permite pasar del cambio individual a pequeñas intervenciones que amplían oportunidades de movimiento para otras personas.",
    visual: "community", visualCaption: "La persona y el entorno se influyen mutuamente: cambiar el contexto puede facilitar hábitos activos.",
    keyIdeas: ["El entorno puede facilitar o dificultar el movimiento", "Una intervención empieza por detectar una necesidad", "Incluir supone analizar barreras", "El impacto debe observarse, no suponerse"],
    concepts: [
      { name: "Barrera", definition: "Condición que dificulta participar o mantenerse activo.", example: "Falta de espacio, horarios poco adecuados o miedo al juicio." },
      { name: "Facilitador", definition: "Condición que hace más probable la participación.", example: "Actividad cercana, gratuita, accesible y con opciones de diferente nivel." },
      { name: "Movilidad activa", definition: "Desplazamiento en el que caminar o pedalear forma parte del trayecto.", example: "Ir andando a un lugar cuando distancia y seguridad lo permiten." },
      { name: "Impacto", definition: "Cambio observable producido por una intervención.", example: "Aumento de participación en un recreo activo y reducción de tiempos de espera." },
    ],
    sections: [
      { title: "La actividad física no depende solo de la voluntad", paragraphs: ["Distancia, seguridad, accesibilidad, horarios, compañía, coste y variedad de propuestas influyen sobre las decisiones. Culpar únicamente a la motivación individual oculta esas condiciones.", "Analizar el entorno permite identificar cambios pequeños que pueden facilitar la participación."] },
      { title: "De la necesidad a la intervención", paragraphs: ["Una intervención sencilla comienza con una necesidad concreta y un grupo destinatario. Después se diseña una propuesta viable con recursos, responsables, comunicación y una forma de evaluar el resultado.", "No toda buena idea funciona en todos los contextos: hay que probar, recoger información y reajustar."] },
      { title: "Inclusión y participación", paragraphs: ["Una propuesta abierta puede seguir siendo excluyente si exige una habilidad muy alta, si los grupos están cerrados o si no existen roles alternativos. Preguntar por barreras reales mejora el diseño."] },
    ],
    cases: [
      { sport: "Recreo activo", capacity: "Participación", situation: "Parte del alumnado no entra en los torneos del recreo.", proposal: "Investigar barreras y ofrecer propuestas variadas, niveles de entrada y actividades no competitivas.", why: "Añadir otro torneo similar no resuelve necesariamente la falta de participación.", progression: "Probar dos semanas, recoger participación y opiniones, y reajustar." },
      { sport: "Movilidad activa", capacity: "Entorno", situation: "Se estudia si una ruta al centro puede realizarse andando o en bicicleta.", proposal: "Analizar distancia, tiempo, cruces, seguridad, accesibilidad y alternativas.", why: "La viabilidad depende del contexto, no de una recomendación universal.", progression: "Diseñar una ruta piloto y evaluar dificultades reales antes de ampliarla." },
    ],
    challenge: "Diseña una intervención pequeña para clase, centro, familia o barrio: necesidad, destinatarios, propuesta, recursos, acción y dos indicadores para evaluar el impacto.",
    extension: "Explica por qué una actividad gratuita y cercana todavía podría resultar poco inclusiva y propone dos cambios para reducir barreras.",
    sources: ["Materiales del proyecto de Educación Física · Maristas Badajoz", "Michael Boyle · El entrenamiento funcional aplicado a deportes", "Baechle & Earle · Principios del entrenamiento de la fuerza y del acondicionamiento físico"],
    quiz: [
      { question: "Una barrera para participar puede ser…", options: ["Solo la falta de motivación", "Horarios, accesibilidad o miedo al juicio", "Únicamente el clima"], correct: 1, feedback: "Las barreras pueden ser personales, sociales y ambientales." },
      { question: "¿Qué debería ocurrir después de una intervención?", options: ["Dar por hecho que funcionó", "Recoger información y valorar impacto", "Evitar cualquier cambio"], correct: 1, feedback: "Evaluar permite comprobar si la propuesta produjo el efecto esperado." },
      { question: "Una propuesta inclusiva…", options: ["Debe considerar diferentes barreras y formas de participación", "Tiene que ser competitiva", "No necesita adaptación"], correct: 0, feedback: "La inclusión exige diseñar oportunidades reales para perfiles diferentes." },
    ],
  },
];

export function getSecondYearTheoryTopic(slug?: string) {
  return secondYearTheoryTopics.find((topic) => topic.slug === slug) ?? secondYearTheoryTopics[0];
}
