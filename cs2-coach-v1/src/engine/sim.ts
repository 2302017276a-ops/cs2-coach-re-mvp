import players from '../data/players.json';
import { applyBuy, resolveRoundMoney } from './economy';
import { castRound } from './commentary';
import type { KillEvent, MatchState, Player, TeamState, UserDecision } from './types';

const silhouette = 'https://www.hltv.org/img/static/player/player_silhouette.png';
const toAvatar = (h: string) => (h ? `https://img-cdn.hltv.org/playerbodyshot/${h}.png?ixlib=java-2.1.0&w=400` : silhouette);
const positions = ['A大', 'A小', '中路', 'B洞', 'B门'];

const mk = (name: string, hash: string): Player => ({
  name,
  alive: true,
  hp: 100,
  weapon: 'AK-47',
  kills: 0,
  deaths: 0,
  assists: 0,
  aim: 70,
  form: 65,
  composure: 68,
  tactics: 66,
  clutch: 67,
  avatarUrl: toAvatar(hash),
});

export function createMatch(): MatchState {
  const p = players as { name: string; photoHash: string }[];
  const mkTeam = (name: string, side: 'T' | 'CT', slice: number): TeamState => ({
    name,
    side,
    score: 0,
    money: 800,
    lossStreak: 0,
    timeoutsRemaining: 2,
    players: p.slice(slice, slice + 5).map((x) => mk(x.name, x.photoHash)),
  });

  return {
    map: 'dust2',
    roundNumber: 1,
    phase: 'decision',
    teamA: mkTeam('Spirit', 'T', 0),
    teamB: mkTeam('FaZe', 'CT', 5),
    killfeed: [],
    commentary: [],
    lastDecision: { economy: 'eco', tactic: 'default' },
  };
}

export function simulateRound(s: MatchState, decision: UserDecision) {
  applyBuy(s.teamA, decision.economy);
  applyBuy(s.teamB, 'full');

  const winner = Math.random() < 0.5 ? s.teamA : s.teamB;
  const loser = winner === s.teamA ? s.teamB : s.teamA;

  const killfeed: KillEvent[] = Array.from({ length: 3 }, (_, idx) => ({
    killer: winner.players[idx].name,
    victim: loser.players[idx].name,
    weapon: idx === 0 ? 'rifle' : idx === 1 ? 'smg' : 'awp',
    headshot: idx === 0,
    position: positions[Math.floor(Math.random() * positions.length)],
  }));

  resolveRoundMoney(
    winner,
    loser,
    'elim',
    killfeed.map((k) => ({ team: 'winner' as const, weapon: k.weapon })),
  );

  winner.score += 1;
  s.roundNumber += 1;
  s.phase = 'post_round';
  s.killfeed = killfeed;
  s.commentary = castRound(killfeed, decision);
  s.lastDecision = decision;
  return s;
}
