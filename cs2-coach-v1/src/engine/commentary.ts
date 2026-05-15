import type { CommentaryLine, KillEvent } from './types';

const killTpl = [
  '{killer} 在 {pos} 接住了 {victim}，{weapon} 直接打掉。',
  '{killer} 这枪预瞄到位，{victim} 没有反应时间。'
];
const macroTpl = ['按理说这局经济要保，下一局能有长枪配置。','其实中路控制一丢，回防路线就会被切断。'];

export function castKill(e:KillEvent):CommentaryLine[] {
  const pos='中路'; const weapon=e.weapon==='awp'?'AWP':'步枪';
  return [{caster:'wanjiqi',text:killTpl[Math.floor(Math.random()*killTpl.length)].replace('{killer}',e.killer).replace('{victim}',e.victim).replace('{pos}',pos).replace('{weapon}',weapon)},{caster:'maxixi',text:macroTpl[Math.floor(Math.random()*macroTpl.length)]}];
}
