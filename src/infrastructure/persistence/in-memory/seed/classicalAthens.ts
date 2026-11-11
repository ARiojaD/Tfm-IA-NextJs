import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-classical-athens";

export const classicalAthensTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "la-atenas-clasica",
  title: "La Atenas clásica",
  era: "ANCIENT_GREECE",
  category: "PERIODS",
  summary:
    "Los tres cuartos de siglo entre las Guerras Médicas y la derrota ante Esparta en que Atenas fue una democracia, un imperio y el gran centro de la cultura griega.",
  period: { start: { year: -479 }, end: { year: -404 } },
  introduction: [
    "Tras derrotar a los persas en Salamina y Platea, Atenas vivió entre el 479 y el 404 a.C. su época de mayor esplendor. Su flota encabezó la Liga de Delos, una alianza de ciudades contra Persia que poco a poco se convirtió en un imperio: los aliados pagaban un tributo a Atenas y no podían abandonar la liga.",
    "Atenas era una democracia directa: los ciudadanos varones decidían en la asamblea, se repartían por sorteo la mayoría de los cargos y juzgaban en tribunales populares. Las mujeres, los extranjeros residentes y los esclavos, buena parte de la población, quedaban fuera. Con Pericles se reconstruyó la Acrópolis, y en el teatro de Dioniso se estrenaron las tragedias de Esquilo, Sófocles y Eurípides y las comedias de Aristófanes, mientras Sócrates discutía con sus conciudadanos en el ágora.",
    "La rivalidad con Esparta llevó a la Guerra del Peloponeso (431–404 a.C.). Atenas sufrió la peste, perdió una gran expedición contra Siracusa en el 413 a.C. y, tras la destrucción de su flota en Egospótamos, se rindió en el 404 a.C. Esparta derribó los Muros Largos que unían la ciudad con su puerto e impuso el gobierno de los Treinta Tiranos, aunque la democracia se restableció al año siguiente.",
  ],
  keyFacts: [
    { label: "Periodo", value: "479–404 a.C." },
    { label: "Gobierno", value: "Democracia directa de los ciudadanos varones" },
    { label: "Alianza", value: "La Liga de Delos, fundada en el 478 a.C." },
    { label: "Monumentos", value: "El Partenón, el Erecteion y los Propileos de la Acrópolis" },
    { label: "Cultura", value: "Esquilo, Sófocles, Eurípides, Aristófanes, Sócrates y Fidias" },
    { label: "Final", value: "La derrota en la Guerra del Peloponeso, en el 404 a.C." },
  ],
  image: catalogImage("grecia-partenon"),
  relatedTopicIds: ["topic-pericles", "topic-thermopylae"],
  status: "PUBLISHED",
});

export const classicalAthensEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-athens-delian-league",
    topicId: TOPIC_ID,
    title: "Fundación de la Liga de Delos",
    date: { year: -478 },
    era: "ANCIENT_GREECE",
    description: "Atenas y las ciudades del Egeo se alían contra Persia, con el tesoro común en la isla de Delos.",
  },
  {
    id: "event-athens-treasury",
    topicId: TOPIC_ID,
    title: "El tesoro de la Liga, a Atenas",
    date: { year: -454 },
    era: "ANCIENT_GREECE",
    description: "El tesoro común se traslada a Atenas, que lo usará también para sus propias obras: la alianza se ha convertido en un imperio.",
  },
  {
    id: "event-athens-parthenon",
    topicId: TOPIC_ID,
    title: "Comienza el Partenón",
    date: { year: -447 },
    era: "ANCIENT_GREECE",
    description: "Empiezan las obras del templo de Atenea Pártenos, terminado en el 432 a.C.",
  },
  {
    id: "event-athens-war",
    topicId: TOPIC_ID,
    title: "Comienza la Guerra del Peloponeso",
    date: { year: -431 },
    era: "ANCIENT_GREECE",
    description: "Atenas y Esparta, con sus aliados, se enfrentan en una guerra que durará veintisiete años.",
  },
  {
    id: "event-athens-plague",
    topicId: TOPIC_ID,
    title: "La peste de Atenas",
    date: { year: -430 },
    era: "ANCIENT_GREECE",
    description: "Una epidemia mata a una parte importante de la población, refugiada tras las murallas.",
  },
  {
    id: "event-athens-sicily",
    topicId: TOPIC_ID,
    title: "Desastre de Sicilia",
    date: { year: -413 },
    era: "ANCIENT_GREECE",
    description: "La gran expedición contra Siracusa termina con la flota y el ejército atenienses destruidos.",
  },
  {
    id: "event-athens-aegospotami",
    topicId: TOPIC_ID,
    title: "Batalla de Egospótamos",
    date: { year: -405 },
    era: "ANCIENT_GREECE",
    description: "El espartano Lisandro destruye la última flota ateniense en el Helesponto.",
  },
  {
    id: "event-athens-surrender",
    topicId: TOPIC_ID,
    title: "Rendición de Atenas",
    date: { year: -404 },
    era: "ANCIENT_GREECE",
    description: "Atenas se rinde. Esparta derriba los Muros Largos e impone el gobierno de los Treinta Tiranos.",
  },
]);

export const classicalAthensQuiz = QuizSchema.parse({
  id: "quiz-classical-athens",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-athens-league",
      question: "¿Qué alianza de ciudades encabezó Atenas?",
      options: ["La Liga del Peloponeso", "La Liga de Delos", "La Liga Aquea", "La Liga Etolia"],
      correctOptionIndex: 1,
      explanation: "La Liga del Peloponeso era la alianza rival, encabezada por Esparta.",
    },
    {
      id: "question-athens-assembly",
      question: "¿Quiénes podían votar en la asamblea de Atenas?",
      options: ["Todos los habitantes", "Solo los aristócratas", "Los ciudadanos varones", "Los ciudadanos y las ciudadanas"],
      correctOptionIndex: 2,
    },
    {
      id: "question-athens-sparta",
      question: "¿Qué ciudad venció a Atenas en la Guerra del Peloponeso?",
      options: ["Esparta", "Tebas", "Corinto", "Siracusa"],
      correctOptionIndex: 0,
    },
    {
      id: "question-athens-comedy",
      question: "¿Cuál de estos autores atenienses escribía comedias?",
      options: ["Sófocles", "Esquilo", "Eurípides", "Aristófanes"],
      correctOptionIndex: 3,
      explanation: "Los otros tres son los grandes autores de la tragedia griega.",
    },
    {
      id: "question-athens-tyrants",
      question: "¿Qué gobierno impuso Esparta en Atenas tras su rendición?",
      options: ["Los Treinta Tiranos", "Los Diez Estrategos", "La tiranía de Pisístrato", "El Consejo de los Quinientos"],
      correctOptionIndex: 0,
    },
  ],
});

export const classicalAthensRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-athens-kitto",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Los griegos",
    creator: "H. D. F. Kitto",
    year: 1951,
    description: "Introducción clásica y amena a la forma de vivir y de pensar de los griegos antiguos.",
  },
  {
    id: "rec-athens-cartledge",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Democracy: A Life",
    creator: "Paul Cartledge",
    year: 2016,
    description: "Historia de la democracia desde la Atenas clásica, de uno de los grandes especialistas en Grecia.",
  },
  {
    id: "rec-athens-greeks",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "The Greeks: Crucible of Civilization",
    creator: "PBS",
    year: 2000,
    description: "Serie documental sobre el ascenso de Atenas, de las Guerras Médicas a la muerte de Sócrates.",
  },
]);
