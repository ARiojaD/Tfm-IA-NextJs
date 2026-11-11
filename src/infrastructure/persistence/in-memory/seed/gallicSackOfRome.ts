import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-gallic-sack-of-rome";

// Dated with the traditional Roman chronology (390 a.C.); the Greek historian Polybius places it in 387–386.

export const gallicSackOfRomeTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "el-saqueo-galo-de-roma",
  title: "El saqueo galo de Roma",
  era: "ROMAN",
  category: "WARS_AND_BATTLES",
  summary:
    "La derrota del río Alia y el saqueo de Roma por los galos de Breno: las ocas del Capitolio, la espada en la balanza y el «ay de los vencidos».",
  period: { start: { year: -390, month: 7 } },
  introduction: [
    "A comienzos del siglo IV a.C., pueblos celtas a los que los romanos llamaban galos se habían asentado en el norte de Italia. Hacia el 390 a.C., un ejército de galos senones dirigido por Breno bajó hasta Clusium, en Etruria, y desde allí marchó sobre Roma. El 18 de julio, a orillas del río Alia, a unos 16 kilómetros de la ciudad, el ejército romano se desbandó ante su ataque.",
    "Los galos entraron en una Roma casi indefensa, la saquearon y la incendiaron. Los defensores se refugiaron en la colina del Capitolio y resistieron un asedio de varios meses. Según la tradición, una noche los galos intentaron escalar la roca en silencio, pero los graznidos de las ocas sagradas de Juno despertaron a Marco Manlio, que rechazó el ataque.",
    "Al final, los romanos aceptaron pagar mil libras de oro para que los galos se marcharan. Cuando protestaron porque las pesas estaban trucadas, Breno arrojó su espada en la balanza y gritó «vae victis», ¡ay de los vencidos! La leyenda añade que Marco Furio Camilo llegó a tiempo de derrotarlos, pero lo más probable es que los galos se fueran con el rescate. Roma tardó años en recuperarse, levantó una gran muralla de piedra y recordó siempre el día del Alia como uno de los más nefastos de su calendario.",
  ],
  keyFacts: [
    { label: "Fecha", value: "390 a.C. según la cronología romana; 387–386 a.C. según Polibio" },
    { label: "Lugar", value: "El río Alia y la ciudad de Roma" },
    { label: "Bandos", value: "República romana contra los galos senones" },
    { label: "Comandantes", value: "Breno, al frente de los galos; Marco Furio Camilo, según la tradición romana" },
    { label: "Resultado", value: "Victoria gala, saqueo de Roma y pago de un rescate en oro" },
    { label: "Consecuencia", value: "La construcción de la muralla serviana" },
  ],
  image: catalogImage("breno-balanza"),
  relatedTopicIds: ["topic-roman-republic-birth"],
  status: "PUBLISHED",
});

export const gallicSackOfRomeEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-sack-clusium",
    topicId: TOPIC_ID,
    title: "Los galos atacan Clusium",
    date: { year: -391 },
    era: "ROMAN",
    description: "Los galos senones asedian la ciudad etrusca de Clusium, que pide ayuda a Roma. Los embajadores romanos acaban combatiendo contra los galos.",
  },
  {
    id: "event-sack-allia",
    topicId: TOPIC_ID,
    title: "Batalla del Alia",
    date: { year: -390, month: 7 },
    era: "ROMAN",
    description: "El 18 de julio, el ejército romano se desbanda ante la carga gala a orillas del río Alia, al norte de Roma.",
  },
  {
    id: "event-sack-rome",
    topicId: TOPIC_ID,
    title: "Saqueo e incendio de Roma",
    date: { year: -390, month: 7 },
    era: "ROMAN",
    description: "Los galos entran en la ciudad, casi abandonada, y la saquean. Solo resiste el Capitolio.",
  },
  {
    id: "event-sack-geese",
    topicId: TOPIC_ID,
    title: "Las ocas del Capitolio",
    date: { year: -390 },
    era: "ROMAN",
    description: "Según la tradición, los graznidos de las ocas sagradas de Juno frustran un ataque nocturno contra el Capitolio.",
  },
  {
    id: "event-sack-ransom",
    topicId: TOPIC_ID,
    title: "El rescate y el «vae victis»",
    date: { year: -390 },
    era: "ROMAN",
    description: "Roma paga mil libras de oro para que los galos se retiren. Breno arroja su espada en la balanza.",
  },
  {
    id: "event-sack-servian-wall",
    topicId: TOPIC_ID,
    title: "Comienza la muralla serviana",
    date: { year: -378 },
    era: "ROMAN",
    description: "Roma rodea sus colinas con una gran muralla de bloques de piedra, de unos 11 kilómetros, para no volver a quedar indefensa.",
  },
]);

export const gallicSackOfRomeQuiz = QuizSchema.parse({
  id: "quiz-gallic-sack-of-rome",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-sack-allia",
      question: "¿Junto a qué río derrotaron los galos al ejército romano?",
      options: ["El Rubicón", "El Trebia", "El Alia", "El Tíber"],
      correctOptionIndex: 2,
    },
    {
      id: "question-sack-geese",
      question: "Según la tradición, ¿qué animales alertaron a los defensores del Capitolio?",
      options: ["Unas ocas", "Unos perros", "Unos caballos", "Unas águilas"],
      correctOptionIndex: 0,
      explanation: "Eran las ocas sagradas del templo de Juno. Los perros, en cambio, no ladraron.",
    },
    {
      id: "question-sack-vae-victis",
      question: "¿Qué gritó Breno al arrojar su espada en la balanza?",
      options: ["«Alea iacta est»", "«Veni, vidi, vici»", "«Carthago delenda est»", "«Vae victis»"],
      correctOptionIndex: 3,
      explanation: "«Vae victis» significa «¡ay de los vencidos!».",
    },
    {
      id: "question-sack-camillus",
      question: "¿Quién, según la tradición romana, salvó a Roma de los galos?",
      options: ["Escipión el Africano", "Marco Furio Camilo", "Cincinato", "Cayo Mario"],
      correctOptionIndex: 1,
    },
    {
      id: "question-sack-wall",
      question: "¿Qué construyó Roma para no volver a quedar indefensa?",
      options: ["La muralla serviana", "La muralla aureliana", "El muro de Adriano", "La Cloaca Máxima"],
      correctOptionIndex: 0,
      explanation: "La muralla aureliana, mucho más grande, se levantaría seis siglos después.",
    },
  ],
});

export const gallicSackOfRomeRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-sack-montanelli",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Historia de Roma",
    creator: "Indro Montanelli",
    year: 1957,
    description: "Una historia de Roma amena y llena de anécdotas, de la fundación a la caída del Imperio.",
  },
  {
    id: "rec-sack-cornell",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "The Beginnings of Rome",
    creator: "Tim Cornell",
    year: 1995,
    description: "Analiza qué hay de cierto en el relato del saqueo galo y cómo lo transformó la memoria romana.",
  },
]);
