import type { Comment } from "@/domain/entities/Comment";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Quiz } from "@/domain/entities/Quiz";
import type { Recommendation } from "@/domain/entities/Recommendation";
import type { TimelineMilestone } from "@/domain/entities/TimelineMilestone";
import {
  juliusCaesarComments,
  juliusCaesarEvents,
  juliusCaesarQuiz,
  juliusCaesarRecommendations,
  juliusCaesarTopic,
} from "./juliusCaesar";
import {
  siegeOfAlesiaComments,
  siegeOfAlesiaEvents,
  siegeOfAlesiaQuiz,
  siegeOfAlesiaRecommendations,
  siegeOfAlesiaTopic,
} from "./siegeOfAlesia";
import { romulusEvents, romulusQuiz, romulusRecommendations, romulusTopic } from "./romulus";
import { romanKingdomEvents, romanKingdomQuiz, romanKingdomRecommendations, romanKingdomTopic } from "./romanKingdom";
import { romanRepublicBirthEvents, romanRepublicBirthQuiz, romanRepublicBirthRecommendations, romanRepublicBirthTopic } from "./romanRepublicBirth";
import { gallicSackOfRomeEvents, gallicSackOfRomeQuiz, gallicSackOfRomeRecommendations, gallicSackOfRomeTopic } from "./gallicSackOfRome";
import { periclesEvents, periclesQuiz, periclesRecommendations, periclesTopic } from "./pericles";
import { alexanderTheGreatEvents, alexanderTheGreatQuiz, alexanderTheGreatRecommendations, alexanderTheGreatTopic } from "./alexanderTheGreat";
import { thermopylaeEvents, thermopylaeQuiz, thermopylaeRecommendations, thermopylaeTopic } from "./thermopylae";
import { classicalAthensEvents, classicalAthensQuiz, classicalAthensRecommendations, classicalAthensTopic } from "./classicalAthens";
import { viriathusEvents, viriathusQuiz, viriathusRecommendations, viriathusTopic } from "./viriathus";
import { siegeOfNumantiaEvents, siegeOfNumantiaQuiz, siegeOfNumantiaRecommendations, siegeOfNumantiaTopic } from "./siegeOfNumantia";
import { romanRepublicEvents, romanRepublicQuiz, romanRepublicRecommendations, romanRepublicTopic } from "./romanRepublic";
import { romanEmpireEvents, romanEmpireQuiz, romanEmpireRecommendations, romanEmpireTopic } from "./romanEmpire";
import { greekTimeline } from "./greekTimeline";
import { hispaniaTimeline } from "./hispaniaTimeline";
import { romanTimeline } from "./romanTimeline";
import { emeritaAugustaEvents, emeritaAugustaQuiz, emeritaAugustaRecommendations, emeritaAugustaTopic } from "./emeritaAugusta";

export interface Seed {
  topics: HistoricalTopic[];
  events: HistoricalEvent[];
  quizzes: Quiz[];
  comments: Comment[];
  recommendations: Recommendation[];
  // Los hitos de la cronología completa de cada civilización.
  milestones: TimelineMilestone[];
}

// Los datos iniciales de la enciclopedia: los usan los repositorios en memoria y `npm run db:seed` para
// cargar PostgreSQL. Un tema nuevo se añade creando su archivo junto a juliusCaesar.ts y listándolo aquí.
// Solo los dos primeros traen comentarios de ejemplo: los demás empiezan, como un tema real, sin
// conversación.
export const SEED: Seed = {
  topics: [juliusCaesarTopic, siegeOfAlesiaTopic, romulusTopic, romanKingdomTopic, romanRepublicBirthTopic, gallicSackOfRomeTopic, romanRepublicTopic, romanEmpireTopic, periclesTopic, alexanderTheGreatTopic, thermopylaeTopic, classicalAthensTopic, viriathusTopic, siegeOfNumantiaTopic, emeritaAugustaTopic],
  events: [...juliusCaesarEvents, ...siegeOfAlesiaEvents, ...romulusEvents, ...romanKingdomEvents, ...romanRepublicBirthEvents, ...gallicSackOfRomeEvents, ...romanRepublicEvents, ...romanEmpireEvents, ...periclesEvents, ...alexanderTheGreatEvents, ...thermopylaeEvents, ...classicalAthensEvents, ...viriathusEvents, ...siegeOfNumantiaEvents, ...emeritaAugustaEvents],
  quizzes: [juliusCaesarQuiz, siegeOfAlesiaQuiz, romulusQuiz, romanKingdomQuiz, romanRepublicBirthQuiz, gallicSackOfRomeQuiz, romanRepublicQuiz, romanEmpireQuiz, periclesQuiz, alexanderTheGreatQuiz, thermopylaeQuiz, classicalAthensQuiz, viriathusQuiz, siegeOfNumantiaQuiz, emeritaAugustaQuiz],
  comments: [...juliusCaesarComments, ...siegeOfAlesiaComments],
  recommendations: [
    ...juliusCaesarRecommendations,
    ...siegeOfAlesiaRecommendations,
    ...romulusRecommendations,
    ...romanKingdomRecommendations,
    ...romanRepublicBirthRecommendations,
    ...gallicSackOfRomeRecommendations,
    ...romanRepublicRecommendations,
    ...romanEmpireRecommendations,
    ...periclesRecommendations,
    ...alexanderTheGreatRecommendations,
    ...thermopylaeRecommendations,
    ...classicalAthensRecommendations,
    ...viriathusRecommendations,
    ...siegeOfNumantiaRecommendations,
    ...emeritaAugustaRecommendations,
  ],
  milestones: [...romanTimeline, ...greekTimeline, ...hispaniaTimeline],
};
