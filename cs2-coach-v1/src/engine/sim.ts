import players from '../data/players.json';
import { applyBuy, resolveRoundMoney } from './economy';
import { castRound } from './commentary';
import type { EconomyOption, KillEvent, MatchState, Player, TeamState, UserDecision } from './types';

const silhouette = 'https://www.hltv.org/img/static/player/player_silhouette.png';
const toAvatar = (h: string) =>
  h ? `https://img-cdn.hltv.org/playerbodyshot/${h}.png?ixlib=java-2.1.0&w=400` : silhouette;
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

function teamCombatScore(team: TeamState) {
  const avgAim = team.players.reduce((sum, p) => sum + p.aim, 0) / team.players.length;
  const avgForm = team.players.reduce((sum, p) => sum + p.form, 0) / team.players.length;
  return avgAim * 0.6 + avgForm * 0.4;
}

function buyPower(mode: EconomyOption) {
  switch (mode) {
    case 'eco':
      return 0.55;
    case 'semi':
      return 0.78;
    case 'force':
      return 0.9;
    case 'full':
      return 1.0;
    default:
      return 1.0;
  }
}

function tacticShift(decision: UserDecision) {
  const base = { default: 0, mid: 0.04, explode_a: 0.08, slow_b: 0.03, fake: 0.06 }[decision.tactic];
  const readChance = { default: 0.12, mid: 0.2, explode_a: 0.32, slow_b: 0.18, fake: 0.3 }[
    decision.tactic
  ];
  if (Math.random() < readChance) return -0.12;
  return base;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function createMatch(opts?: {
  map?: MatchState['map'];
  teamAName?: string;
  teamBName?: string;
}): MatchState {
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
    map: opts?.map ?? 'dust2',
    roundNumber: 1,
    phase: 'decision',
    teamA: mkTeam(opts?.teamAName ?? 'Spirit', 'T', 0),
    teamB: mkTeam(opts?.teamBName ?? 'FaZe', 'CT', 5),
    killfeed: [],
    commentary: [],
    lastDecision: { economy: 'eco', tactic: 'default' },
  };
}

export function simulateRound(s: MatchState, decision: UserDecision) {
  if (s.teamA.score >= 13 || s.teamB.score >= 13) {
    s.phase = 'match_end';
    return s;
  }
  const enemyEconomy: EconomyOption = 'full';
  applyBuy(s.teamA, decision.economy);
  applyBuy(s.teamB, enemyEconomy);
  const aCombat = teamCombatScore(s.teamA);
  const bCombat = teamCombatScore(s.teamB);
  const combatEdge = (aCombat - bCombat) / 100;
  const aBuy = buyPower(decision.economy);
  const bBuy = buyPower(enemyEconomy);
  const economyEdge = (aBuy - bBuy) * 0.7;
  const tacticEdge = tacticShift(decision);
  const rawAWin = 0.5 + combatEdge * 0.35 + economyEdge + tacticEdge;
  const aWinChance = clamp(rawAWin, 0.1, 0.9);
  const winner = Math.random() < aWinChance ? s.teamA : s.teamB;
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
    killfeed.map((k) => ({ team: 'winner' as const, weapon: k.weapon }))
  );
  winner.score += 1;
  s.roundNumber += 1;
  s.phase = s.teamA.score >= 13 || s.teamB.score >= 13 ? 'match_end' : 'post_round';
  s.killfeed = killfeed;
  s.commentary = castRound(killfeed, decision);
  s.lastDecision = decision;
  return s;
}
