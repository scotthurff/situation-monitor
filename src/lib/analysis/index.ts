/**
 * Analysis engine barrel export
 */

export { detectCorrelations, detectCrossSourceCorrelations } from './correlation';
export { trackNarratives, findEmergingNarratives } from './narrative';
export {
	analyzeMainCharacters,
	getCurrentMainCharacter,
	trackEntityOverTime
} from './main-character';
