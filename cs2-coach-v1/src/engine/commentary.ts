import type { CommentaryLine, KillEvent, UserDecision } from './types';

const killTpl = [
  '{killer} 在 {position} 接住了 {victim}，{weapon} 直接打掉。',
  '{killer} 这枪预瞄到位，{victim} 没有反应时间。',
  '{killer} 在 {position} 一枪打头，{victim} 直接倒下。',
];

const macroTpl = {
  default: '按理说这回合默认控图没问题，先拿信息再做二次决策。',
  mid: '中路控制抢下来以后，CT 的回防路线会被切掉。',
  explode_a: 'A 点这套道具齐了，进点窗口会非常短。',
  slow_b: 'B 点慢摸的关键是纪律性，不能先暴露脚步。',
  fake: '假打转点要看时间，40 秒以后再转点成功率更高。',
};

const decisionTpl = {
  eco: '这局是 ECO，目标就是保经济，下局长枪再打。',
  semi: '这局半起，风险可控，输赢都还能接住经济。',
  force: '这局强起是赌博，赢了能翻盘，输了会连崩两局。',
  full: '这局全起，枪械配置完整，重点看默认质量。',
};

export function castRound(kills: KillEvent[], decision: UserDecision): CommentaryLine[] {
  const lines: CommentaryLine[] = [{ caster: 'maxixi', text: decisionTpl[decision.economy] }];

  for (const e of kills) {
    const weapon = e.weapon === 'awp' ? 'AWP' : e.weapon === 'smg' ? '冲锋枪' : e.weapon === 'shotgun' ? '霰弹枪' : '步枪';
    const base = killTpl[Math.floor(Math.random() * killTpl.length)]
      .replace('{killer}', e.killer)
      .replace('{victim}', e.victim)
      .replace('{position}', e.position)
      .replace('{weapon}', weapon);
    lines.push({ caster: 'wanjiqi', text: base, highlight: e.headshot });
  }

  lines.push({ caster: 'maxixi', text: macroTpl[decision.tactic] });
  return lines;
}
