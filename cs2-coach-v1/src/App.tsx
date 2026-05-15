import { useState } from 'react';
import { roundType } from './engine/economy';
import { createMatch, simulateRound } from './engine/sim';
import type { EconomyOption, TacticOption } from './engine/types';

export function App() {
  const [match, setMatch] = useState(createMatch());
  const [panelOpen, setPanelOpen] = useState(false);
  const [economy, setEconomy] = useState<EconomyOption>('eco');
  const [tactic, setTactic] = useState<TacticOption>('default');

  const confirmDecision = () => setMatch((s) => ({ ...s, phase: 'live_round' }));
  const playRound = () => setMatch((s) => simulateRound({ ...s, phase: 'live_round' }, { economy, tactic }));
  const nextRound = () => setMatch((s) => ({ ...s, phase: 'decision', killfeed: [] }));

  return (
    <main className="mx-auto min-h-screen max-w-md space-y-3 bg-[#0d1117] p-3 text-sm text-[#f0f6fc]">
      <header className="panel p-2 text-[#8b949e]">🏆 上海MAJOR 总决赛 · Dust II</header>

      <section className="panel p-3 text-center">
        <div className="mono text-5xl font-bold">{match.teamA.score} : {match.teamB.score}</div>
        <div>{match.teamA.name} [ {match.teamA.side} ] vs {match.teamB.name} [ {match.teamB.side} ]</div>
      </section>

      <section className="panel p-2 text-[#8b949e]">════ 第 {match.roundNumber} 回合 ════</section>

      <section className="panel relative min-h-80 p-3">
        <button className="panel px-2 py-1" onClick={() => setPanelOpen((v) => !v)}>◀ 队员 ▶</button>
        {panelOpen && (
          <div className="mt-2 space-y-1">
            {match.teamA.players.map((p) => (
              <div key={p.name} className="panel p-1 text-xs">{p.name} K{p.kills}/D{p.deaths}/A{p.assists} HP {p.hp}</div>
            ))}
          </div>
        )}

        <div className="panel absolute right-2 top-2 w-40 p-2 text-xs">
          {match.killfeed.length === 0 ? <div className="text-[#8b949e]">击杀信息</div> : match.killfeed.map((k, i) => <div key={i}>{k.killer} 🔫 → {k.victim}</div>)}
        </div>

        <div className="mt-3 space-y-2 pr-44">
          {match.commentary.map((c, i) => (
            <div key={i} className={c.highlight ? 'text-[#d29922]' : ''}>🎙 {c.caster === 'wanjiqi' ? '玩机器' : '马西西'}: {c.text}</div>
          ))}
        </div>
      </section>

      <section className="panel p-2 text-xs">
        <div>{match.teamA.name} ${match.teamA.money} [{roundType(match.teamA.money)}]</div>
        <div>{match.teamB.name} ${match.teamB.money} [{roundType(match.teamB.money)}]</div>
      </section>

      {match.phase === 'decision' && (
        <section className="panel space-y-2 p-2">
          <div>▼ 你的决策</div>
          <div className="grid grid-cols-2 gap-2">
            {(['eco', 'semi', 'force', 'full'] as EconomyOption[]).map((op) => (
              <button key={op} className={`panel p-2 ${economy === op ? 'border-[#58a6ff]' : ''}`} onClick={() => setEconomy(op)}>{op.toUpperCase()}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['default', '默认控图'],
              ['mid', '中路强控'],
              ['explode_a', 'A点爆弹'],
              ['slow_b', 'B点慢摸'],
            ] as [TacticOption, string][]).map(([k, label]) => (
              <button key={k} className={`panel p-2 ${tactic === k ? 'border-[#7b2d8e]' : ''}`} onClick={() => setTactic(k)}>{label}</button>
            ))}
          </div>
          <button className="panel w-full p-2" onClick={confirmDecision}>确认决策</button>
        </section>
      )}

      {match.phase === 'live_round' && <button className="panel w-full p-2" onClick={playRound}>模拟回合</button>}
      {match.phase === 'post_round' && <button className="panel w-full p-2" onClick={nextRound}>下一回合决策</button>}
    </main>
  );
}
