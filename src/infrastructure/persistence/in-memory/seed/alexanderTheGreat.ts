import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-alexander-the-great";

export const alexanderTheGreatTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "alejandro-magno",
  title: "Alejandro Magno",
  era: "ANCIENT_GREECE",
  category: "PEOPLE",
  summary:
    "El rey de Macedonia que en once años conquistó el Imperio persa, llegó hasta la India y abrió el mundo helenístico.",
  period: { start: { year: -356, month: 7 }, end: { year: -323, month: 6 } },
  introduction: [
    "Alejandro nació en Pela en el 356 a.C., hijo del rey Filipo II de Macedonia y de Olimpia de Epiro. Tuvo como maestro a Aristóteles y, con solo dieciocho años, mandó la caballería macedonia en la batalla de Queronea, donde su padre derrotó a Atenas y Tebas. Cuando Filipo fue asesinado en el 336 a.C., Alejandro heredó el trono y el proyecto de invadir el Imperio persa.",
    "En el 334 a.C. cruzó a Asia con unos 40.000 hombres. Venció a los persas junto al río Gránico, derrotó al rey Darío III en Issos en el 333 a.C. y, tras conquistar Tiro y Egipto, donde fundó Alejandría, lo venció definitivamente en Gaugamela en el 331 a.C. Muerto Darío, se presentó como su sucesor y siguió hacia el este, hasta Bactriana y la India, donde derrotó al rey Poros junto al río Hidaspes.",
    "En el 326 a.C. sus soldados, agotados tras años de campaña, se negaron a seguir y Alejandro tuvo que regresar. Murió en Babilonia en el 323 a.C., con 32 años y sin un heredero adulto. Sus generales se repartieron el imperio en los reinos helenísticos, que durante los tres siglos siguientes extendieron la lengua y la cultura griegas desde Egipto hasta Asia Central.",
  ],
  keyFacts: [
    { label: "Nacimiento", value: "Julio del 356 a.C., Pela (Macedonia)" },
    { label: "Muerte", value: "Junio del 323 a.C., Babilonia" },
    { label: "Padres", value: "Filipo II de Macedonia y Olimpia de Epiro" },
    { label: "Maestro", value: "Aristóteles" },
    { label: "Batallas", value: "Gránico, Issos, Gaugamela e Hidaspes" },
    { label: "Legado", value: "Los reinos helenísticos y ciudades como Alejandría de Egipto" },
  ],
  image: catalogImage("alejandro-issos"),
  relatedTopicIds: ["topic-thermopylae"],
  status: "PUBLISHED",
});

export const alexanderTheGreatEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-alexander-birth",
    topicId: TOPIC_ID,
    title: "Nacimiento de Alejandro",
    date: { year: -356, month: 7 },
    era: "ANCIENT_GREECE",
    description: "Nace en Pela, la capital de Macedonia, hijo del rey Filipo II y de Olimpia de Epiro.",
  },
  {
    id: "event-alexander-chaeronea",
    topicId: TOPIC_ID,
    title: "Batalla de Queronea",
    date: { year: -338, month: 8 },
    era: "ANCIENT_GREECE",
    description: "Con dieciocho años manda la caballería macedonia en la victoria de Filipo sobre Atenas y Tebas.",
  },
  {
    id: "event-alexander-king",
    topicId: TOPIC_ID,
    title: "Rey de Macedonia",
    date: { year: -336 },
    era: "ANCIENT_GREECE",
    description: "Tras el asesinato de su padre hereda el trono y somete a las ciudades griegas que se rebelan.",
  },
  {
    id: "event-alexander-granicus",
    topicId: TOPIC_ID,
    title: "Batalla del Gránico",
    date: { year: -334 },
    era: "ANCIENT_GREECE",
    description: "Primera victoria en Asia, junto al río Gránico, frente a los gobernadores persas de Anatolia.",
  },
  {
    id: "event-alexander-issus",
    topicId: TOPIC_ID,
    title: "Batalla de Issos",
    date: { year: -333, month: 11 },
    era: "ANCIENT_GREECE",
    description: "Derrota a Darío III, que huye dejando atrás a su madre, su esposa y sus hijas.",
  },
  {
    id: "event-alexander-alexandria",
    topicId: TOPIC_ID,
    title: "Fundación de Alejandría",
    date: { year: -331 },
    era: "ANCIENT_GREECE",
    description: "En la costa de Egipto funda la ciudad que llegará a ser la capital cultural del mundo helenístico.",
  },
  {
    id: "event-alexander-gaugamela",
    topicId: TOPIC_ID,
    title: "Batalla de Gaugamela",
    date: { year: -331, month: 10 },
    era: "ANCIENT_GREECE",
    description: "Vence de nuevo a Darío III en la llanura de Mesopotamia y se hace con el Imperio persa.",
  },
  {
    id: "event-alexander-hydaspes",
    topicId: TOPIC_ID,
    title: "Batalla del Hidaspes",
    date: { year: -326 },
    era: "ANCIENT_GREECE",
    description: "En la India derrota al rey Poros y sus elefantes de guerra. Poco después, sus soldados se niegan a seguir.",
  },
  {
    id: "event-alexander-death",
    topicId: TOPIC_ID,
    title: "Muerte de Alejandro",
    date: { year: -323, month: 6 },
    era: "ANCIENT_GREECE",
    description: "Muere en Babilonia, con 32 años, tras unos días de fiebre. Sus generales se reparten el imperio.",
  },
]);

export const alexanderTheGreatQuiz = QuizSchema.parse({
  id: "quiz-alexander-the-great",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-alexander-teacher",
      question: "¿Quién fue el maestro de Alejandro?",
      options: ["Sócrates", "Platón", "Aristóteles", "Pericles"],
      correctOptionIndex: 2,
    },
    {
      id: "question-alexander-darius",
      question: "¿Contra qué rey persa luchó Alejandro en Issos y Gaugamela?",
      options: ["Darío III", "Jerjes I", "Ciro el Grande", "Artajerjes II"],
      correctOptionIndex: 0,
    },
    {
      id: "question-alexander-city",
      question: "¿Qué ciudad fundó Alejandro en la costa de Egipto?",
      options: ["Menfis", "Alejandría", "Cartago", "Tebas"],
      correctOptionIndex: 1,
      explanation: "Fundó muchas ciudades con su nombre, pero la de Egipto fue la más importante.",
    },
    {
      id: "question-alexander-horse",
      question: "¿Cómo se llamaba el caballo de Alejandro?",
      options: ["Pegaso", "Incitato", "Babieca", "Bucéfalo"],
      correctOptionIndex: 3,
      explanation: "Es el caballo que monta en el mosaico de la batalla de Issos.",
    },
    {
      id: "question-alexander-death",
      question: "¿Dónde murió Alejandro Magno?",
      options: ["En Pela", "En Babilonia", "En Atenas", "En Persépolis"],
      correctOptionIndex: 1,
    },
  ],
});

export const alexanderTheGreatRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-alexander-lane-fox",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Alejandro Magno",
    creator: "Robin Lane Fox",
    year: 1973,
    description: "Una de las biografías más leídas de Alejandro, rigurosa y muy bien escrita.",
  },
  {
    id: "rec-alexander-renault",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "El fuego del cielo",
    creator: "Mary Renault",
    year: 1969,
    description: "Novela sobre la infancia y la juventud de Alejandro, primera de una trilogía.",
  },
  {
    id: "rec-alexander-stone",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "Alejandro Magno",
    creator: "Oliver Stone",
    year: 2004,
    description: "Superproducción sobre su vida y sus conquistas, con Colin Farrell como Alejandro.",
  },
  {
    id: "rec-alexander-rossen",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "Alejandro Magno",
    creator: "Robert Rossen",
    year: 1956,
    description: "Película clásica con Richard Burton, rodada en buena parte en España.",
  },
]);
