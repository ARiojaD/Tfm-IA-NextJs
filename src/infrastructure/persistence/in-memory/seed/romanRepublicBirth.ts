import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-roman-republic-birth";

export const romanRepublicBirthTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "el-nacimiento-de-la-republica",
  title: "El nacimiento de la República",
  era: "ROMAN",
  category: "PERIODS",
  summary:
    "La caída del último rey, los primeros cónsules y los primeros pasos de la República romana, entre la lucha de patricios y plebeyos y las leyes de las Doce Tablas.",
  period: { start: { year: -509 }, end: { year: -450 } },
  introduction: [
    "Según la tradición, el final de la monarquía empezó con un crimen: Sexto Tarquinio, hijo del rey Tarquinio el Soberbio, violó a Lucrecia, una noble romana que, después de contárselo a su familia, se quitó la vida. Lucio Junio Bruto juró sobre su cuerpo expulsar a los Tarquinios, y en el 509 a.C. el pueblo se levantó contra el rey.",
    "Los romanos sustituyeron al rey por dos magistrados elegidos cada año, que más tarde se llamaron cónsules, se vigilaban entre sí y debían rendir cuentas al terminar su mandato. Bruto fue uno de los dos primeros, y la tradición cuenta que hizo ejecutar a sus propios hijos por conspirar para devolver el trono a Tarquinio, la escena que pintó David. Durante siglos, «rey» fue un insulto en Roma.",
    "La nueva República era aristocrática: los patricios dominaban el Senado y las magistraturas, y los plebeyos empezaron una larga lucha por sus derechos. En el 494 a.C. se retiraron en masa al monte Sacro hasta conseguir sus propios representantes, los tribunos de la plebe, y hacia el 450 a.C. lograron que las leyes se pusieran por escrito en las Doce Tablas. Mientras tanto, Roma resistía los intentos de los etruscos y los latinos de devolver el trono a Tarquinio, como el asedio del rey Porsena.",
  ],
  keyFacts: [
    { label: "Fecha", value: "509 a.C., según la fecha tradicional" },
    { label: "Detonante", value: "La violación y el suicidio de Lucrecia" },
    { label: "Primeros cónsules", value: "Lucio Junio Bruto y Lucio Tarquinio Colatino" },
    { label: "Gobierno", value: "Dos cónsules elegidos cada año, el Senado y las asambleas del pueblo" },
    { label: "Conflicto", value: "La lucha entre patricios y plebeyos por los derechos políticos" },
    { label: "Fuente", value: "Tito Livio, Historia de Roma desde su fundación, libros I a III" },
  ],
  image: catalogImage("republica-bruto-david"),
  relatedTopicIds: ["topic-gallic-sack-of-rome", "topic-roman-kingdom"],
  status: "PUBLISHED",
});

export const romanRepublicBirthEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-republic-lucretia",
    topicId: TOPIC_ID,
    title: "Muerte de Lucrecia",
    date: { year: -509 },
    era: "ROMAN",
    description: "Lucrecia se quita la vida tras ser violada por el hijo del rey, y Bruto jura vengarla expulsando a los Tarquinios.",
  },
  {
    id: "event-republic-first-consuls",
    topicId: TOPIC_ID,
    title: "Los primeros cónsules",
    date: { year: -509 },
    era: "ROMAN",
    description: "Expulsado el rey, Bruto y Colatino son elegidos para gobernar juntos durante un año.",
  },
  {
    id: "event-republic-porsena",
    topicId: TOPIC_ID,
    title: "Asedio del rey Porsena",
    date: { year: -508 },
    era: "ROMAN",
    description:
      "El rey etrusco de Clusium ataca Roma. Según la leyenda, Horacio Cocles defendió solo el puente Sublicio mientras los romanos lo derribaban.",
  },
  {
    id: "event-republic-lake-regillus",
    topicId: TOPIC_ID,
    title: "Batalla del lago Regilo",
    date: { year: -496 },
    era: "ROMAN",
    description: "Roma vence a los latinos, que apoyaban a Tarquinio, y acaba con las esperanzas del rey de recuperar el trono.",
  },
  {
    id: "event-republic-secession",
    topicId: TOPIC_ID,
    title: "Primera secesión de la plebe",
    date: { year: -494 },
    era: "ROMAN",
    description: "Los plebeyos abandonan la ciudad y se retiran al monte Sacro hasta lograr los tribunos de la plebe.",
  },
  {
    id: "event-republic-twelve-tables",
    topicId: TOPIC_ID,
    title: "Las Doce Tablas",
    date: { year: -450 },
    era: "ROMAN",
    description: "Las leyes de Roma se ponen por escrito y se exponen en el Foro, para que todos puedan conocerlas.",
  },
]);

export const romanRepublicBirthQuiz = QuizSchema.parse({
  id: "quiz-roman-republic-birth",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-republic-brutus",
      question: "¿Quién encabezó la revuelta contra Tarquinio el Soberbio?",
      options: ["Marco Junio Bruto", "Lucio Junio Bruto", "Escipión el Africano", "Marco Furio Camilo"],
      correctOptionIndex: 1,
      explanation: "Marco Junio Bruto, uno de los asesinos de César, presumía de descender de él.",
    },
    {
      id: "question-republic-consuls",
      question: "¿Qué sustituyó al rey en el gobierno de Roma?",
      options: ["Un dictador vitalicio", "Un consejo de diez reyes", "Dos magistrados elegidos cada año", "El pontífice máximo"],
      correctOptionIndex: 2,
    },
    {
      id: "question-republic-tribunes",
      question: "¿Qué consiguieron los plebeyos con la secesión del 494 a.C.?",
      options: [
        "El derecho a elegir rey",
        "La abolición del Senado",
        "La ciudadanía para todos los latinos",
        "Sus propios representantes, los tribunos de la plebe",
      ],
      correctOptionIndex: 3,
    },
    {
      id: "question-republic-tables",
      question: "¿Cómo se llamaron las primeras leyes escritas de Roma?",
      options: ["Las Doce Tablas", "El Código de Justiniano", "Las leyes de Solón", "La Ley Sálica"],
      correctOptionIndex: 0,
    },
    {
      id: "question-republic-porsena",
      question: "¿Qué rey etrusco atacó Roma para devolver el trono a Tarquinio?",
      options: ["Breno", "Porsena", "Pirro", "Aníbal"],
      correctOptionIndex: 1,
    },
  ],
});

export const romanRepublicBirthRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-republic-lucrece",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "La violación de Lucrecia",
    creator: "William Shakespeare",
    year: 1594,
    description: "Poema narrativo sobre el crimen que, según la tradición, acabó con la monarquía romana.",
  },
  {
    id: "rec-republic-coriolanus",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Coriolano",
    creator: "William Shakespeare",
    year: 1608,
    description: "Tragedia sobre un general de los primeros años de la República, enfrentado a los plebeyos y a sus tribunos.",
  },
  {
    id: "rec-republic-coriolanus-film",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "Coriolanus",
    creator: "Ralph Fiennes",
    year: 2011,
    description: "Adaptación de la obra de Shakespeare trasladada a una guerra moderna, con el texto original.",
  },
  {
    id: "rec-republic-spqr",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "SPQR. Una historia de la antigua Roma",
    creator: "Mary Beard",
    year: 2015,
    description: "Cómo construyeron los romanos el relato de su propia libertad frente a los reyes.",
  },
]);
