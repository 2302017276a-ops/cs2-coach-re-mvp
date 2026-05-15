import { useState } from 'react';
import { createMatch, simulateRound } from './engine/sim';
import { roundType } from './engine/economy';

export function App() {
  const [match, setMatch] = useState(createMatch());
  const [open, setOpen] = useState(false);
  const decide = () => setMatch((s) => ({ ...s, phase: 'live_round' }));
  const play = () => setMatch((s) => simulateRound({ ...s, phase: 'live_round' }));
  const next = () => setMatch((s) => ({ ...s, phase: 'decision', killfeed: [] }));

  return <main className="mx-auto max-w-md p-3 space-y-3 text-sm">
    <header className="panel p-2 text-[#8b949e]">🏆 上海MAJOR 总决赛 | Dust II</header>
    <section className="panel p-3 text-center"><div className="text-3xl mono">{match.teamA.score} : {match.teamB.score}</div><div>{match.teamA.name} [ {match.teamA.side} ] vs {match.teamB.name} [ {match.teamB.side} ]</div></section>
    <div className="relative panel p-3 min-h-72">
      <button onClick={()=>setOpen(!open)} className="panel px-2 py-1">◀ 队员 ▶</button>
      {open && <div className="space-y-1 mt-2">{match.teamA.players.map(p=><div key={p.name} className="panel p-1 text-xs">{p.name} K{p.kills}/D{p.deaths} HP {p.hp}</div>)}</div>}
      <div className="absolute right-2 top-2 panel p-2 w-40">{match.killfeed.map((k,i)=><div key={i}>{k.killer} 🔫 → {k.victim}</div>)}</div>
      <div className="mt-3 space-y-2">{match.commentary.map((c,i)=><div key={i}>🎙 {c.caster==='wanjiqi'?'玩机器':'马西西'}: {c.text}</div>)}</div>
    </div>
    <section className="panel p-2">
      <div>{match.teamA.name} ${match.teamA.money} [{roundType(match.teamA.money)}]</div>
      <div>{match.teamB.name} ${match.teamB.money} [{roundType(match.teamB.money)}]</div>
    </section>
    {match.phase==='decision' && <section className="panel p-2 space-y-2"><div>▼ 你的决策</div><div className="grid grid-cols-2 gap-2"><button className="panel p-2">ECO</button><button className="panel p-2">半起</button><button className="panel p-2">强起</button><button className="panel p-2">全起</button></div><button className="panel p-2 w-full" onClick={decide}>确认决策</button></section>}
    {match.phase==='live_round' && <button className="panel p-2 w-full" onClick={play}>模拟回合</button>}
    {match.phase==='post_round' && <button className="panel p-2 w-full" onClick={next}>下一回合决策</button>}
  </main>;
}
