import { CommentSchema } from "@/domain/entities/Comment";
import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";

const TOPIC_ID = "topic-julius-caesar";

// Every collection is parsed with its domain schema, so invalid seed data fails at startup.

export const juliusCaesarTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "julio-cesar",
  title: "Julio César",
  era: "ROMAN",
  summary:
    "Del Primer Triunvirato a los Idus de marzo: el general y político que conquistó la Galia, cruzó el Rubicón y precipitó el final de la República romana.",
});

export const juliusCaesarEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-caesar-birth",
    topicId: TOPIC_ID,
    title: "Nacimiento de Cayo Julio César",
    date: { year: -100, month: 7 },
    era: "ROMAN",
    description:
      "Nace en Roma en la gens Julia, una familia patricia que decía descender de Venus a través de Eneas y su hijo Iulo.",
  },
  {
    id: "event-first-triumvirate",
    topicId: TOPIC_ID,
    title: "Primer Triunvirato",
    date: { year: -60 },
    era: "ROMAN",
    description:
      "Alianza privada con Pompeyo y Craso para sumar su influencia, su prestigio militar y su riqueza frente a la oposición del Senado.",
  },
  {
    id: "event-first-consulship",
    topicId: TOPIC_ID,
    title: "Primer consulado",
    date: { year: -59 },
    era: "ROMAN",
    description:
      "Elegido cónsul, impulsa leyes agrarias con el apoyo de sus aliados y pese a la oposición de su colega Bíbulo.",
  },
  {
    id: "event-gallic-wars",
    topicId: TOPIC_ID,
    title: "Comienzo de la Guerra de las Galias",
    date: { year: -58 },
    era: "ROMAN",
    description:
      "Como procónsul inicia una campaña de ocho años que llevará las legiones romanas hasta el Rin y el canal de la Mancha.",
  },
  {
    id: "event-alesia",
    topicId: TOPIC_ID,
    title: "Asedio de Alesia",
    date: { year: -52 },
    era: "ROMAN",
    description:
      "César rodea Alesia con un doble muro de asedio, derrota al ejército de socorro y obtiene la rendición de Vercingétorix, poniendo fin a la gran revuelta gala.",
  },
  {
    id: "event-rubicon",
    topicId: TOPIC_ID,
    title: "Cruce del Rubicón",
    date: { year: -49, month: 1 },
    era: "ROMAN",
    description:
      "Cruza con sus tropas el río que separaba la Galia Cisalpina de Italia, desafía al Senado y desencadena la guerra civil. Se le atribuye la frase «alea iacta est».",
  },
  {
    id: "event-pharsalus",
    topicId: TOPIC_ID,
    title: "Batalla de Farsalia",
    date: { year: -48, month: 8 },
    era: "ROMAN",
    description:
      "Derrota a Pompeyo en Tesalia. Pompeyo huye a Egipto, donde es asesinado por orden de la corte de Ptolomeo XIII.",
  },
  {
    id: "event-perpetual-dictator",
    topicId: TOPIC_ID,
    title: "Dictador perpetuo",
    date: { year: -44, month: 2 },
    era: "ROMAN",
    description:
      "Recibe la dictadura a perpetuidad, una concentración de poder que alarma a buena parte de la aristocracia senatorial.",
  },
  {
    id: "event-ides-of-march",
    topicId: TOPIC_ID,
    title: "Idus de marzo",
    date: { year: -44, month: 3 },
    era: "ROMAN",
    description:
      "Es asesinado en la Curia de Pompeyo por un grupo de senadores encabezados por Bruto y Casio.",
  },
]);

export const juliusCaesarQuiz = QuizSchema.parse({
  id: "quiz-julius-caesar",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-caesar-rubicon",
      question: "¿Qué río cruzó César en el 49 a.C., desencadenando la guerra civil?",
      options: ["Tíber", "Rubicón", "Po", "Arno"],
      correctOptionIndex: 1,
      explanation:
        "El Rubicón marcaba el límite entre la Galia Cisalpina e Italia. Entrar en Italia al frente de un ejército era ilegal.",
    },
    {
      id: "question-caesar-triumvirate",
      question: "¿Con quiénes formó César el Primer Triunvirato?",
      options: ["Pompeyo y Craso", "Marco Antonio y Octavio", "Bruto y Casio", "Cicerón y Catón"],
      correctOptionIndex: 0,
      explanation: "Marco Antonio y Octavio, junto a Lépido, formarían después el Segundo Triunvirato.",
    },
    {
      id: "question-caesar-alesia",
      question: "¿Qué caudillo galo se rindió a César tras el asedio de Alesia?",
      options: ["Ambiórix", "Viriato", "Breno", "Vercingétorix"],
      correctOptionIndex: 3,
      explanation: "Vercingétorix fue llevado a Roma, exhibido en el triunfo de César y ejecutado años después.",
    },
    {
      id: "question-caesar-pharsalus",
      question: "¿A quién derrotó César en la batalla de Farsalia?",
      options: ["Craso", "Pompeyo", "Marco Antonio", "Escipión Emiliano"],
      correctOptionIndex: 1,
    },
    {
      id: "question-caesar-death",
      question: "¿Cuándo fue asesinado Julio César?",
      options: [
        "En las calendas de enero del 49 a.C.",
        "En las nonas de agosto del 48 a.C.",
        "En los idus de marzo del 44 a.C.",
      ],
      correctOptionIndex: 2,
      explanation: "Los idus de marzo correspondían al día 15 de ese mes.",
    },
  ],
});

export const juliusCaesarComments = CommentSchema.array().parse([
  {
    id: "comment-caesar-1",
    topicId: TOPIC_ID,
    author: "Livia",
    message: "Nunca había pensado en lo arriesgado que fue cruzar el Rubicón: si perdía, era un traidor.",
    createdAt: new Date("2026-10-17T18:30:00Z"),
  },
  {
    id: "comment-caesar-2",
    topicId: TOPIC_ID,
    author: "Marco",
    message: "El doble muro de Alesia me parece de lo más impresionante de la ingeniería militar romana.",
    createdAt: new Date("2026-10-18T09:15:00Z"),
  },
  {
    id: "comment-caesar-3",
    topicId: TOPIC_ID,
    author: "Claudia",
    message: "¿Alguien ha visto la serie Roma? La recomiendo mucho para ponerle cara a esta época.",
    createdAt: new Date("2026-10-18T21:40:00Z"),
  },
]);

export const juliusCaesarRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-caesar-shakespeare",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Julio César",
    creator: "William Shakespeare",
    year: 1599,
    description:
      "Tragedia sobre la conspiración contra César y sus consecuencias, con el célebre discurso fúnebre de Marco Antonio.",
  },
  {
    id: "rec-caesar-wilder",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Los idus de marzo",
    creator: "Thornton Wilder",
    year: 1948,
    description: "Novela epistolar que reconstruye los últimos meses de César a través de cartas y documentos imaginados.",
  },
  {
    id: "rec-caesar-goldsworthy",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Caesar: Life of a Colossus",
    creator: "Adrian Goldsworthy",
    year: 2006,
    description: "Biografía rigurosa y amena del historiador británico especializado en el ejército romano.",
  },
  {
    id: "rec-caesar-mankiewicz-1953",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "Julio César",
    creator: "Joseph L. Mankiewicz",
    year: 1953,
    description: "Adaptación de la obra de Shakespeare, con Marlon Brando en el papel de Marco Antonio.",
  },
  {
    id: "rec-caesar-cleopatra-1963",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "Cleopatra",
    creator: "Joseph L. Mankiewicz",
    year: 1963,
    description: "Superproducción con Elizabeth Taylor como Cleopatra y Rex Harrison como Julio César.",
  },
  {
    id: "rec-caesar-rome-series",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "Roma",
    creator: "HBO / BBC",
    year: 2005,
    description:
      "Recorre la caída de la República desde el final de la Guerra de las Galias, vista también a través de dos legionarios.",
  },
]);
