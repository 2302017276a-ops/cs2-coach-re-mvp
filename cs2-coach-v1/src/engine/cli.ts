import { createMatch, simulateRound } from './sim';
import { roundType } from './economy';

const state = simulateRound(createMatch());
console.log(`Round ${state.roundNumber-1} => ${state.teamA.name} ${state.teamA.score}:${state.teamB.score} ${state.teamB.name}`);
console.log(`Money ${state.teamA.name}: $${state.teamA.money} [${roundType(state.teamA.money)}]`);
console.log(`Money ${state.teamB.name}: $${state.teamB.money} [${roundType(state.teamB.money)}]`);
for (const line of state.commentary) console.log(`${line.caster}: ${line.text}`);
