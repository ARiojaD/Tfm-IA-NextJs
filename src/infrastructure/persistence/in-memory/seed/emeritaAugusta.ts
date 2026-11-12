import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-emerita-augusta";

// Una ciudad tiene inicio pero no final: el periodo es solo su fundación.

export const emeritaAugustaTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "emerita-augusta",
  title: "Emerita Augusta",
  era: "HISPANIA",
  category: "CITIES",
  summary:
    "La ciudad que Augusto fundó para sus veteranos junto al Guadiana, capital de Lusitania y hoy Mérida, con uno de los conjuntos romanos mejor conservados de España.",
  period: { start: { year: -25 } },
  introduction: [
    "Emerita Augusta, la actual Mérida, fue fundada en el 25 a.C. por orden de Augusto para asentar a los soldados licenciados, los eméritos, de las legiones V Alaudae y X Gemina, que habían combatido en las guerras cántabras. Se levantó junto al río Guadiana, en un cruce de caminos clave del oeste de Hispania, donde un largo puente de piedra permitía cruzarlo.",
    "Poco después se convirtió en la capital de la nueva provincia de Lusitania. Agripa, el yerno de Augusto, promovió la construcción del teatro, inaugurado hacia el 16 a.C., y junto a él se levantó el anfiteatro; más tarde se añadió un circo para las carreras de carros. Los acueductos, como el de los Milagros, traían el agua desde los embalses de Proserpina y Cornalvo.",
    "Emerita fue durante siglos una de las ciudades más importantes de la Hispania romana, y a finales del siglo III llegó a ser la capital de toda la diócesis de las Hispanias. Su conjunto arqueológico, uno de los mayores de España, es Patrimonio de la Humanidad desde 1993, y su teatro acoge cada verano el Festival Internacional de Teatro Clásico.",
  ],
  keyFacts: [
    { label: "Fundación", value: "25 a.C." },
    { label: "Fundador", value: "Augusto, a través de su legado Publio Carisio" },
    { label: "Primeros habitantes", value: "Veteranos de las legiones V Alaudae y X Gemina" },
    { label: "Capital", value: "De la provincia de Lusitania" },
    { label: "Monumentos", value: "Teatro, anfiteatro, circo, puente sobre el Guadiana y acueducto de los Milagros" },
    { label: "Hoy", value: "Mérida. Patrimonio de la Humanidad desde 1993" },
  ],
  image: catalogImage("hispania-teatro-merida"),
  relatedTopicIds: ["topic-roman-empire", "topic-siege-of-numantia", "topic-viriathus"],
  status: "PUBLISHED",
});

export const emeritaAugustaEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-emerita-foundation",
    topicId: TOPIC_ID,
    title: "Fundación de Emerita Augusta",
    date: { year: -25 },
    era: "HISPANIA",
    description: "Los veteranos de las guerras cántabras reciben tierras en la nueva colonia junto al Guadiana.",
  },
  {
    id: "event-emerita-capital",
    topicId: TOPIC_ID,
    title: "Capital de Lusitania",
    date: { year: -15 },
    era: "HISPANIA",
    description: "Augusto divide Hispania en tres provincias, y Emerita se convierte en la capital de la Lusitania.",
  },
  {
    id: "event-emerita-theatre",
    topicId: TOPIC_ID,
    title: "Inauguración del teatro",
    date: { year: -16 },
    era: "HISPANIA",
    description: "Se inaugura el teatro promovido por Agripa, con capacidad para unos 6.000 espectadores.",
  },
  {
    id: "event-emerita-amphitheatre",
    topicId: TOPIC_ID,
    title: "Inauguración del anfiteatro",
    date: { year: -8 },
    era: "HISPANIA",
    description: "Junto al teatro se inaugura el anfiteatro, escenario de combates de gladiadores y luchas con fieras.",
  },
]);

export const emeritaAugustaQuiz = QuizSchema.parse({
  id: "quiz-emerita-augusta",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-emerita-founder",
      question: "¿Qué emperador ordenó fundar Emerita Augusta?",
      options: ["Trajano", "Augusto", "Adriano", "Claudio"],
      correctOptionIndex: 1,
    },
    {
      id: "question-emerita-veterans",
      question: "¿Para quiénes se fundó la ciudad?",
      options: ["Para mercaderes griegos", "Para colonos fenicios", "Para soldados licenciados", "Para esclavos liberados"],
      correctOptionIndex: 2,
      explanation: "De esos soldados eméritos le viene el nombre a la ciudad.",
    },
    {
      id: "question-emerita-province",
      question: "¿De qué provincia romana fue capital Emerita Augusta?",
      options: ["La Bética", "La Tarraconense", "La Gallaecia", "La Lusitania"],
      correctOptionIndex: 3,
    },
    {
      id: "question-emerita-river",
      question: "¿Junto a qué río se fundó?",
      options: ["El Guadiana", "El Tajo", "El Ebro", "El Duero"],
      correctOptionIndex: 0,
    },
    {
      id: "question-emerita-theatre",
      question: "¿Quién promovió la construcción del teatro romano de Mérida?",
      options: ["Julio César", "Agripa", "Marco Antonio", "Séneca"],
      correctOptionIndex: 1,
      explanation: "Su nombre todavía se lee en las inscripciones del edificio.",
    },
  ],
});

export const emeritaAugustaRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-emerita-memoria",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "Memoria de España",
    creator: "RTVE",
    year: 2004,
    description: "Serie documental sobre la historia de España, con capítulos dedicados a la Hispania romana.",
  },
]);
