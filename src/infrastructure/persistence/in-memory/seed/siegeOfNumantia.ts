import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-siege-of-numantia";

export const siegeOfNumantiaTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "asedio-de-numancia",
  title: "Asedio de Numancia",
  era: "HISPANIA",
  category: "WARS_AND_BATTLES",
  summary:
    "La ciudad celtíbera que resistió veinte años a Roma, hasta que Escipión Emiliano la rodeó con un cerco infranqueable y la rindió por hambre.",
  period: { start: { year: -134 }, end: { year: -133 } },
  introduction: [
    "Numancia era una ciudad de los arévacos, un pueblo celtíbero, levantada sobre un cerro junto al Duero, cerca de la actual Soria. Durante veinte años resistió a Roma en las guerras celtibéricas: varios ejércitos fracasaron ante ella, y en el 137 a.C. el cónsul Cayo Hostilio Mancino llegó a rendirse con unos 20.000 hombres, un tratado que el Senado se negó a reconocer.",
    "En el 134 a.C. Roma envió a su general más prestigioso, Publio Cornelio Escipión Emiliano, el destructor de Cartago. Escipión restableció la disciplina de un ejército desmoralizado y, en lugar de asaltar la ciudad, la rodeó con un cerco de unos 9 kilómetros, con siete campamentos, torres y fosos, y cerró el paso del río para que nadie pudiera entrar ni salir.",
    "Unos 4.000 numantinos resistieron casi un año frente a unos 60.000 romanos y aliados. El hambre llevó a muchos a quitarse la vida antes que rendirse, y en el verano del 133 a.C. los supervivientes se entregaron. Escipión arrasó la ciudad y recibió el sobrenombre de Numantino. Numancia quedó como símbolo de resistencia, sobre todo desde que Cervantes la llevó al teatro.",
  ],
  keyFacts: [
    { label: "Fecha", value: "Del 134 al 133 a.C." },
    { label: "Lugar", value: "Numancia, en el cerro de la Muela, en Garray (Soria)" },
    { label: "Guerra", value: "Guerras celtibéricas" },
    { label: "Bandos", value: "República romana contra los numantinos, del pueblo celtíbero de los arévacos" },
    { label: "Comandante", value: "Publio Cornelio Escipión Emiliano" },
    { label: "Fuerzas", value: "Unos 60.000 romanos y aliados frente a unos 4.000 numantinos" },
    { label: "Resultado", value: "Rendición y destrucción de Numancia" },
  ],
  image: catalogImage("numancia-ultimo-dia"),
  relatedTopicIds: ["topic-emerita-augusta", "topic-viriathus"],
  status: "PUBLISHED",
});

export const siegeOfNumantiaEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-numantia-war",
    topicId: TOPIC_ID,
    title: "Comienzan las guerras numantinas",
    date: { year: -153 },
    era: "HISPANIA",
    description: "El cónsul Quinto Fulvio Nobilior es derrotado ante Numancia, a pesar de llevar elefantes de guerra.",
  },
  {
    id: "event-numantia-mancinus",
    topicId: TOPIC_ID,
    title: "La rendición de Mancino",
    date: { year: -137 },
    era: "HISPANIA",
    description: "Rodeado por los numantinos, el cónsul Mancino se rinde con su ejército. El Senado anula el tratado y, al año siguiente, entrega a Mancino a los numantinos, que lo rechazan.",
  },
  {
    id: "event-numantia-scipio",
    topicId: TOPIC_ID,
    title: "Llega Escipión Emiliano",
    date: { year: -134 },
    era: "HISPANIA",
    description: "El vencedor de Cartago toma el mando y endurece la disciplina de un ejército desmoralizado.",
  },
  {
    id: "event-numantia-blockade",
    topicId: TOPIC_ID,
    title: "El cerco",
    date: { year: -134 },
    era: "HISPANIA",
    description: "Los romanos rodean Numancia con un muro de unos 9 kilómetros, siete campamentos y torres, y bloquean el río.",
  },
  {
    id: "event-numantia-fall",
    topicId: TOPIC_ID,
    title: "Caída de Numancia",
    date: { year: -133 },
    era: "HISPANIA",
    description: "Agotados por el hambre, los supervivientes se rinden. Escipión arrasa la ciudad.",
  },
]);

export const siegeOfNumantiaQuiz = QuizSchema.parse({
  id: "quiz-siege-of-numantia",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-numantia-scipio",
      question: "¿Qué general romano dirigió el asedio final de Numancia?",
      options: ["Julio César", "Cayo Mario", "Escipión Emiliano", "Pompeyo"],
      correctOptionIndex: 2,
    },
    {
      id: "question-numantia-place",
      question: "¿Cerca de qué ciudad actual estaba Numancia?",
      options: ["Soria", "Zamora", "Tarragona", "Cádiz"],
      correctOptionIndex: 0,
    },
    {
      id: "question-numantia-tactic",
      question: "¿Qué hizo Escipión en lugar de asaltar la ciudad?",
      options: [
        "La incendió con flechas encendidas",
        "Negoció una rendición con honores",
        "Excavó túneles bajo sus murallas",
        "La rodeó con un cerco para rendirla por hambre",
      ],
      correctOptionIndex: 3,
    },
    {
      id: "question-numantia-people",
      question: "¿A qué pueblo celtíbero pertenecían los numantinos?",
      options: ["A los lusitanos", "A los arévacos", "A los vacceos", "A los ilergetes"],
      correctOptionIndex: 1,
    },
    {
      id: "question-numantia-cervantes",
      question: "¿Qué escritor llevó al teatro la resistencia de Numancia?",
      options: ["Miguel de Cervantes", "Lope de Vega", "Calderón de la Barca", "Francisco de Quevedo"],
      correctOptionIndex: 0,
      explanation: "Su tragedia «El cerco de Numancia» se escribió hacia 1585.",
    },
  ],
});

export const siegeOfNumantiaRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-numantia-cervantes",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "El cerco de Numancia",
    creator: "Miguel de Cervantes",
    year: 1585,
    description: "Tragedia en verso sobre los últimos días de Numancia, que prefiere morir antes que rendirse.",
  },
  {
    id: "rec-numantia-memoria",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "Memoria de España",
    creator: "RTVE",
    year: 2004,
    description: "Serie documental sobre la historia de España, con capítulos dedicados a la conquista romana de Hispania.",
  },
]);
