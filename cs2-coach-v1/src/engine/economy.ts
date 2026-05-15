import type { TeamState } from './types';

const lossBonus = [1400,1900,2400,2900,3400];
const killReward = { rifle: 300, smg: 600, awp: 100, shotgun: 900 };

export function roundType(money:number){ if(money<2000)return 'ECO'; if(money<3300)return '半起'; if(money<3700)return '强起'; return '全起'; }
export function resolveRoundMoney(winner:TeamState, loser:TeamState, cause:'elim'|'bomb'|'defuse', kills:{team:'winner'|'loser'; weapon:keyof typeof killReward}[], bombPlantedByLoser=false){
  winner.money += cause==='elim'?3250:3500;
  loser.lossStreak += 1;
  loser.money += lossBonus[Math.min(loser.lossStreak-1,4)];
  winner.lossStreak = 0;
  if (bombPlantedByLoser) loser.money += 1800;
  for (const k of kills) (k.team === 'winner' ? winner : loser).money += killReward[k.weapon];
  winner.money = Math.min(winner.money,16000); loser.money = Math.min(loser.money,16000);
}
