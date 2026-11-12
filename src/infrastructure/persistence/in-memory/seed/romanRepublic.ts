import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-roman-republic";

// La etapa entera, de la expulsión de los reyes a Augusto. Sus primeros sesenta años tienen tema propio
// ("El nacimiento de la República"), que la cronología muestra como subetapa; por eso sus eventos no se
// repiten aquí.

export const romanRepublicTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "la-republica-romana",
  title: "La República romana",
  era: "ROMAN",
  category: "PERIODS",
  summary:
    "Casi cinco siglos en que Roma se gobernó con cónsules, Senado y asambleas, conquistó el Mediterráneo y acabó hundida en guerras civiles.",
  period: { start: { year: -509 }, end: { year: -27, month: 1 } },
  introduction: [
    "Tras la expulsión del último rey en el 509 a.C., los romanos repartieron el poder entre magistrados elegidos por un año, con dos cónsules a la cabeza, un Senado formado por antiguos magistrados y asambleas en las que votaban los ciudadanos. La expresión res publica, «la cosa pública», recogía la idea de que el Estado pertenecía a la comunidad de ciudadanos y no a un rey.",
    "En los primeros siglos, la lucha entre patricios y plebeyos fue ampliando los derechos de la plebe, mientras Roma se imponía en Italia frente a latinos, etruscos, samnitas y griegos. Después, las tres guerras púnicas contra Cartago (264–146 a.C.) y las campañas en Oriente la convirtieron en la dueña del Mediterráneo, con provincias en Hispania, África, Grecia y Asia.",
    "Las conquistas trajeron riqueza, pero también desigualdad y ejércitos más fieles a sus generales que al Estado. Desde los Gracos (133 a.C.), la República vivió un siglo de crisis y guerras civiles: Mario y Sila, Pompeyo y César, y por último Octavio y Marco Antonio. Tras la victoria de Octavio en Accio, el Senado le concedió en el 27 a.C. el título de Augusto, y la República dio paso al Imperio, aunque conservando sus formas.",
  ],
  keyFacts: [
    { label: "Duración", value: "Del 509 al 27 a.C." },
    { label: "Gobierno", value: "Dos cónsules elegidos cada año, el Senado y las asambleas de ciudadanos" },
    { label: "Lema", value: "SPQR: Senatus Populusque Romanus, «el Senado y el pueblo romano»" },
    { label: "Expansión", value: "De una ciudad del Lacio a todo el Mediterráneo" },
    { label: "Grandes rivales", value: "Cartago, los reinos helenísticos y los galos" },
    { label: "Final", value: "Un siglo de guerras civiles y el principado de Augusto" },
  ],
  image: catalogImage("roma-foro"),
  relatedTopicIds: ["topic-gallic-sack-of-rome", "topic-julius-caesar", "topic-roman-empire", "topic-roman-republic-birth"],
  status: "PUBLISHED",
});

export const romanRepublicEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-roman-republic-licinian-laws",
    topicId: TOPIC_ID,
    title: "Leyes Licinias-Sextias",
    date: { year: -367 },
    era: "ROMAN",
    description: "Los plebeyos consiguen el acceso al consulado, el paso decisivo en la lucha con los patricios.",
  },
  {
    id: "event-roman-republic-tarentum",
    topicId: TOPIC_ID,
    title: "Rendición de Tarento",
    date: { year: -272 },
    era: "ROMAN",
    description: "Con la última gran ciudad griega del sur, Roma domina toda la península itálica.",
  },
  {
    id: "event-roman-republic-first-punic-war-end",
    topicId: TOPIC_ID,
    title: "Fin de la primera guerra púnica",
    date: { year: -241 },
    era: "ROMAN",
    description: "Roma vence a Cartago en el mar y Sicilia se convierte en su primera provincia.",
  },
  {
    id: "event-roman-republic-zama",
    topicId: TOPIC_ID,
    title: "Batalla de Zama",
    date: { year: -202 },
    era: "ROMAN",
    description: "Escipión el Africano derrota a Aníbal y pone fin a la segunda guerra púnica.",
  },
  {
    id: "event-roman-republic-carthage",
    topicId: TOPIC_ID,
    title: "Destrucción de Cartago",
    date: { year: -146 },
    era: "ROMAN",
    description: "Al final de la tercera guerra púnica, Roma arrasa Cartago; el mismo año destruye Corinto.",
  },
  {
    id: "event-roman-republic-gracchi",
    topicId: TOPIC_ID,
    title: "El tribunado de Tiberio Graco",
    date: { year: -133 },
    era: "ROMAN",
    description: "Su reforma agraria enfrenta a la plebe con el Senado y acaba con su asesinato.",
  },
  {
    id: "event-roman-republic-sulla-march",
    topicId: TOPIC_ID,
    title: "Sila marcha sobre Roma",
    date: { year: -88 },
    era: "ROMAN",
    description: "Por primera vez un general romano entra en la ciudad al frente de sus legiones.",
  },
  {
    id: "event-roman-republic-actium",
    topicId: TOPIC_ID,
    title: "Batalla de Accio",
    date: { year: -31, month: 9 },
    era: "ROMAN",
    description: "Octavio vence a Marco Antonio y Cleopatra: la última guerra civil de la República.",
  },
]);

export const romanRepublicQuiz = QuizSchema.parse({
  id: "quiz-roman-republic",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-roman-republic-consuls",
      question: "¿Quiénes estaban al frente de la República romana cada año?",
      options: ["Un rey", "Dos cónsules", "Tres triunviros", "Un emperador"],
      correctOptionIndex: 1,
      explanation: "Se elegían cada año, y cada uno podía vetar las decisiones del otro.",
    },
    {
      id: "question-roman-republic-spqr",
      question: "¿Qué significan las siglas SPQR?",
      options: [
        "Salud para quien reina",
        "Solo para los que ruegan",
        "El Senado y el pueblo romano",
        "Sociedad de patricios y quirites romanos",
      ],
      correctOptionIndex: 2,
    },
    {
      id: "question-roman-republic-punic-wars",
      question: "¿Contra qué ciudad libró Roma las guerras púnicas?",
      options: ["Atenas", "Corinto", "Alejandría", "Cartago"],
      correctOptionIndex: 3,
    },
    {
      id: "question-roman-republic-gracchi",
      question: "¿Con qué hermanos tribunos empezó el siglo de crisis de la República?",
      options: ["Los Gracos", "Los Escipiones", "Los Horacios", "Los Tarquinios"],
      correctOptionIndex: 0,
    },
    {
      id: "question-roman-republic-end",
      question: "¿Qué título recibió Octavio en el 27 a.C., con el que termina la República?",
      options: ["Dictador perpetuo", "Augusto", "Rey de Roma", "Cónsul vitalicio"],
      correctOptionIndex: 1,
    },
  ],
});

export const romanRepublicRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-roman-republic-holland",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "Rubicón. Auge y caída de la República romana",
    creator: "Tom Holland",
    year: 2003,
    description: "Una historia narrada como una novela del último siglo de la República, de los Gracos a Augusto.",
  },
  {
    id: "rec-roman-republic-goldsworthy",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "La caída de Cartago",
    creator: "Adrian Goldsworthy",
    year: 2000,
    description: "Las tres guerras púnicas, contadas por un especialista en historia militar romana.",
  },
  {
    id: "rec-roman-republic-rome-series",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "Roma",
    creator: "HBO / BBC",
    year: 2005,
    description: "Serie de ficción sobre los últimos años de la República, de la conquista de la Galia a Augusto.",
  },
]);
