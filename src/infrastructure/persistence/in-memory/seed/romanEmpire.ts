import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-roman-empire";

// La etapa termina en el 476 d.C., con el fin del Imperio de Occidente; el de Oriente (el bizantino) se
// menciona, pero queda fuera de su periodo.

export const romanEmpireTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "el-imperio-romano",
  title: "El Imperio romano",
  era: "ROMAN",
  category: "PERIODS",
  summary:
    "Cinco siglos de emperadores, de Augusto a Rómulo Augústulo: la paz romana, la máxima extensión, la crisis del siglo III y la caída de Occidente.",
  period: { start: { year: -27, month: 1 }, end: { year: 476, month: 9 } },
  introduction: [
    "En el 27 a.C. el Senado concedió a Octavio el título de Augusto. Sin proclamarse rey, reunió en su persona los poderes de las antiguas magistraturas y el mando de los ejércitos: había nacido el principado, el gobierno de un solo hombre bajo las formas de la República. Con él empezó la pax romana, dos siglos de relativa paz en los que el Mediterráneo fue un mismo espacio de comercio, leyes y ciudades.",
    "Tras las dinastías julio-claudia y flavia, los emperadores Antoninos llevaron el Imperio a su apogeo: con Trajano, nacido en Hispania, alcanzó su mayor extensión en el 117 d.C., de Britania a Mesopotamia. En el 212 Caracalla concedió la ciudadanía a casi todos los habitantes libres. Pero en el siglo III las invasiones, las guerras civiles y la crisis económica pusieron al Imperio al borde del colapso.",
    "Diocleciano, desde el 284, lo reorganizó, y Constantino legalizó el cristianismo en el 313 y fundó Constantinopla en el 330. A la muerte de Teodosio, en el 395, el Imperio quedó dividido entre Oriente y Occidente. El de Occidente, presionado por los pueblos germánicos, sufrió el saqueo de Roma en el 410 y desapareció en el 476, cuando Odoacro depuso a Rómulo Augústulo. El de Oriente, el Imperio bizantino, duró hasta 1453.",
  ],
  keyFacts: [
    { label: "Duración", value: "Del 27 a.C. al 476 d.C. en Occidente" },
    { label: "Primer emperador", value: "Augusto" },
    { label: "Último emperador de Occidente", value: "Rómulo Augústulo" },
    { label: "Máxima extensión", value: "Con Trajano, en el 117 d.C." },
    { label: "Capitales", value: "Roma y, desde el 330, también Constantinopla" },
    { label: "Herencia", value: "El derecho romano, las lenguas romances y la expansión del cristianismo" },
  ],
  image: catalogImage("roma-coliseo"),
  relatedTopicIds: ["topic-emerita-augusta", "topic-julius-caesar", "topic-roman-republic"],
  status: "PUBLISHED",
});

export const romanEmpireEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-roman-empire-augustus",
    topicId: TOPIC_ID,
    title: "Octavio recibe el título de Augusto",
    date: { year: -27, month: 1 },
    era: "ROMAN",
    description: "Empieza el principado: el poder de un solo hombre bajo las formas de la República.",
  },
  {
    id: "event-roman-empire-augustus-death",
    topicId: TOPIC_ID,
    title: "Muerte de Augusto",
    date: { year: 14, month: 8 },
    era: "ROMAN",
    description: "Le sucede Tiberio, su hijo adoptivo: el nuevo régimen sobrevive a su fundador.",
  },
  {
    id: "event-roman-empire-colosseum",
    topicId: TOPIC_ID,
    title: "Inauguración del Coliseo",
    date: { year: 80 },
    era: "ROMAN",
    description: "El emperador Tito inaugura el anfiteatro Flavio con cien días de juegos.",
  },
  {
    id: "event-roman-empire-trajan",
    topicId: TOPIC_ID,
    title: "Máxima extensión del Imperio",
    date: { year: 117 },
    era: "ROMAN",
    description: "A la muerte de Trajano, el Imperio llega de Britania a Mesopotamia.",
  },
  {
    id: "event-roman-empire-caracalla",
    topicId: TOPIC_ID,
    title: "Edicto de Caracalla",
    date: { year: 212 },
    era: "ROMAN",
    description: "Casi todos los habitantes libres del Imperio pasan a ser ciudadanos romanos.",
  },
  {
    id: "event-roman-empire-diocletian",
    topicId: TOPIC_ID,
    title: "Diocleciano, emperador",
    date: { year: 284 },
    era: "ROMAN",
    description: "Pone fin a la crisis del siglo III y acaba repartiendo el gobierno entre cuatro emperadores, la tetrarquía.",
  },
  {
    id: "event-roman-empire-milan",
    topicId: TOPIC_ID,
    title: "Edicto de Milán",
    date: { year: 313 },
    era: "ROMAN",
    description: "Constantino y Licinio reconocen la libertad de culto a los cristianos.",
  },
  {
    id: "event-roman-empire-division",
    topicId: TOPIC_ID,
    title: "División del Imperio",
    date: { year: 395, month: 1 },
    era: "ROMAN",
    description: "A la muerte de Teodosio, sus hijos Arcadio y Honorio se reparten Oriente y Occidente.",
  },
  {
    id: "event-roman-empire-fall",
    topicId: TOPIC_ID,
    title: "Fin del Imperio de Occidente",
    date: { year: 476, month: 9 },
    era: "ROMAN",
    description: "Odoacro depone a Rómulo Augústulo y envía las insignias imperiales a Constantinopla.",
  },
]);

export const romanEmpireQuiz = QuizSchema.parse({
  id: "quiz-roman-empire",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-roman-empire-first",
      question: "¿Quién fue el primer emperador romano?",
      options: ["Julio César", "Augusto", "Nerón", "Constantino"],
      correctOptionIndex: 1,
      explanation: "César fue dictador, pero el primer emperador fue su hijo adoptivo, Octavio Augusto.",
    },
    {
      id: "question-roman-empire-extent",
      question: "¿Con qué emperador alcanzó el Imperio su máxima extensión?",
      options: ["Calígula", "Diocleciano", "Trajano", "Teodosio"],
      correctOptionIndex: 2,
    },
    {
      id: "question-roman-empire-constantinople",
      question: "¿Qué emperador fundó Constantinopla?",
      options: ["Adriano", "Marco Aurelio", "Vespasiano", "Constantino"],
      correctOptionIndex: 3,
    },
    {
      id: "question-roman-empire-caracalla",
      question: "¿Qué concedió el edicto de Caracalla del 212 d.C.?",
      options: [
        "La ciudadanía a casi todos los habitantes libres",
        "La libertad de culto a los cristianos",
        "La división del Imperio en dos",
        "El fin de los juegos de gladiadores",
      ],
      correctOptionIndex: 0,
    },
    {
      id: "question-roman-empire-fall",
      question: "¿En qué año desapareció el Imperio romano de Occidente?",
      options: ["395 d.C.", "410 d.C.", "476 d.C.", "1453 d.C."],
      correctOptionIndex: 2,
      explanation: "En el 1453 cayó Constantinopla, el final del Imperio de Oriente.",
    },
  ],
});

export const romanEmpireRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-roman-empire-graves",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Yo, Claudio",
    creator: "Robert Graves",
    year: 1934,
    description: "Novela sobre la dinastía julio-claudia contada por el emperador Claudio.",
  },
  {
    id: "rec-roman-empire-yourcenar",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Memorias de Adriano",
    creator: "Marguerite Yourcenar",
    year: 1951,
    description: "Novela en forma de carta del emperador Adriano, un clásico de la literatura histórica.",
  },
  {
    id: "rec-roman-empire-gibbon",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Historia de la decadencia y caída del Imperio romano",
    creator: "Edward Gibbon",
    year: 1776,
    description: "La obra clásica sobre el final de Roma; hoy discutida, pero fundamental en la historiografía.",
  },
  {
    id: "rec-roman-empire-gladiator",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "Gladiator",
    creator: "Ridley Scott",
    year: 2000,
    description: "Ficción ambientada a la muerte de Marco Aurelio: espectacular, pero muy libre con la historia.",
  },
]);
