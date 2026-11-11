import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-viriathus";

// Su nacimiento es desconocido: el periodo abarca los años en que dirigió a los lusitanos (147–139 a.C.).

export const viriathusTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "viriato",
  title: "Viriato",
  era: "HISPANIA",
  category: "PEOPLE",
  summary:
    "El caudillo lusitano que durante ocho años derrotó a los ejércitos de Roma con la guerra de guerrillas, hasta que fue asesinado por tres de sus hombres.",
  period: { start: { year: -147 }, end: { year: -139 } },
  introduction: [
    "Viriato fue un caudillo de los lusitanos, un pueblo del oeste de la Península Ibérica que vivía entre el Duero y el Tajo. Las fuentes antiguas lo describen como un pastor y cazador de origen humilde convertido en guerrero. En el 150 a.C. sobrevivió a la matanza de lusitanos ordenada por el pretor Servio Sulpicio Galba, que les había prometido tierras a cambio de rendirse y los masacró cuando se entregaron.",
    "En el 147 a.C. los lusitanos, de nuevo a punto de rendirse, lo eligieron jefe. Viriato los sacó del cerco y empezó una guerra de guerrillas basada en el conocimiento del terreno, las retiradas fingidas y las emboscadas. Durante ocho años derrotó a varios ejércitos romanos y llevó sus campañas hasta la Carpetania, en el centro de la Península, y el sur de Hispania.",
    "En el 140 a.C. acorraló al cónsul Quinto Fabio Máximo Serviliano y le obligó a firmar una paz que lo reconocía como amigo del pueblo romano. Pero Roma rompió el tratado, y el general Quinto Servilio Cepión sobornó a tres de los hombres de confianza de Viriato, Audax, Ditalcón y Minuro, que lo asesinaron mientras dormía en el 139 a.C. Según la tradición, cuando fueron a cobrar, se les respondió que Roma no pagaba a traidores. Viriato es hoy un símbolo de resistencia en España y en Portugal.",
  ],
  keyFacts: [
    { label: "Pueblo", value: "Los lusitanos, entre el Duero y el Tajo" },
    { label: "Origen", value: "Pastor y cazador, según las fuentes antiguas" },
    { label: "Caudillo", value: "Del 147 al 139 a.C." },
    { label: "Táctica", value: "Guerra de guerrillas: emboscadas, retiradas fingidas y conocimiento del terreno" },
    { label: "Muerte", value: "139 a.C., asesinado por tres de sus hombres sobornados por Roma" },
    { label: "Fuentes", value: "Apiano y Diodoro de Sicilia" },
  ],
  image: catalogImage("viriato-zamora"),
  relatedTopicIds: ["topic-emerita-augusta", "topic-siege-of-numantia"],
  status: "PUBLISHED",
});

export const viriathusEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-viriathus-galba",
    topicId: TOPIC_ID,
    title: "La matanza de Galba",
    date: { year: -150 },
    era: "HISPANIA",
    description: "El pretor Galba promete tierras a los lusitanos que se rindan y los masacra cuando se entregan. Viriato es uno de los pocos que escapan.",
  },
  {
    id: "event-viriathus-chief",
    topicId: TOPIC_ID,
    title: "Elegido caudillo",
    date: { year: -147 },
    era: "HISPANIA",
    description: "Rodeados por el ejército del pretor Vetilio, los lusitanos eligen a Viriato, que logra sacarlos del cerco.",
  },
  {
    id: "event-viriathus-tribola",
    topicId: TOPIC_ID,
    title: "Emboscada de Tríbola",
    date: { year: -147 },
    era: "HISPANIA",
    description: "Viriato atrae al ejército romano a una emboscada en la que muere el propio Vetilio.",
  },
  {
    id: "event-viriathus-peace",
    topicId: TOPIC_ID,
    title: "Paz con Serviliano",
    date: { year: -140 },
    era: "HISPANIA",
    description: "Tras acorralar al ejército del cónsul Serviliano, Viriato obtiene un tratado que lo reconoce como amigo del pueblo romano.",
  },
  {
    id: "event-viriathus-death",
    topicId: TOPIC_ID,
    title: "Asesinato de Viriato",
    date: { year: -139 },
    era: "HISPANIA",
    description: "Roma rompe la paz y el general Cepión soborna a Audax, Ditalcón y Minuro, que matan a Viriato mientras duerme.",
  },
]);

export const viriathusQuiz = QuizSchema.parse({
  id: "quiz-viriathus",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-viriathus-people",
      question: "¿A qué pueblo pertenecía Viriato?",
      options: ["A los celtíberos", "A los lusitanos", "A los cántabros", "A los íberos"],
      correctOptionIndex: 1,
    },
    {
      id: "question-viriathus-galba",
      question: "¿Qué pretor romano masacró a los lusitanos en el 150 a.C.?",
      options: ["Escipión Emiliano", "Quinto Sertorio", "Servio Sulpicio Galba", "Cayo Mario"],
      correctOptionIndex: 2,
    },
    {
      id: "question-viriathus-tactics",
      question: "¿Qué forma de lucha caracterizó a Viriato?",
      options: [
        "La guerra de guerrillas",
        "Las grandes batallas en campo abierto",
        "Los asedios con máquinas de guerra",
        "Los combates navales",
      ],
      correctOptionIndex: 0,
    },
    {
      id: "question-viriathus-death",
      question: "¿Cómo murió Viriato?",
      options: [
        "En una batalla contra Escipión",
        "Ejecutado en Roma",
        "De una enfermedad",
        "Asesinado por tres de sus hombres, sobornados por Roma",
      ],
      correctOptionIndex: 3,
    },
    {
      id: "question-viriathus-peace",
      question: "¿Con qué cónsul romano firmó Viriato la paz del 140 a.C.?",
      options: ["Julio César", "Quinto Fabio Máximo Serviliano", "Pompeyo", "Marco Claudio Marcelo"],
      correctOptionIndex: 1,
    },
  ],
});

export const viriathusRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-viriathus-hispania-series",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "Hispania, la leyenda",
    creator: "Antena 3",
    year: 2010,
    description: "Serie de ficción sobre la resistencia de Viriato y los suyos frente a Roma.",
  },
  {
    id: "rec-viriathus-memoria",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "Memoria de España",
    creator: "RTVE",
    year: 2004,
    description: "Serie documental sobre la historia de España, con capítulos dedicados a la conquista romana de Hispania.",
  },
]);
