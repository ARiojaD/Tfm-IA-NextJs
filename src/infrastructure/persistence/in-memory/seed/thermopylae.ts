import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-thermopylae";

// The exact month of the battle is debated (August or September of 480 a.C.): the events give only the year.

export const thermopylaeTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "batalla-de-las-termopilas",
  title: "Batalla de las Termópilas",
  era: "ANCIENT_GREECE",
  category: "WARS_AND_BATTLES",
  summary:
    "El desfiladero en el que Leónidas y sus espartanos frenaron durante tres días al ejército de Jerjes, en la Segunda Guerra Médica.",
  period: { start: { year: -480 } },
  introduction: [
    "En el 480 a.C., diez años después de la derrota persa en Maratón, el rey Jerjes invadió Grecia con un ejército enorme y una gran flota. Las ciudades griegas que decidieron resistir eligieron frenarlo en el desfiladero de las Termópilas, un paso estrecho entre las montañas y el mar, mientras su flota lo hacía cerca de allí, en el cabo Artemisio.",
    "El rey espartano Leónidas llegó con 300 espartiatas y varios miles de aliados de otras ciudades. Durante dos días rechazaron todos los ataques persas, incluidos los de la guardia de élite de Jerjes, los Inmortales, porque en un paso tan estrecho el número importaba poco. Pero un griego de la zona llamado Efialtes reveló a los persas un sendero por las montañas que permitía rodearlos.",
    "Al saberse rodeado, Leónidas despidió a la mayoría de los aliados y se quedó con sus espartanos, los tespios y los tebanos para cubrir la retirada; casi todos murieron. Los persas siguieron hasta Atenas, que había sido evacuada, y la incendiaron. Pero semanas después la flota griega los derrotó en Salamina, y en el 479 a.C. la victoria de Platea acabó con la invasión. Las Termópilas se convirtieron en un símbolo del sacrificio por la libertad.",
  ],
  keyFacts: [
    { label: "Fecha", value: "Agosto o septiembre del 480 a.C." },
    { label: "Lugar", value: "El desfiladero de las Termópilas, en Grecia central" },
    { label: "Guerra", value: "Segunda Guerra Médica" },
    { label: "Bandos", value: "Una alianza de ciudades griegas contra el Imperio persa" },
    { label: "Comandantes", value: "Leónidas I de Esparta frente a Jerjes I de Persia" },
    {
      label: "Fuerzas",
      value: "Unos 7.000 griegos frente a un ejército persa que Heródoto cifra en millones, una exageración evidente",
    },
    { label: "Resultado", value: "Victoria persa, pero los griegos ganan un tiempo valioso" },
  ],
  image: catalogImage("leonidas-termopilas"),
  relatedTopicIds: ["topic-alexander-the-great", "topic-classical-athens"],
  status: "PUBLISHED",
});

export const thermopylaeEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-thermopylae-marathon",
    topicId: TOPIC_ID,
    title: "Batalla de Maratón",
    date: { year: -490, month: 9 },
    era: "ANCIENT_GREECE",
    description: "Los atenienses derrotan al ejército del rey Darío I. Persia prepara durante diez años su venganza.",
  },
  {
    id: "event-thermopylae-hellespont",
    topicId: TOPIC_ID,
    title: "Jerjes cruza el Helesponto",
    date: { year: -480 },
    era: "ANCIENT_GREECE",
    description: "El ejército persa pasa de Asia a Europa sobre dos puentes de barcos y avanza hacia Grecia.",
  },
  {
    id: "event-thermopylae-battle",
    topicId: TOPIC_ID,
    title: "Dos días de resistencia",
    date: { year: -480 },
    era: "ANCIENT_GREECE",
    description: "Leónidas y sus aliados rechazan los ataques persas, incluidos los de los Inmortales, en el estrecho desfiladero.",
  },
  {
    id: "event-thermopylae-ephialtes",
    topicId: TOPIC_ID,
    title: "La traición de Efialtes",
    date: { year: -480 },
    era: "ANCIENT_GREECE",
    description: "Un griego de la zona guía a los persas por un sendero de montaña. Leónidas resiste con unos pocos hasta la muerte.",
  },
  {
    id: "event-thermopylae-salamis",
    topicId: TOPIC_ID,
    title: "Batalla de Salamina",
    date: { year: -480, month: 9 },
    era: "ANCIENT_GREECE",
    description: "La flota griega, dirigida por el ateniense Temístocles, destruye a la persa en el estrecho de Salamina.",
  },
  {
    id: "event-thermopylae-plataea",
    topicId: TOPIC_ID,
    title: "Batalla de Platea",
    date: { year: -479, month: 8 },
    era: "ANCIENT_GREECE",
    description: "El ejército griego, con los espartanos al frente, vence a los persas y pone fin a la invasión.",
  },
]);

export const thermopylaeQuiz = QuizSchema.parse({
  id: "quiz-thermopylae",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-thermopylae-leonidas",
      question: "¿Qué rey espartano dirigió a los griegos en las Termópilas?",
      options: ["Leónidas", "Licurgo", "Agesilao", "Pausanias"],
      correctOptionIndex: 0,
    },
    {
      id: "question-thermopylae-xerxes",
      question: "¿Qué rey persa invadió Grecia en el 480 a.C.?",
      options: ["Darío III", "Ciro el Grande", "Jerjes I", "Cambises II"],
      correctOptionIndex: 2,
      explanation: "Darío I, su padre, había sido derrotado en Maratón diez años antes.",
    },
    {
      id: "question-thermopylae-immortals",
      question: "¿Cómo se llamaba la guardia de élite del rey persa?",
      options: ["Los pretorianos", "Los Inmortales", "Los hoplitas", "Los hetairoi"],
      correctOptionIndex: 1,
    },
    {
      id: "question-thermopylae-ephialtes",
      question: "¿Quién reveló a los persas el sendero para rodear a los griegos?",
      options: ["Temístocles", "Alcibíades", "Pausanias", "Efialtes"],
      correctOptionIndex: 3,
    },
    {
      id: "question-thermopylae-salamis",
      question: "¿En qué batalla naval derrotaron los griegos a los persas semanas después?",
      options: ["Salamina", "Accio", "Lepanto", "Egospótamos"],
      correctOptionIndex: 0,
    },
  ],
});

export const thermopylaeRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-thermopylae-pressfield",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Puertas de fuego",
    creator: "Steven Pressfield",
    year: 1998,
    description: "Novela sobre la batalla contada por un escudero superviviente, muy documentada sobre la vida en Esparta.",
  },
  {
    id: "rec-thermopylae-holland",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Fuego persa",
    creator: "Tom Holland",
    year: 2005,
    description: "Historia de las Guerras Médicas, contada también desde el punto de vista persa.",
  },
  {
    id: "rec-thermopylae-mate",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "El león de Esparta",
    creator: "Rudolph Maté",
    year: 1962,
    description: "Película clásica sobre la batalla, más fiel a Heródoto que las versiones posteriores.",
  },
  {
    id: "rec-thermopylae-300",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "300",
    creator: "Zack Snyder",
    year: 2007,
    description: "Adaptación del cómic de Frank Miller: espectacular, pero muy alejada de la historia.",
  },
]);
