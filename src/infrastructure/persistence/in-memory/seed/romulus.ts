import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { catalogImage } from "./catalogImage";

const TOPIC_ID = "topic-romulus";

// La fundación de Roma es una leyenda: sus fechas son las que daban los propios romanos.

export const romulusTopic = HistoricalTopicSchema.parse({
  id: TOPIC_ID,
  slug: "romulo-y-la-fundacion-de-roma",
  title: "Rómulo y la fundación de Roma",
  era: "ROMAN",
  category: "PEOPLE",
  summary:
    "La leyenda del primer rey de Roma: los gemelos salvados por una loba, el surco sagrado del Palatino y la ciudad que los romanos fechaban en el 753 a.C.",
  period: { start: { year: -771 }, end: { year: -716 } },
  introduction: [
    "Según la tradición, Rómulo y su gemelo Remo eran hijos de Rea Silvia, una vestal descendiente del troyano Eneas, y del dios Marte. Su tío abuelo Amulio, que había usurpado el trono de Alba Longa, ordenó arrojarlos al Tíber, pero la cesta encalló al pie del Palatino, donde una loba los amamantó hasta que los encontró el pastor Fáustulo.",
    "Ya adultos, devolvieron el trono a su abuelo Numítor y decidieron fundar una ciudad donde habían sido salvados. Para decidir quién le daría nombre consultaron el vuelo de las aves: Remo vio seis buitres y Rómulo, doce. Según la versión más conocida, Rómulo trazó con un arado el surco sagrado de la ciudad en el Palatino y mató a Remo cuando este lo saltó para burlarse. Los romanos fechaban aquella fundación el 21 de abril del 753 a.C.",
    "Como primer rey, Rómulo pobló la ciudad acogiendo a fugitivos, raptó a las mujeres sabinas para dar esposas a sus hombres y acabó compartiendo el trono con el rey sabino Tito Tacio. Creó el primer Senado con cien padres de familia. En el 716 a.C. desapareció durante una tormenta y fue venerado como el dios Quirino. La arqueología no confirma la existencia de Rómulo, pero sí aldeas de cabañas en el Palatino desde el siglo X a.C. y restos de una muralla del siglo VIII a.C., cerca de la fecha tradicional.",
  ],
  keyFacts: [
    { label: "Nacimiento", value: "Hacia el 771 a.C., según la tradición" },
    { label: "Fundación", value: "21 de abril del 753 a.C., según la fecha tradicional" },
    { label: "Lugar", value: "El monte Palatino, junto al Tíber" },
    { label: "Padres", value: "Rea Silvia y el dios Marte, según la leyenda" },
    { label: "Hermano", value: "Remo, su gemelo" },
    { label: "Reinado", value: "753–716 a.C., según la tradición" },
    { label: "Fuentes", value: "Tito Livio, Dionisio de Halicarnaso y Plutarco" },
  ],
  image: catalogImage("romulo-loba-capitolina"),
  relatedTopicIds: ["topic-roman-kingdom"],
  status: "PUBLISHED",
});

export const romulusEvents = HistoricalEventSchema.array().parse([
  {
    id: "event-romulus-palatine-huts",
    topicId: TOPIC_ID,
    title: "Primeras cabañas en el Palatino",
    date: { year: -1000 },
    era: "ROMAN",
    description:
      "Las excavaciones han encontrado restos de aldeas de cabañas en el Palatino desde el siglo X a.C.: la Roma real empezó mucho antes que la de la leyenda.",
  },
  {
    id: "event-romulus-founding",
    topicId: TOPIC_ID,
    title: "Fundación de Roma",
    date: { year: -753, month: 4 },
    era: "ROMAN",
    description:
      "Según la tradición, Rómulo traza con un arado el surco sagrado de la ciudad en el Palatino el 21 de abril, fecha que los romanos celebraban cada año.",
  },
  {
    id: "event-romulus-remus-death",
    topicId: TOPIC_ID,
    title: "Muerte de Remo",
    date: { year: -753 },
    era: "ROMAN",
    description: "Remo salta el surco sagrado para burlarse de su hermano, y Rómulo lo mata.",
  },
  {
    id: "event-romulus-sabines",
    topicId: TOPIC_ID,
    title: "Rapto de las sabinas",
    date: { year: -750 },
    era: "ROMAN",
    description:
      "Rómulo invita a los pueblos vecinos a unos juegos y sus hombres raptan a las mujeres sabinas. La guerra que siguió terminó con la unión de romanos y sabinos.",
  },
  {
    id: "event-romulus-disappearance",
    topicId: TOPIC_ID,
    title: "Desaparición de Rómulo",
    date: { year: -716 },
    era: "ROMAN",
    description:
      "Rómulo desaparece durante una tormenta mientras pasa revista a sus tropas, y los romanos lo veneran desde entonces como el dios Quirino.",
  },
]);

export const romulusQuiz = QuizSchema.parse({
  id: "quiz-romulus",
  topicId: TOPIC_ID,
  questions: [
    {
      id: "question-romulus-wolf",
      question: "Según la leyenda, ¿qué animal amamantó a Rómulo y Remo?",
      options: ["Una osa", "Una loba", "Una cabra", "Una cierva"],
      correctOptionIndex: 1,
      explanation: "La loba Capitolina, una escultura de bronce de los Museos Capitolinos, es el gran símbolo de la leyenda.",
    },
    {
      id: "question-romulus-hill",
      question: "¿En qué colina fundó Rómulo la ciudad?",
      options: ["El Capitolio", "El Aventino", "El Quirinal", "El Palatino"],
      correctOptionIndex: 3,
      explanation: "Remo prefería el Aventino. El vuelo de las aves dio la razón a Rómulo.",
    },
    {
      id: "question-romulus-date",
      question: "¿Qué fecha daban los romanos a la fundación de su ciudad?",
      options: ["21 de abril del 753 a.C.", "15 de marzo del 44 a.C.", "1 de enero del 509 a.C."],
      correctOptionIndex: 0,
      explanation: "Los romanos contaban los años «desde la fundación de la ciudad» (ab urbe condita).",
    },
    {
      id: "question-romulus-sabines",
      question: "¿A qué pueblo pertenecían las mujeres que raptaron los hombres de Rómulo?",
      options: ["A los etruscos", "A los galos", "A los sabinos", "A los latinos de Alba Longa"],
      correctOptionIndex: 2,
    },
    {
      id: "question-romulus-quirinus",
      question: "¿Como qué dios fue venerado Rómulo tras su desaparición?",
      options: ["Quirino", "Marte", "Jano", "Júpiter"],
      correctOptionIndex: 0,
      explanation: "El monte Quirinal de Roma lleva su nombre.",
    },
  ],
});

export const romulusRecommendations = RecommendationSchema.array().parse([
  {
    id: "rec-romulus-primo-re",
    topicId: TOPIC_ID,
    type: "FILM",
    title: "El primer rey",
    creator: "Matteo Rovere",
    year: 2019,
    description: "La historia de Rómulo y Remo contada con crudeza y rodada en latín arcaico.",
  },
  {
    id: "rec-romulus-series",
    topicId: TOPIC_ID,
    type: "SERIES",
    title: "Romulus",
    creator: "Matteo Rovere / Sky Italia",
    year: 2020,
    description: "Serie que reimagina los orígenes de Roma entre los pueblos del Lacio del siglo VIII a.C.",
  },
  {
    id: "rec-romulus-spqr",
    topicId: TOPIC_ID,
    type: "BOOK",
    title: "SPQR. Una historia de la antigua Roma",
    creator: "Mary Beard",
    year: 2015,
    description: "Sus primeros capítulos separan con claridad lo que sabemos de los orígenes de Roma de lo que es leyenda.",
  },
]);
