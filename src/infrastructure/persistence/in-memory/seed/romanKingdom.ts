import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-roman-kingdom";

// Los reinados siguen la cronología tradicional, que los historiadores consideran aproximada.

export const romanKingdomTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "la-monarquia-romana",
  title: "La Monarquía romana",
  era: "ROMAN",
  category: "PERIODS",
  summary:
    "Los dos siglos y medio en que Roma tuvo reyes, de Rómulo a Tarquinio el Soberbio: el Senado, la religión, la influencia etrusca y una ciudad que crecía en el Lacio.",
  period: { start: { year: -753 }, end: { year: -509 } },
  introduction: [
    "Según la tradición, Roma tuvo siete reyes entre el 753 y el 509 a.C.: Rómulo, Numa Pompilio, Tulio Hostilio, Anco Marcio, Tarquinio Prisco, Servio Tulio y Tarquinio el Soberbio. El trono no se heredaba: a la muerte de un rey, un interrey gobernaba hasta que se elegía al siguiente, que necesitaba el voto del pueblo reunido en curias y la aprobación de los dioses.",
    "A cada rey se le atribuyó una parte de las instituciones de Roma: a Numa, la religión y el calendario; a Tulio Hostilio, la destrucción de la vecina Alba Longa; a Anco Marcio, el puerto de Ostia y el primer puente sobre el Tíber. Junto al rey estaba el Senado, un consejo formado por los jefes de las familias patricias.",
    "Los tres últimos reyes reflejan la influencia etrusca. Tarquinio Prisco drenó el valle del Foro con la Cloaca Máxima y comenzó el templo de Júpiter en el Capitolio; Servio Tulio repartió a los ciudadanos según su riqueza y se le atribuyó una muralla, aunque la que hoy se conserva es posterior; y Tarquinio el Soberbio gobernó como un tirano hasta que los romanos lo expulsaron. Muchos de estos detalles son legendarios, pero la arqueología confirma que en el siglo VI a.C. Roma ya era una de las ciudades más importantes del Lacio.",
  ],
  keyFacts: [
    { label: "Periodo", value: "753–509 a.C., según las fechas tradicionales" },
    { label: "Reyes", value: "Siete, de Rómulo a Tarquinio el Soberbio" },
    { label: "Elección", value: "El trono no se heredaba: lo votaba el pueblo reunido en curias" },
    { label: "Instituciones", value: "El rey, el Senado y los comicios curiados" },
    { label: "Influencia", value: "Etrusca, sobre todo en el siglo VI a.C." },
    { label: "Final", value: "La expulsión de Tarquinio el Soberbio en el 509 a.C." },
  ],
  image: catalogImage("roma-foro"),
  relatedTopicIds: ["topic-roman-republic-birth", "topic-romulus"],
  status: "PUBLISHED",
});

export const romanKingdomEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-kingdom-romulus",
    topicId: TOPIC_ID,
    title: "Rómulo, primer rey",
    date: { year: -753 },
    era: "ROMAN",
    description: "Con la fundación de la ciudad empieza, según la tradición, el reinado de Rómulo.",
  },
  {
    id: "event-kingdom-numa",
    topicId: TOPIC_ID,
    title: "Reinado de Numa Pompilio",
    date: { year: -715 },
    era: "ROMAN",
    description: "El rey sabino organiza la religión romana, los sacerdocios y el calendario.",
  },
  {
    id: "event-kingdom-tullus",
    topicId: TOPIC_ID,
    title: "Reinado de Tulio Hostilio",
    date: { year: -673 },
    era: "ROMAN",
    description: "Rey guerrero que destruye Alba Longa y traslada a sus habitantes a Roma.",
  },
  {
    id: "event-kingdom-ancus",
    topicId: TOPIC_ID,
    title: "Reinado de Anco Marcio",
    date: { year: -640 },
    era: "ROMAN",
    description: "Se le atribuyen el puerto de Ostia, en la desembocadura del Tíber, y el puente Sublicio, el primero sobre el río.",
  },
  {
    id: "event-kingdom-tarquin-elder",
    topicId: TOPIC_ID,
    title: "Reinado de Tarquinio Prisco",
    date: { year: -616 },
    era: "ROMAN",
    description: "El primer rey de origen etrusco drena el valle del Foro con la Cloaca Máxima y comienza el templo de Júpiter Capitolino.",
  },
  {
    id: "event-kingdom-servius",
    topicId: TOPIC_ID,
    title: "Reinado de Servio Tulio",
    date: { year: -578 },
    era: "ROMAN",
    description: "Divide a los ciudadanos en clases según su riqueza, que determinan su lugar en el ejército y en las votaciones.",
  },
  {
    id: "event-kingdom-tarquin-proud",
    topicId: TOPIC_ID,
    title: "Reinado de Tarquinio el Soberbio",
    date: { year: -534 },
    era: "ROMAN",
    description: "El último rey gobierna sin consultar al Senado y se gana el odio de los romanos.",
  },
  {
    id: "event-kingdom-end",
    topicId: TOPIC_ID,
    title: "Expulsión de los reyes",
    date: { year: -509 },
    era: "ROMAN",
    description: "Los romanos expulsan a Tarquinio el Soberbio y su familia. Comienza la República.",
  },
]);

export const romanKingdomQuiz = QuizSchema.parse({
  id: "quiz-roman-kingdom",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-kingdom-count",
      question: "¿Cuántos reyes tuvo Roma según la tradición?",
      options: ["Cinco", "Siete", "Nueve", "Doce"],
      correctOptionIndex: 1,
    },
    {
      id: "question-kingdom-numa",
      question: "¿A qué rey se atribuye la organización de la religión y del calendario romanos?",
      options: ["Rómulo", "Tulio Hostilio", "Numa Pompilio", "Servio Tulio"],
      correctOptionIndex: 2,
    },
    {
      id: "question-kingdom-cloaca",
      question: "¿Qué gran obra se atribuye a Tarquinio Prisco?",
      options: ["El Coliseo", "La Vía Apia", "El Panteón", "La Cloaca Máxima"],
      correctOptionIndex: 3,
      explanation: "La Cloaca Máxima drenaba el valle pantanoso donde se levantaría el Foro, y todavía hoy funciona en parte.",
    },
    {
      id: "question-kingdom-election",
      question: "¿Cómo llegaba al trono un rey de Roma?",
      options: [
        "Lo votaba el pueblo, con la aprobación de los dioses",
        "Lo heredaba el hijo mayor del rey anterior",
        "Lo nombraba el rey de Alba Longa",
        "Lo sorteaban los senadores",
      ],
      correctOptionIndex: 0,
    },
    {
      id: "question-kingdom-etruscans",
      question: "¿Qué pueblo influyó más en Roma durante sus últimos reyes?",
      options: ["Los galos", "Los etruscos", "Los cartagineses", "Los espartanos"],
      correctOptionIndex: 1,
      explanation: "Los Tarquinios eran de origen etrusco, y con ellos llegaron obras públicas, templos y símbolos de poder.",
    },
  ],
});

export const romanKingdomRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-kingdom-cornell",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "The Beginnings of Rome",
    creator: "Tim Cornell",
    year: 1995,
    description: "La obra de referencia sobre la Roma arcaica, de los orígenes a las guerras púnicas, combinando fuentes y arqueología.",
  },
  {
    id: "rec-kingdom-spqr",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "SPQR. Una historia de la antigua Roma",
    creator: "Mary Beard",
    year: 2015,
    description: "Explica qué hay de historia y qué de invención en los siete reyes de Roma.",
  },
]);
