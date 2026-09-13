export type TheoryConcept = {
  name: string;
  definition: string;
  example: string;
};

export type TheorySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
  feedback: string;
};

export type TrainingTheoryTopic = {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  keyIdeas: string[];
  sections: TheorySection[];
  concepts?: TheoryConcept[];
  challenge: string;
  secondYearExtension: string;
  sources: string[];
  quiz: QuizQuestion[];
};

export const trainingTheoryTopics: TrainingTheoryTopic[] = [
  {
    slug: "adaptacion-y-supercompensacion",
    number: 1,
    title: "Entrenar es adaptarse",
    subtitle: "Estímulo, fatiga, recuperación y supercompensación",
    summary: "Comprende por qué mejorar no depende de entrenar más, sino de aplicar una carga adecuada y recuperar antes de volver a estimular.",
    keyIdeas: ["El entrenamiento provoca adaptación", "La fatiga es temporal", "La recuperación forma parte del plan", "Más no siempre es mejor"],
    sections: [
      { title: "¿Qué ocurre cuando entrenamos?", paragraphs: ["Una sesión altera temporalmente el equilibrio del organismo. Durante el esfuerzo aparece fatiga y el rendimiento inmediato puede disminuir. Después, con descanso, alimentación y sueño suficientes, el organismo recupera sus recursos y se adapta.", "La supercompensación es una forma sencilla de representar ese proceso: tras recuperar, determinadas capacidades pueden situarse temporalmente por encima del nivel inicial."] },
      { title: "Aplicación práctica", paragraphs: ["Si una nueva carga llega demasiado pronto, se acumula fatiga. Si llega demasiado tarde y no existe continuidad, se pierde parte de la adaptación. El objetivo es encadenar estímulos y recuperaciones de forma razonable."], bullets: ["Registrar sensaciones y esfuerzo percibido.", "Alternar días exigentes con trabajo más suave o descanso.", "Dormir y alimentarse adecuadamente.", "Modificar el plan si el rendimiento cae varios días seguidos."] },
      { title: "Una idea de seguridad", paragraphs: ["Dolor agudo, mareo, malestar importante o empeoramiento persistente no son señales que deban ignorarse para 'entrenar más'. En Educación Física buscamos mejorar salud y autonomía, no soportar cargas de alto rendimiento."] },
    ],
    challenge: "Explica con tus palabras qué diferencia hay entre cansarse durante una sesión y mejorar gracias al entrenamiento.",
    secondYearExtension: "Relaciona la supercompensación con la organización de varios microciclos: no todos los días deben perseguir el mismo objetivo ni tener la misma exigencia.",
    sources: ["Tudor O. Bompa · Periodización. Teoría y metodología del entrenamiento", "Yuri Verkhoshansky · Teoría y metodología del entrenamiento deportivo"],
    quiz: [
      { question: "¿Cuándo se produce la adaptación?", options: ["Solo durante el esfuerzo", "Durante el proceso de recuperación posterior al estímulo", "Únicamente cuando entrenamos al máximo"], correct: 1, feedback: "El estímulo inicia el proceso; la recuperación permite consolidar las adaptaciones." },
      { question: "¿Qué puede ocurrir si acumulamos cargas exigentes sin recuperar?", options: ["Siempre mejoramos más rápido", "Puede aumentar la fatiga y disminuir el rendimiento", "La recuperación deja de ser necesaria"], correct: 1, feedback: "La carga necesita una recuperación proporcional." },
      { question: "¿Qué forma parte del entrenamiento?", options: ["Solo las series y repeticiones", "Carga y recuperación", "Solo la competición"], correct: 1, feedback: "El descanso también se programa." },
    ],
  },
  {
    slug: "principios-del-entrenamiento",
    number: 2,
    title: "Principios del entrenamiento",
    subtitle: "Cómo orientar un plan para que tenga sentido",
    summary: "Individualización, progresión, sobrecarga, continuidad, variedad, especificidad y recuperación son reglas para organizar el entrenamiento.",
    keyIdeas: ["Cada persona responde de forma diferente", "La carga debe progresar", "La especificidad conecta objetivo y tarea", "La continuidad consolida mejoras"],
    sections: [
      { title: "Individualización", paragraphs: ["La misma tarea puede ser fácil para una persona y excesiva para otra. Edad, experiencia, condición física, descanso, técnica y objetivo modifican la respuesta al entrenamiento."] },
      { title: "Progresión y sobrecarga", paragraphs: ["Para seguir mejorando, el estímulo debe crecer de forma gradual. Podemos progresar aumentando repeticiones, series, duración, dificultad, velocidad o carga, pero no es necesario aumentar todo a la vez."] },
      { title: "Continuidad, variedad y especificidad", paragraphs: ["La continuidad permite acumular adaptaciones. La variedad evita repetir siempre el mismo estímulo. La especificidad recuerda que las mejoras dependen del tipo de trabajo realizado: un salto, una carrera larga y una plancha exigen respuestas diferentes."] },
      { title: "Recuperación", paragraphs: ["La recuperación permite repetir estímulos con calidad. En un plan responsable, descanso y carga no compiten: se complementan."] },
    ],
    challenge: "Elige un objetivo (por ejemplo, mejorar el salto horizontal) y escribe cómo aplicarías progresión, especificidad e individualización.",
    secondYearExtension: "Analiza un plan semanal y detecta qué principios se respetan y cuáles podrían entrar en conflicto si aumentamos simultáneamente volumen e intensidad.",
    sources: ["Tudor O. Bompa · Periodización. Teoría y metodología del entrenamiento", "Yuri Verkhoshansky · Teoría y metodología del entrenamiento deportivo"],
    quiz: [
      { question: "¿Qué principio explica que dos alumnos no tengan que usar la misma carga?", options: ["Individualización", "Variedad", "Continuidad"], correct: 0, feedback: "La carga se ajusta a las características de cada persona." },
      { question: "¿Qué es progresar?", options: ["Entrenar siempre al máximo", "Aumentar gradualmente el estímulo cuando el organismo se adapta", "Cambiar de ejercicio cada día sin objetivo"], correct: 1, feedback: "La progresión debe ser gradual y coherente." },
      { question: "Si quiero mejorar aceleraciones, ¿qué principio exige incluir tareas relacionadas con acelerar?", options: ["Especificidad", "Descanso", "Variedad"], correct: 0, feedback: "El estímulo debe guardar relación con la capacidad que se pretende mejorar." },
    ],
  },
  {
    slug: "carga-y-capacidades-fisicas",
    number: 3,
    title: "Carga y capacidades físicas",
    subtitle: "Volumen, intensidad, frecuencia, densidad y recuperación",
    summary: "Aprende a describir una sesión de entrenamiento con variables que permiten compararla, modificarla y planificarla.",
    keyIdeas: ["Volumen = cuánto trabajo", "Intensidad = exigencia", "Frecuencia = cuántas sesiones", "Densidad = relación trabajo-pausa"],
    sections: [
      { title: "Variables básicas", paragraphs: ["El volumen expresa la cantidad total de trabajo: minutos, metros, repeticiones o series. La intensidad representa el grado de exigencia. La frecuencia indica cuántas sesiones realizamos y la densidad relaciona tiempo de trabajo y recuperación."] },
      { title: "Capacidades físicas", paragraphs: ["En Educación Física organizaremos el trabajo principalmente alrededor de fuerza, resistencia, velocidad y movilidad/flexibilidad, incorporando coordinación, equilibrio y estabilidad como componentes esenciales del movimiento."] },
      { title: "Registrar para poder decidir", paragraphs: ["Anotar actividad, series, repeticiones, duración, recuperación y esfuerzo percibido transforma una sesión en información útil. El diario permite comprobar si el plan realmente progresa o solo repite tareas."] },
    ],
    concepts: [
      { name: "Volumen", definition: "Cantidad total de trabajo realizado.", example: "3 series de 10 repeticiones = 30 repeticiones." },
      { name: "Intensidad", definition: "Grado de exigencia del estímulo.", example: "Un sprint es más intenso que un trote suave." },
      { name: "Frecuencia", definition: "Número de sesiones en un periodo.", example: "3 sesiones por semana." },
      { name: "Densidad", definition: "Relación entre trabajo y pausa.", example: "30 s de trabajo / 30 s de descanso." },
    ],
    challenge: "Compara dos circuitos: uno de 30 s trabajo/30 s pausa y otro de 40 s trabajo/20 s pausa. ¿Cuál tiene mayor densidad de trabajo?",
    secondYearExtension: "Diferencia carga externa (lo que se prescribe) y respuesta interna (cómo responde el organismo) y explica por qué el mismo volumen puede generar esfuerzos distintos.",
    sources: ["Darío Cappa · Entrenamiento de la potencia muscular", "Claudio A. Gillone · Entrenamiento combinado de fuerza y resistencia"],
    quiz: [
      { question: "¿Qué variable aumenta si pasamos de 2 a 4 series manteniendo lo demás?", options: ["Volumen", "Frecuencia semanal", "Velocidad"], correct: 0, feedback: "Hacemos más cantidad total de trabajo." },
      { question: "¿Qué describe 20 s de trabajo y 40 s de descanso?", options: ["Densidad", "Frecuencia", "Especificidad"], correct: 0, feedback: "La densidad relaciona trabajo y recuperación dentro de la sesión." },
      { question: "¿Por qué registrar el esfuerzo percibido?", options: ["Porque sustituye todos los demás datos", "Porque ayuda a interpretar cómo ha respondido la persona a la carga", "Porque solo importa en competición"], correct: 1, feedback: "La respuesta individual aporta contexto a la carga externa." },
    ],
  },
  {
    slug: "fuerza-y-contraccion-muscular",
    number: 4,
    title: "Fuerza y contracción muscular",
    subtitle: "Máxima, explosiva, fuerza-resistencia; isométrica, concéntrica y excéntrica",
    summary: "Un tema específico para comprender qué tipo de fuerza buscamos y qué hace el músculo durante cada fase de un ejercicio.",
    keyIdeas: ["No existe una única manifestación de fuerza", "Concéntrico y excéntrico son fases diferentes", "Isométrico genera tensión sin movimiento visible", "La potencia combina fuerza y velocidad"],
    sections: [
      { title: "Tres manifestaciones útiles en Bachillerato", paragraphs: ["La fuerza máxima es la mayor fuerza que puede producirse frente a una resistencia. La fuerza-velocidad o explosiva busca producir mucha fuerza en poco tiempo. La fuerza-resistencia permite repetir o mantener esfuerzos de fuerza durante un periodo prolongado.", "Para alumnado no necesitamos buscar levantamientos máximos. Podemos comprender estos conceptos utilizando autocargas, bandas, balones medicinales y resistencias moderadas con técnica correcta."] },
      { title: "¿Qué hace el músculo?", paragraphs: ["En una contracción isométrica hay tensión sin un cambio visible de la longitud muscular ni movimiento articular relevante. En la fase concéntrica el músculo se acorta mientras vence la resistencia. En la fase excéntrica se alarga mientras controla o frena la resistencia.", "El ciclo de estiramiento-acortamiento combina rápidamente una fase excéntrica con otra concéntrica, como ocurre en muchos saltos. Los ejercicios pliométricos de alta exigencia requieren preparación previa y no deben confundirse con 'saltar mucho'."] },
      { title: "Ejemplo: una sentadilla", paragraphs: ["Al bajar de forma controlada predomina una acción excéntrica de la musculatura extensora de cadera y rodilla. Al subir predomina la acción concéntrica. Si mantenemos una posición sin movernos, aparece un trabajo isométrico."] },
    ],
    concepts: [
      { name: "Fuerza máxima", definition: "Máxima capacidad de producir fuerza frente a una resistencia.", example: "Concepto de 1RM en entrenamiento avanzado; en clase no necesitamos realizar máximos." },
      { name: "Fuerza explosiva", definition: "Capacidad de aplicar fuerza muy rápidamente.", example: "Salto, lanzamiento de balón medicinal, salida rápida." },
      { name: "Fuerza-resistencia", definition: "Capacidad de mantener o repetir niveles de fuerza durante más tiempo.", example: "Circuito de autocargas con repeticiones controladas." },
      { name: "Isométrica", definition: "Tensión muscular sin movimiento articular apreciable.", example: "Plancha o mantener una sentadilla estática." },
      { name: "Concéntrica", definition: "El músculo se acorta al vencer la resistencia.", example: "Subir en una sentadilla o empujar el suelo en una flexión." },
      { name: "Excéntrica", definition: "El músculo se alarga mientras controla una resistencia.", example: "Bajar lentamente en una sentadilla o flexión." },
      { name: "Estiramiento-acortamiento", definition: "Fase excéntrica seguida rápidamente de una concéntrica.", example: "Salto con contramovimiento." },
    ],
    challenge: "Elige flexiones, sentadillas o zancadas. Identifica su fase concéntrica, excéntrica y una posible variante isométrica.",
    secondYearExtension: "Relaciona fuerza máxima, fuerza explosiva y velocidad de ejecución. Añade la diferencia entre contracción dinámica libre e isocinética como concepto de laboratorio/rehabilitación, no como necesidad del entrenamiento escolar.",
    sources: ["Claudio A. Gillone · Entrenamiento combinado de fuerza y resistencia", "Darío Cappa · Entrenamiento de la potencia muscular", "Baechle & Earle · Principios del entrenamiento de la fuerza y del acondicionamiento físico"],
    quiz: [
      { question: "Al bajar lentamente en una sentadilla, ¿qué acción muscular predomina en los extensores?", options: ["Excéntrica", "Concéntrica", "Solo isométrica"], correct: 0, feedback: "La musculatura produce tensión mientras se alarga y controla el descenso." },
      { question: "¿Qué ejemplo representa mejor fuerza explosiva?", options: ["Mantener una plancha", "Lanzar un balón medicinal con intención de máxima velocidad", "Caminar 30 minutos"], correct: 1, feedback: "La fuerza explosiva busca aplicar fuerza en muy poco tiempo." },
      { question: "¿Qué ocurre en una contracción isométrica?", options: ["Hay tensión sin movimiento articular apreciable", "Siempre hay máxima velocidad", "El músculo solo se relaja"], correct: 0, feedback: "La tensión puede ser alta aunque no observemos desplazamiento." },
    ],
  },
  {
    slug: "resistencia-y-metodos",
    number: 5,
    title: "Resistencia y métodos de trabajo",
    subtitle: "Continuo, intervalado, intermitente y circuitos",
    summary: "Relaciona duración, intensidad y pausas con diferentes formas de trabajar la resistencia.",
    keyIdeas: ["La resistencia no es solo correr mucho", "Duración e intensidad cambian la respuesta", "Las pausas también se programan", "El método depende del objetivo"],
    sections: [
      { title: "Resistencia y energía", paragraphs: ["Cuanto más prolongado es un esfuerzo, mayor importancia adquieren los procesos aeróbicos. Los esfuerzos breves y muy intensos exigen una gran participación neuromuscular y de vías energéticas rápidas. Entre ambos extremos existen muchas combinaciones."] },
      { title: "Métodos sencillos", paragraphs: ["El trabajo continuo mantiene el esfuerzo sin pausas relevantes. El intervalado alterna periodos de esfuerzo y recuperación relativamente estructurados. El intermitente utiliza alternancias breves y repetidas. Los circuitos permiten combinar estaciones con diferentes tareas."] },
      { title: "¿Qué elegimos?", paragraphs: ["No hay un método universalmente mejor. Elegimos según objetivo, nivel, tiempo disponible, deporte y capacidad de recuperación."] },
    ],
    concepts: [
      { name: "Continuo", definition: "Trabajo sostenido sin pausas relevantes.", example: "20-30 min de carrera cómoda." },
      { name: "Intervalado", definition: "Bloques de trabajo con recuperaciones planificadas.", example: "4 × 4 min con 2 min suaves." },
      { name: "Intermitente", definition: "Alternancias breves de esfuerzo y pausa.", example: "20 s rápido / 20 s suave." },
      { name: "Circuito", definition: "Secuencia de estaciones con tareas organizadas.", example: "6 estaciones de 30 s con 20 s de transición." },
    ],
    challenge: "Diseña dos sesiones distintas: una para resistencia continua y otra intermitente. Escribe duración, intensidad aproximada y recuperación.",
    secondYearExtension: "Explica por qué dos sesiones con la misma duración total pueden tener demandas muy diferentes si cambia la intensidad, la densidad o el tipo de ejercicio.",
    sources: ["Claudio A. Gillone · Entrenamiento combinado de fuerza y resistencia", "Jeroni Saura Aranda · 1088 ejercicios en circuito"],
    quiz: [
      { question: "¿Qué caracteriza al entrenamiento intervalado?", options: ["No tiene pausas", "Alterna trabajo y recuperación planificada", "Solo utiliza pesas"], correct: 1, feedback: "La recuperación forma parte de la estructura del método." },
      { question: "¿Un circuito puede trabajar resistencia y fuerza a la vez?", options: ["Sí, según ejercicios, intensidad y pausas", "No, nunca", "Solo si dura más de una hora"], correct: 0, feedback: "La organización del circuito determina su orientación." },
      { question: "¿Qué cambia si reducimos la pausa manteniendo el mismo trabajo?", options: ["Aumenta la densidad", "Disminuye siempre el volumen", "No cambia nada"], correct: 0, feedback: "Hay más trabajo relativo por unidad de tiempo." },
    ],
  },
  {
    slug: "velocidad-movilidad-y-estabilidad",
    number: 6,
    title: "Velocidad, movilidad y estabilidad",
    subtitle: "Moverse rápido exige preparación, control y calidad técnica",
    summary: "Integra velocidad, coordinación, movilidad, equilibrio y estabilidad en una preparación física completa.",
    keyIdeas: ["La velocidad necesita calidad", "La movilidad facilita posiciones útiles", "La estabilidad no es quedarse quieto", "La dificultad debe progresar"],
    sections: [
      { title: "Velocidad", paragraphs: ["Las aceleraciones, sprints y cambios de dirección requieren alta calidad neuromuscular. Si el objetivo es velocidad, las repeticiones deben permitir mantener una ejecución rápida y técnicamente correcta."] },
      { title: "Movilidad y calentamiento dinámico", paragraphs: ["La movilidad prepara rangos articulares útiles para la tarea. Un calentamiento dinámico puede combinar movilidad, desplazamientos, activación y progresiones de velocidad."] },
      { title: "Estabilidad y propiocepción", paragraphs: ["El trabajo denominado propioceptivo suele integrar control postural, equilibrio, estabilidad e información sensorial. Podemos progresar cambiando la base de apoyo, utilizando apoyo unilateral, modificando la información visual o incorporando resistencias sencillas.", "La progresión debe ir de tareas sencillas y controladas hacia tareas más complejas, no al revés."] },
    ],
    challenge: "Crea una progresión de equilibrio de 3 niveles: estable bilateral → unilateral → una variante con mayor dificultad. Justifica cada paso.",
    secondYearExtension: "Diseña un calentamiento de 10 minutos para una sesión de velocidad que incluya movilidad, activación, coordinación y dos progresiones de aceleración.",
    sources: ["Francisco Tarantino · Entrenamiento propioceptivo", "Michael Boyle · El entrenamiento funcional aplicado a los deportes", "Yuri Verkhoshansky · Teoría y metodología del entrenamiento deportivo"],
    quiz: [
      { question: "¿Cuál es una forma lógica de progresar un ejercicio de equilibrio?", options: ["Empezar por la variante más compleja", "Dominar una variante sencilla y después reducir la base o pasar a apoyo unilateral", "Cerrar los ojos siempre desde el primer intento"], correct: 1, feedback: "La complejidad se añade cuando existe control de la tarea básica." },
      { question: "Si buscamos velocidad de calidad, ¿qué es importante?", options: ["Mantener técnica y velocidad de ejecución", "Acumular fatiga hasta moverse lento", "Eliminar todas las pausas"], correct: 0, feedback: "La velocidad necesita repeticiones de calidad y recuperación suficiente." },
      { question: "¿Propiocepción y estabilidad son exactamente lo mismo?", options: ["No; la propiocepción participa en la estabilidad junto a otros mecanismos", "Sí, son sinónimos perfectos", "La propiocepción solo existe al cerrar los ojos"], correct: 0, feedback: "La estabilidad integra varias fuentes de información y control." },
    ],
  },
  {
    slug: "planificacion-del-entrenamiento",
    number: 7,
    title: "Planificación del entrenamiento",
    subtitle: "De la sesión al microciclo, mesociclo y macrociclo",
    summary: "Organiza objetivos y cargas en el tiempo en lugar de improvisar cada sesión de forma aislada.",
    keyIdeas: ["Planificar es decidir antes de entrenar", "Cada sesión necesita objetivo", "Los microciclos conectan varias sesiones", "La evaluación permite corregir"],
    sections: [
      { title: "La sesión", paragraphs: ["Es la unidad práctica básica. Debe tener un objetivo, una estructura y unas cargas coherentes. En Educación Física podemos organizarla en activación inicial, parte principal y vuelta a la calma/reflexión."] },
      { title: "Microciclo, mesociclo y macrociclo", paragraphs: ["Un microciclo organiza varios días, habitualmente alrededor de una semana. Varios microciclos forman bloques de trabajo más amplios o mesociclos. El macrociclo organiza un periodo largo con uno o varios objetivos principales."] },
      { title: "Planificar también es revisar", paragraphs: ["Un plan no es una promesa inamovible. Los datos del diario, las sensaciones y los test permiten modificar el volumen, la intensidad, los ejercicios o la recuperación."] },
    ],
    challenge: "Diseña un microciclo de 7 días con 3 sesiones. Escribe objetivo principal de cada día y evita colocar tres cargas máximas consecutivas.",
    secondYearExtension: "Construye un mesociclo de cuatro microciclos con una progresión de carga y una semana de menor exigencia o recuperación relativa.",
    sources: ["Tudor O. Bompa · Periodización. Teoría y metodología del entrenamiento", "Darío Cappa · Entrenamiento de la potencia muscular"],
    quiz: [
      { question: "¿Qué unidad suele organizar varios días de entrenamiento?", options: ["Microciclo", "Una repetición", "Un test aislado"], correct: 0, feedback: "El microciclo conecta varias sesiones con una lógica común." },
      { question: "¿Puede modificarse un plan después de empezarlo?", options: ["Sí, si la evaluación muestra que es necesario", "No, nunca", "Solo al final del curso"], correct: 0, feedback: "Planificar incluye controlar y corregir." },
      { question: "¿Qué debe aparecer antes de elegir ejercicios?", options: ["Un objetivo", "Una marca de ropa", "La máxima carga posible"], correct: 0, feedback: "Los medios se seleccionan en función del objetivo." },
    ],
  },
  {
    slug: "periodizacion-y-plan-personal",
    number: 8,
    title: "Periodización y plan personal",
    subtitle: "Distribuir el entrenamiento para llegar preparado al objetivo",
    summary: "Aprende a ordenar fases, combinar capacidades y usar la evaluación antes/después para valorar si el plan ha funcionado.",
    keyIdeas: ["No entrenamos igual todo el año", "Volumen e intensidad cambian", "La especificidad aumenta según el objetivo", "Evaluar antes y después permite aprender"],
    sections: [
      { title: "Fases de una periodización sencilla", paragraphs: ["Podemos comprender la periodización con una secuencia educativa: preparación general, preparación específica, fase de realización o puesta a punto y transición/recuperación. Las fases no son compartimentos rígidos, sino una forma de ordenar prioridades."] },
      { title: "Fuerza y resistencia en el mismo plan", paragraphs: ["Muchos deportes y objetivos de salud necesitan fuerza y resistencia. El reto es combinar ambas capacidades sin convertir todas las sesiones en entrenamientos máximos. La elección del orden, la intensidad y la recuperación depende del objetivo."] },
      { title: "Nuestro proyecto de condición física", paragraphs: ["En 1º podemos usar septiembre como evaluación inicial, registrar sesiones y repetir los test en diciembre. El valor educativo no está solo en mejorar una marca: está en justificar el plan, cumplirlo, registrar lo realizado y analizar el antes y el después."] },
      { title: "Pensar como entrenador/a", paragraphs: ["Una buena planificación responde: ¿qué quiero mejorar?, ¿cómo lo voy a medir?, ¿qué ejercicios utilizaré?, ¿cuántas veces por semana?, ¿cómo progresaré?, ¿cómo recuperaré? y ¿qué haré si los datos no evolucionan como esperaba?"] },
    ],
    challenge: "Escribe un objetivo medible para 6-8 semanas y crea una primera propuesta de frecuencia, ejercicios, progresión y forma de evaluación.",
    secondYearExtension: "Compara una periodización lineal sencilla con una organización por bloques de objetivos. No se trata de memorizar modelos, sino de justificar por qué cambia la prioridad de las capacidades a lo largo del tiempo.",
    sources: ["Tudor O. Bompa · Periodización. Teoría y metodología del entrenamiento", "Yuri Verkhoshansky · Teoría y metodología del entrenamiento deportivo", "Claudio A. Gillone · Entrenamiento combinado de fuerza y resistencia"],
    quiz: [
      { question: "¿Qué significa periodizar?", options: ["Repetir siempre la misma semana", "Distribuir objetivos y cargas en fases a lo largo del tiempo", "Entrenar solo antes de una prueba"], correct: 1, feedback: "La periodización organiza prioridades y cargas en el tiempo." },
      { question: "¿Por qué repetir una evaluación después del plan?", options: ["Para comparar y valorar el proceso", "Solo para poner una nota", "Porque sustituye el diario"], correct: 0, feedback: "El antes/después ayuda a comprobar la evolución y revisar decisiones." },
      { question: "¿Qué debería guiar la combinación de fuerza y resistencia?", options: ["El objetivo, el nivel y la recuperación", "Hacer siempre ambas al máximo", "Elegir al azar"], correct: 0, feedback: "La combinación se planifica según las necesidades reales." },
    ],
  },
];
