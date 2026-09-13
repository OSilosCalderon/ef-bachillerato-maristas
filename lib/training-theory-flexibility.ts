import type { TrainingTheoryTopic } from "@/lib/training-theory-topics";

export const flexibilityTheoryTopic: TrainingTheoryTopic = {
  slug: "flexibilidad-y-amplitud-de-movimiento",
  number: 9,
  title: "Flexibilidad y amplitud de movimiento",
  subtitle: "Comprender el estiramiento, progresar con control y valorar los cambios",
  summary: "Aprende qué ocurre cuando estiramos, por qué la velocidad del estiramiento importa y cómo organizar un trabajo de flexibilidad que pueda registrarse y evaluarse.",
  keyIdeas: [
    "La flexibilidad se trabaja con progresión y control",
    "Un estiramiento brusco puede activar una respuesta refleja de protección",
    "La tensión y la relajación pueden combinarse en técnicas postisométricas",
    "Evaluar antes y después ayuda a comprobar la evolución",
  ],
  sections: [
    {
      title: "¿Qué entendemos por flexibilidad?",
      paragraphs: [
        "En estos apuntes utilizaremos la flexibilidad como una forma práctica de referirnos a la capacidad de alcanzar una amplitud de movimiento útil. No se trata de llegar lo más lejos posible a cualquier precio, sino de progresar con control y reconocer qué articulaciones y grupos musculares intervienen en cada movimiento.",
        "La amplitud que una persona alcanza no depende únicamente de un músculo aislado. La posición corporal, el control neuromuscular y la respuesta del organismo al estiramiento también influyen en el movimiento que podemos realizar.",
      ],
    },
    {
      title: "El reflejo de estiramiento: por qué no conviene forzar de golpe",
      paragraphs: [
        "Tarantino explica que los husos musculares detectan la longitud del músculo y la velocidad con la que aumenta esa longitud. Cuando el estiramiento es suficientemente rápido o excesivo, pueden desencadenar una contracción refleja como mecanismo de protección: es el reflejo miotático o reflejo de estiramiento.",
        "Por eso, para estudiar un trabajo de flexibilidad mantenido tiene sentido alcanzar la posición de forma progresiva y controlada, evitando rebotes o gestos bruscos que obliguen al organismo a responder de forma defensiva.",
      ],
    },
    {
      title: "Estiramiento mantenido y progresivo",
      paragraphs: [
        "En el material de Tarantino se describe que, al llegar lentamente a una posición de estiramiento y mantenerla durante unos segundos, cambia la respuesta refleja y puede favorecerse una mayor relajación muscular. Para el alumnado, la idea fundamental es sencilla: buscar tensión tolerable y controlada, nunca dolor, y mantener una técnica estable.",
        "El objetivo no es competir por quién llega más lejos. Debemos poder repetir el ejercicio con una posición reconocible y comparar nuestra propia evolución.",
      ],
      bullets: [
        "Entrar en la posición de forma gradual.",
        "Mantener una respiración normal y una postura controlada.",
        "Evitar rebotes y movimientos bruscos cuando el objetivo sea un estiramiento mantenido.",
        "Interrumpir el ejercicio si aparece dolor agudo.",
      ],
    },
    {
      title: "Tensión-relajación o trabajo postisométrico",
      paragraphs: [
        "Tarantino presenta técnicas en las que se alternan periodos breves de contracción de la musculatura con periodos de relajación y estiramiento. En el texto aparecen como estiramientos postisométricos o en tensión activa y se relacionan con mecanismos propioceptivos.",
        "En Bachillerato nos interesa comprender el principio, no convertirlo en una técnica clínica: una fase de tensión controlada puede ir seguida de relajación y de una nueva aproximación al estiramiento. Se realizará siempre con consignas sencillas y sin aplicar fuerzas máximas.",
      ],
    },
    {
      title: "Evaluar para aprender",
      paragraphs: [
        "Cappa utiliza la flexión anterior de tronco como una prueba de flexibilidad general de la zona lumbar e isquiotibial. En nuestro proyecto, los tests de flexibilidad de septiembre y diciembre cumplen una función semejante: aportar un punto de partida y permitir una comparación posterior.",
        "Una marca en un test debe interpretarse como información sobre esa prueba y esa zona corporal, no como una etiqueta sobre toda la condición física de la persona. Registrar el método utilizado y repetirlo en condiciones semejantes hace la comparación más útil.",
      ],
    },
  ],
  concepts: [
    {
      name: "Flexibilidad",
      definition: "Capacidad que utilizaremos para estudiar y mejorar una amplitud de movimiento útil y controlada.",
      example: "Alcanzar progresivamente una mayor flexión de tronco sin rebotes ni dolor.",
    },
    {
      name: "Amplitud de movimiento",
      definition: "Recorrido que puede realizar una articulación o conjunto de articulaciones durante una acción.",
      example: "La amplitud de flexión de cadera y tronco en un test sentado.",
    },
    {
      name: "Huso muscular",
      definition: "Receptor sensorial muscular que informa, entre otros aspectos, sobre la longitud muscular y la velocidad del estiramiento.",
      example: "Un estiramiento muy brusco puede activar una respuesta refleja de contracción.",
    },
    {
      name: "Reflejo miotático",
      definition: "Respuesta refleja de contracción que puede aparecer ante un estiramiento brusco o excesivo como mecanismo de protección.",
      example: "La musculatura se opone automáticamente a un tirón repentino.",
    },
    {
      name: "Estiramiento postisométrico",
      definition: "Trabajo que combina una breve fase de tensión con relajación posterior y una nueva fase de estiramiento controlado.",
      example: "Tensión suave y controlada, relajación y nueva aproximación progresiva al rango de estiramiento.",
    },
  ],
  challenge: "Elige una de las pruebas de flexibilidad que realizas en SA1. Describe qué zona corporal evalúa, anota tu resultado inicial y propone dos ejercicios de trabajo controlado que podrías registrar durante varias semanas antes de repetir la prueba en diciembre.",
  secondYearExtension: "Compara el fundamento neuromuscular de un estiramiento mantenido y progresivo con una técnica de tensión-relajación. Después, sitúa el trabajo de flexibilidad dentro de un microciclo y justifica cuándo lo utilizarías según el objetivo de la sesión.",
  sources: [
    "Francisco Tarantino · Entrenamiento propioceptivo",
    "Darío Cappa · Entrenamiento de la potencia muscular",
  ],
  quiz: [
    {
      question: "¿Qué puede ocurrir ante un estiramiento suficientemente brusco o excesivo?",
      options: [
        "Puede activarse una contracción refleja de protección",
        "El músculo pierde automáticamente toda tensión",
        "Siempre aumenta de inmediato la flexibilidad",
      ],
      correct: 0,
      feedback: "Los husos musculares pueden desencadenar el reflejo miotático ante un incremento rápido o excesivo de la longitud muscular.",
    },
    {
      question: "¿Qué caracteriza al trabajo postisométrico descrito en el material?",
      options: [
        "Alternar una fase breve de tensión con relajación y estiramiento posterior",
        "Realizar rebotes cada vez más rápidos",
        "Mantener siempre una contracción máxima sin relajación",
      ],
      correct: 0,
      feedback: "La alternancia tensión-relajación es la idea central del estiramiento postisométrico o en tensión activa descrito por Tarantino.",
    },
    {
      question: "¿Cómo debemos interpretar el resultado de una prueba de flexibilidad?",
      options: [
        "Como información de esa prueba y de las zonas implicadas, útil para comparar la evolución",
        "Como una medida exacta de toda la condición física",
        "Como un dato que no hace falta repetir",
      ],
      correct: 0,
      feedback: "El test es útil si se interpreta de forma específica y se repite en condiciones comparables para observar cambios.",
    },
  ],
};
