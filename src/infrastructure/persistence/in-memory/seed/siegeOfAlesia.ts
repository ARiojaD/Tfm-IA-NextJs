import { CommentSchema } from "@/domain/entities/Comment";
import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";

const TOPIC_ID = "topic-siege-of-alesia";

// Every collection is parsed with its domain schema, so invalid seed data fails at startup.
// Most events are dated only by year (52 a.C.): their order here is the order they happened.

export const siegeOfAlesiaTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "asedio-de-alesia",
  title: "Asedio de Alesia",
  era: "ROMAN",
  category: "WARS_AND_BATTLES",
  summary:
    "El asedio en el que César encerró a Vercingétorix tras un doble anillo de fortificaciones y decidió la conquista de la Galia.",
  period: { start: { year: -52 } },
  introduction: [
    "En el 52 a.C., cuando la Galia parecía sometida, Vercingétorix, un joven noble de los arvernos, logró unir por primera vez a buena parte de los pueblos galos contra Roma. Tras rechazar a César en Gergovia, se hizo fuerte en Alesia, una ciudad amurallada sobre una colina, a la espera de refuerzos.",
    "César no intentó asaltarla: la rodeó. Sus legiones levantaron una línea de fortificaciones de unos 16 kilómetros alrededor de la ciudad para encerrar a los sitiados y, a sus espaldas, otra de unos 21 kilómetros para protegerse del ejército de socorro que llegaría desde fuera. Fosos, empalizadas, torres y trampas convirtieron el campamento romano en una fortaleza con dos frentes.",
    "Cuando llegó el ejército galo de socorro, los romanos tuvieron que resistir a la vez desde dentro y desde fuera. Tras varios días de combates, el asalto decisivo fracasó, los galos de fuera se dispersaron y Vercingétorix se rindió. Alesia acabó con la resistencia gala organizada y dio a César el prestigio y las legiones veteranas con los que, tres años después, cruzaría el Rubicón.",
  ],
  keyFacts: [
    { label: "Fecha", value: "Verano y principios del otoño del 52 a.C." },
    { label: "Lugar", value: "Alesia, junto a la actual Alise-Sainte-Reine (Borgoña, Francia)" },
    { label: "Guerra", value: "Guerra de las Galias (58–50 a.C.)" },
    { label: "Bandos", value: "República romana contra una coalición de pueblos galos" },
    { label: "Comandantes", value: "Julio César frente a Vercingétorix" },
    {
      label: "Fuerzas",
      value:
        "Unas diez legiones y tropas auxiliares frente a un ejército galo que César cifra en más de 300.000 hombres, una cifra hoy considerada exagerada",
    },
    { label: "Resultado", value: "Victoria romana y rendición de Vercingétorix" },
  ],
  image: {
    src: "/images/topics/asedio-de-alesia.jpg",
    alt: "Vercingétorix, a caballo, arroja sus armas ante Julio César, sentado con un manto rojo entre sus legionarios",
    caption: "Vercingétorix arroja sus armas a los pies de Julio César (Lionel Royer, 1899).",
    credit: "Dominio público",
    width: 960,
    height: 640,
  },
  relatedTopicIds: ["topic-julius-caesar"],
  status: "PUBLISHED",
});

export const siegeOfAlesiaEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-alesia-revolt",
    topicId: TOPIC_ID,
    title: "Rebelión de Vercingétorix",
    date: { year: -52 },
    era: "ROMAN",
    description:
      "Tras la matanza de comerciantes romanos en Cenabum (Orleans), Vercingétorix es proclamado jefe de una gran coalición de pueblos galos contra Roma.",
  },
  {
    id: "event-alesia-avaricum",
    topicId: TOPIC_ID,
    title: "Toma de Avárico",
    date: { year: -52 },
    era: "ROMAN",
    description:
      "César asedia y toma Avárico (Bourges), una de las ciudades más ricas de la Galia, pese a la táctica de tierra quemada de Vercingétorix.",
  },
  {
    id: "event-alesia-gergovia",
    topicId: TOPIC_ID,
    title: "Derrota romana en Gergovia",
    date: { year: -52 },
    era: "ROMAN",
    description:
      "César fracasa al intentar tomar Gergovia, la plaza fuerte de los arvernos: una de sus pocas derrotas en la Galia.",
  },
  {
    id: "event-alesia-siege-begins",
    topicId: TOPIC_ID,
    title: "Comienza el asedio",
    date: { year: -52 },
    era: "ROMAN",
    description:
      "Tras el fracaso de su caballería, Vercingétorix se refugia en Alesia con su ejército. César decide rodear la ciudad en lugar de asaltarla.",
  },
  {
    id: "event-alesia-relief-army",
    topicId: TOPIC_ID,
    title: "Llega el ejército de socorro",
    date: { year: -52 },
    era: "ROMAN",
    description:
      "Un enorme ejército reunido por toda la Galia ataca las líneas romanas desde fuera, mientras los sitiados lo hacen desde dentro.",
  },
  {
    id: "event-alesia-surrender",
    topicId: TOPIC_ID,
    title: "Rendición de Vercingétorix",
    date: { year: -52 },
    era: "ROMAN",
    description: "Fracasado el último asalto, el ejército de socorro se dispersa y Vercingétorix se entrega a César.",
  },
  {
    id: "event-alesia-triumph",
    topicId: TOPIC_ID,
    title: "Triunfo de César en Roma",
    date: { year: -46 },
    era: "ROMAN",
    description:
      "Vercingétorix, prisionero desde Alesia, es exhibido en el triunfo de César por la conquista de la Galia y ejecutado después.",
  },
]);

export const siegeOfAlesiaQuiz = QuizSchema.parse({
  id: "quiz-siege-of-alesia",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-alesia-technique",
      question: "¿Cómo tomó César Alesia?",
      options: [
        "Con un asalto por el río",
        "Rodeándola con un doble anillo de fortificaciones",
        "Excavando túneles bajo las murallas",
        "Gracias a la traición de un noble galo",
      ],
      correctOptionIndex: 1,
      explanation:
        "Una línea encerraba a los sitiados (contravalación) y otra protegía a los romanos del ejército de socorro (circunvalación).",
    },
    {
      id: "question-alesia-people",
      question: "¿De qué pueblo galo era Vercingétorix?",
      options: ["Eduos", "Helvecios", "Arvernos", "Belgas"],
      correctOptionIndex: 2,
      explanation: "Los arvernos vivían en el centro de la Galia; la región de Auvernia conserva su nombre.",
    },
    {
      id: "question-alesia-gergovia",
      question: "¿Dónde había derrotado Vercingétorix a César pocos meses antes de Alesia?",
      options: ["Gergovia", "Lutecia", "Massilia", "Bibracte"],
      correctOptionIndex: 0,
      explanation: "Gergovia era la principal plaza fuerte de los arvernos.",
    },
    {
      id: "question-alesia-outer-line",
      question: "¿Para qué servía la línea exterior de fortificaciones romanas?",
      options: [
        "Para impedir que los sitiados escaparan",
        "Para contener las crecidas de los ríos",
        "Para guardar el botín",
        "Para defenderse del ejército galo de socorro",
      ],
      correctOptionIndex: 3,
      explanation: "La línea interior encerraba Alesia; la exterior miraba hacia fuera, contra los refuerzos galos.",
    },
    {
      id: "question-alesia-fate",
      question: "¿Qué fue de Vercingétorix tras rendirse?",
      options: [
        "Huyó a Britania",
        "Fue exhibido en el triunfo de César y ejecutado",
        "Gobernó la Galia como rey aliado de Roma",
      ],
      correctOptionIndex: 1,
      explanation: "Pasó unos seis años prisionero antes del triunfo de César en el 46 a.C.",
    },
  ],
});

export const siegeOfAlesiaComments = CommentSchema.array().parse([
  {
    id: "comment-alesia-1",
    topicId: TOPIC_ID,
    author: "Druso",
    message: "Lo de construir un segundo muro mirando hacia fuera me parece genial: los sitiadores, sitiados.",
    createdAt: new Date("2026-10-20T17:05:00Z"),
  },
  {
    id: "comment-alesia-2",
    topicId: TOPIC_ID,
    author: "Aurelia",
    message: "Leí que durante mucho tiempo se discutió dónde estaba exactamente Alesia. ¿Está ya confirmado?",
    createdAt: new Date("2026-10-21T08:20:00Z"),
  },
]);

export const siegeOfAlesiaRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-alesia-goldsworthy",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "En el nombre de Roma",
    creator: "Adrian Goldsworthy",
    year: 2003,
    description:
      "Retratos de los grandes generales romanos; el dedicado a César explica con detalle la campaña de la Galia y el asedio de Alesia.",
  },
  {
    id: "rec-alesia-asterix",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Astérix y el escudo arverno",
    creator: "René Goscinny y Albert Uderzo",
    year: 1968,
    description:
      "Cómic en el que los galos buscan el escudo que Vercingétorix arrojó a los pies de César en Alesia, con mucho humor sobre aquella derrota.",
  },
  {
    id: "rec-alesia-dorfmann",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "Vercingétorix: la leyenda del druida rey",
    creator: "Jacques Dorfmann",
    year: 2001,
    description: "Con Christopher Lambert como Vercingétorix. Más épica que rigurosa, pero recrea el asedio.",
  },
  {
    id: "rec-alesia-rome-series",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "Roma",
    creator: "HBO / BBC",
    year: 2005,
    description: "Su primer episodio arranca con la rendición de Vercingétorix ante César, al final de la Guerra de las Galias.",
  },
]);
