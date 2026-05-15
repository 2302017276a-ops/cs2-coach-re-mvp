import players from '../data/players.json';
import type { MatchState, Player, TeamState } from './types';
import { castKill } from './commentary';
import { resolveRoundMoney } from './economy';

const silhouette='https://www.hltv.org/img/static/player/player_silhouette.png';
const toAvatar=(h:string)=>h?`https://img-cdn.hltv.org/playerbodyshot/${h}.png?ixlib=java-2.1.0&w=400`:silhouette;
const mk=(name:string,hash:string):Player=>({name,alive:true,hp:100,weapon:'AK-47',kills:0,deaths:0,assists:0,aim:70,form:65,composure:68,tactics:66,clutch:67,avatarUrl:toAvatar(hash)});

export function createMatch():MatchState{
  const p=players as {name:string;photoHash:string}[];
  const mkTeam=(name:string,side:'T'|'CT',slice:number):TeamState=>({name,side,score:0,money:800,lossStreak:0,timeoutsRemaining:2,players:p.slice(slice,slice+5).map(x=>mk(x.name,x.photoHash))});
  return {map:'dust2',roundNumber:1,phase:'decision',teamA:mkTeam('Spirit','T',0),teamB:mkTeam('FaZe','CT',5),killfeed:[],commentary:[]};
}

export function simulateRound(s:MatchState){
  const killer=s.teamA.players[0]; const victim=s.teamB.players[0];
  s.killfeed=[{killer:killer.name,victim:victim.name,weapon:'rifle',headshot:true}];
  s.commentary=castKill(s.killfeed[0]);
  resolveRoundMoney(s.teamA,s.teamB,'elim',[{team:'winner',weapon:'rifle'}]);
  s.teamA.score+=1; s.roundNumber+=1; s.phase='post_round';
  return s;
}
