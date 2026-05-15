export type Side = 'T' | 'CT';
export type MatchPhase = 'post_round' | 'decision' | 'live_round' | 'halftime' | 'match_end';
export type EconomyOption = 'eco' | 'semi' | 'force' | 'full';
export type TacticOption = 'default' | 'mid' | 'explode_a' | 'slow_b' | 'fake';

export interface Player {
  name: string;
  alive: boolean;
  hp: number;
  weapon: string;
  kills: number;
  deaths: number;
  assists: number;
  aim: number;
  form: number;
  composure: number;
  tactics: number;
  clutch: number;
  avatarUrl: string;
}

export interface TeamState {
  name: string;
  side: Side;
  score: number;
  money: number;
  lossStreak: number;
  timeoutsRemaining: number;
  players: Player[];
}

export interface CommentaryLine {
  caster: 'wanjiqi' | 'maxixi';
  text: string;
  highlight?: boolean;
}

export interface KillEvent {
  killer: string;
  victim: string;
  weapon: 'rifle' | 'smg' | 'awp' | 'shotgun';
  headshot?: boolean;
  position: string;
}

export interface UserDecision {
  economy: EconomyOption;
  tactic: TacticOption;
}

export interface MatchState {
  map: 'dust2';
  roundNumber: number;
  phase: MatchPhase;
  teamA: TeamState;
  teamB: TeamState;
  killfeed: KillEvent[];
  commentary: CommentaryLine[];
  lastDecision: UserDecision;
}

