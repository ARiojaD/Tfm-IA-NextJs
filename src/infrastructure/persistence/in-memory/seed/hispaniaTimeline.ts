import { TimelineMilestoneSchema } from "@/domain/entities/TimelineMilestone";

// La cronología de Hispania, de las colonias fenicias y griegas al fin de la Hispania romana. Los hitos sin
// `topicId` todavía no tienen tema. Las fundaciones más antiguas llevan la fecha que da la tradición.

const era = "HISPANIA";

export const hispaniaTimeline = TimelineMilestoneSchema.array().parse([
  {
    id: "milestone-hispania-gadir",
    era,
    date: { year: -1100 },
    title: "Fundación de Gadir",
    description: "Según la tradición, los fenicios fundan Gadir, la actual Cádiz. La arqueología sitúa sus primeros restos hacia el siglo IX a.C.",
  },
  {
    id: "milestone-hispania-emporion",
    era,
    date: { year: -575 },
    title: "Fundación de Emporion",
    description: "Hacia el 575 a.C., griegos de Focea fundan Emporion (Ampurias), un puerto comercial en la costa catalana.",
  },
  {
    id: "milestone-hispania-barcids",
    era,
    date: { year: -237 },
    title: "Los Barca llegan a Hispania",
    description: "El cartaginés Amílcar Barca desembarca en Gadir y empieza la conquista del sur y el este de la Península.",
  },
  {
    id: "milestone-hispania-qart-hadasht",
    era,
    date: { year: -227 },
    title: "Fundación de Qart Hadasht",
    description: "Asdrúbal funda Qart Hadasht, la actual Cartagena, capital de los cartagineses en Hispania.",
  },
  {
    id: "milestone-hispania-saguntum",
    era,
    date: { year: -219 },
    title: "Asedio de Sagunto",
    description: "Aníbal toma Sagunto, aliada de Roma, tras ocho meses de asedio, y provoca la segunda guerra púnica.",
  },
  {
    id: "milestone-hispania-roman-landing",
    era,
    date: { year: -218 },
    title: "Los romanos desembarcan en Ampurias",
    description: "Cneo Escipión llega a Emporion con un ejército: empieza la presencia de Roma en Hispania.",
  },
  {
    id: "milestone-hispania-italica",
    era,
    date: { year: -206 },
    title: "Fundación de Itálica",
    description: "Escipión asienta a sus soldados heridos en Itálica, la primera ciudad romana de Hispania y cuna de Trajano y Adriano.",
  },
  {
    id: "milestone-hispania-provinces",
    era,
    date: { year: -197 },
    title: "Hispania Citerior y Ulterior",
    description: "Roma organiza sus territorios en dos provincias, cada una con su propio gobernador.",
  },
  {
    id: "milestone-hispania-viriathus",
    era,
    date: { year: -147 },
    title: "Viriato, caudillo de los lusitanos",
    description: "Los lusitanos eligen a Viriato, que durante ocho años derrota a los ejércitos romanos con la guerra de guerrillas.",
    topicId: "topic-viriathus",
  },
  {
    id: "milestone-hispania-viriathus-death",
    era,
    date: { year: -139 },
    title: "Asesinato de Viriato",
    description: "Tres de sus hombres, sobornados por Roma, lo matan mientras duerme.",
    topicId: "topic-viriathus",
  },
  {
    id: "milestone-hispania-numantia",
    era,
    date: { year: -133 },
    title: "Caída de Numancia",
    description: "Tras un largo cerco, Escipión Emiliano toma la ciudad celtíbera, que se convierte en símbolo de resistencia.",
    topicId: "topic-siege-of-numantia",
  },
  {
    id: "milestone-hispania-sertorius",
    era,
    date: { year: -80 },
    title: "Guerra de Sertorio",
    description: "El general romano Quinto Sertorio, enfrentado a Sila, gobierna buena parte de Hispania hasta su asesinato en el 72 a.C.",
  },
  {
    id: "milestone-hispania-cantabrian-wars",
    era,
    date: { year: -29 },
    title: "Comienzan las guerras cántabras",
    description: "Roma lucha contra cántabros y astures, con Augusto en persona en las primeras campañas. En el 19 a.C. domina toda la Península.",
  },
  {
    id: "milestone-hispania-emerita",
    era,
    date: { year: -25 },
    title: "Fundación de Emerita Augusta",
    description: "Augusto funda la actual Mérida para sus veteranos, y pronto será la capital de Lusitania.",
    topicId: "topic-emerita-augusta",
  },
  {
    id: "milestone-hispania-latin-right",
    era,
    date: { year: 74 },
    title: "Derecho latino para toda Hispania",
    description: "Hacia el 74 d.C., Vespasiano extiende el derecho latino a las ciudades hispanas y acelera su romanización.",
  },
  {
    id: "milestone-hispania-trajan",
    era,
    date: { year: 98 },
    title: "Trajano, emperador",
    description: "Trajano, natural de Itálica, es el primer emperador nacido fuera de Italia.",
  },
  {
    id: "milestone-hispania-germanic-peoples",
    era,
    date: { year: 409 },
    title: "Llegan suevos, vándalos y alanos",
    description: "Los pueblos germánicos cruzan los Pirineos: empieza el final de la Hispania romana.",
  },
]);
