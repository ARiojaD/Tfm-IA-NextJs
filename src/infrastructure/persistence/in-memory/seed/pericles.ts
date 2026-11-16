import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-pericles";

// Su año de nacimiento es aproximado (hacia el 495 a.C.).

export const periclesTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "pericles",
  title: "Pericles",
  era: "ANCIENT_GREECE",
  category: "PEOPLE",
  summary:
    "El político que guio la democracia ateniense en su época de esplendor: estratego durante quince años seguidos, impulsor del Partenón y protagonista del comienzo de la Guerra del Peloponeso.",
  period: { start: { year: -495 }, end: { year: -429 } },
  introduction: [
    "Pericles nació hacia el 495 a.C. en una familia aristocrática de Atenas: su padre, Jantipo, fue general en las Guerras Médicas, y su madre, Agarista, era sobrina de Clístenes, el reformador que había establecido la democracia. Recibió una educación excepcional, con maestros como el músico Damón y el filósofo Anaxágoras.",
    "Desde el 461 a.C., tras el ostracismo de su rival Cimón, fue la figura dominante de la política ateniense. A partir del 443 a.C. fue elegido estratego quince años seguidos, y gobernó gracias a su oratoria y al apoyo de la asamblea. Impulsó el pago a los ciudadanos que servían como jueces, lo que permitió participar a los más pobres, y usó el tesoro de la Liga de Delos para reconstruir la Acrópolis: el Partenón, comenzado en el 447 a.C., es su gran símbolo.",
    "Su política imperial y la rivalidad con Esparta desembocaron en la Guerra del Peloponeso en el 431 a.C. Pericles refugió a la población del Ática tras las murallas, confiando en la flota, y pronunció la oración fúnebre por los primeros caídos que recoge el historiador Tucídides, un célebre elogio de la democracia. Pero en el 430 a.C. estalló una epidemia en la ciudad abarrotada: Pericles fue destituido y multado, reelegido poco después y murió a causa de la peste en el 429 a.C.",
  ],
  keyFacts: [
    { label: "Nacimiento", value: "Hacia el 495 a.C., Atenas" },
    { label: "Muerte", value: "429 a.C., Atenas, víctima de la peste" },
    { label: "Familia", value: "Hijo de Jantipo y de Agarista, de la familia de los Alcmeónidas" },
    { label: "Cargo", value: "Estratego, elegido quince años seguidos desde el 443 a.C." },
    { label: "Obras", value: "El Partenón y la reconstrucción de la Acrópolis" },
    { label: "Pareja", value: "Aspasia de Mileto" },
  ],
  image: catalogImage("pericles-busto"),
  relatedTopicIds: ["topic-classical-athens"],
  status: "PUBLISHED",
});

export const periclesEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-pericles-birth",
    topicId: TOPIC_ID,
    title: "Nacimiento de Pericles",
    date: { year: -495 },
    era: "ANCIENT_GREECE",
    description: "Nace en Atenas en el seno de la familia de los Alcmeónidas, una de las más influyentes de la ciudad.",
  },
  {
    id: "event-pericles-cimon",
    topicId: TOPIC_ID,
    title: "Ostracismo de Cimón",
    date: { year: -461 },
    era: "ANCIENT_GREECE",
    description: "Con su rival desterrado, Pericles se convierte en el líder del partido democrático.",
  },
  {
    id: "event-pericles-citizenship",
    topicId: TOPIC_ID,
    title: "Ley de ciudadanía",
    date: { year: -451 },
    era: "ANCIENT_GREECE",
    description: "A propuesta de Pericles, solo son ciudadanos atenienses los hijos de padre y madre atenienses.",
  },
  {
    id: "event-pericles-parthenon",
    topicId: TOPIC_ID,
    title: "Comienza el Partenón",
    date: { year: -447 },
    era: "ANCIENT_GREECE",
    description: "Empiezan las obras del gran templo de Atenea en la Acrópolis, dirigidas por el escultor Fidias.",
  },
  {
    id: "event-pericles-strategos",
    topicId: TOPIC_ID,
    title: "Quince años de estrategia",
    date: { year: -443 },
    era: "ANCIENT_GREECE",
    description: "Tras el ostracismo de su rival Tucídides de Melesias, Pericles es elegido estratego cada año hasta su muerte.",
  },
  {
    id: "event-pericles-war",
    topicId: TOPIC_ID,
    title: "Guerra del Peloponeso y oración fúnebre",
    date: { year: -431 },
    era: "ANCIENT_GREECE",
    description: "Comienza la guerra contra Esparta. Al final del primer año, Pericles honra a los caídos con su célebre discurso.",
  },
  {
    id: "event-pericles-plague",
    topicId: TOPIC_ID,
    title: "La peste de Atenas",
    date: { year: -430 },
    era: "ANCIENT_GREECE",
    description: "Una epidemia arrasa la ciudad, abarrotada por los refugiados del Ática. Pericles es destituido y multado.",
  },
  {
    id: "event-pericles-death",
    topicId: TOPIC_ID,
    title: "Muerte de Pericles",
    date: { year: -429 },
    era: "ANCIENT_GREECE",
    description: "Reelegido estratego, muere víctima de la peste, poco después que sus dos hijos mayores.",
  },
]);

export const periclesQuiz = QuizSchema.parse({
  id: "quiz-pericles",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-pericles-office",
      question: "¿Qué cargo ocupó Pericles casi todos los años?",
      options: ["Arconte rey", "Estratego", "Tirano", "Éforo"],
      correctOptionIndex: 1,
      explanation: "Los estrategos eran diez generales elegidos cada año por votación, no por sorteo.",
    },
    {
      id: "question-pericles-temple",
      question: "¿Qué templo de la Acrópolis se construyó gracias a su impulso?",
      options: ["El Panteón", "El templo de Zeus en Olimpia", "El Partenón", "El templo de Apolo en Delfos"],
      correctOptionIndex: 2,
    },
    {
      id: "question-pericles-war",
      question: "¿Contra qué ciudad se enfrentó Atenas en la Guerra del Peloponeso?",
      options: ["Tebas", "Corinto", "Siracusa", "Esparta"],
      correctOptionIndex: 3,
    },
    {
      id: "question-pericles-funeral",
      question: "¿Qué historiador recogió la oración fúnebre de Pericles?",
      options: ["Tucídides", "Heródoto", "Jenofonte", "Plutarco"],
      correctOptionIndex: 0,
    },
    {
      id: "question-pericles-death",
      question: "¿De qué murió Pericles?",
      options: ["En una batalla naval", "De la peste", "Envenenado", "En el exilio"],
      correctOptionIndex: 1,
    },
  ],
});

export const periclesRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-pericles-kagan",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Pericles of Athens and the Birth of Democracy",
    creator: "Donald Kagan",
    year: 1991,
    description: "Biografía clásica de Pericles escrita por uno de los grandes especialistas en la Guerra del Peloponeso.",
  },
  {
    id: "rec-pericles-azoulay",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Périclès. La démocratie athénienne à l'épreuve du grand homme",
    creator: "Vincent Azoulay",
    year: 2010,
    description: "Analiza cómo encajaba un líder tan poderoso en una democracia que desconfiaba de los grandes hombres.",
  },
  {
    id: "rec-pericles-greeks",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "The Greeks: Crucible of Civilization",
    creator: "PBS",
    year: 2000,
    description: "Serie documental sobre el nacimiento de la democracia ateniense, con un episodio dedicado a Pericles.",
  },
]);
