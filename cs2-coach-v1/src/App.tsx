import { useMemo, useState } from 'react';
import { roundType } from './engine/economy';
import { createMatch, simulateRound } from './engine/sim';
import type { EconomyOption, MatchState, TacticOption } from './engine/types';

const teams = ['Spirit', 'FaZe', 'NAVI', 'G2', 'Vitality'] as const;
const maps: Array<{ key: MatchState['map']; label: string }> = [
  { key: 'dust2', label: 'Dust II' },
  { key: 'nuke', label: 'Nuke' },
  { key: 'ancient', label: 'Ancient' },
  { key: 'mirage', label: 'Mirage' },
  { key: 'inferno', label: 'Inferno' },
];

export function App() {
  const [started, setStarted] = useState(false);
  const [setup, setSetup] = useState<{ team: (typeof teams)[number]; map: MatchState['map'] }>({
    team: 'Spirit',
    map: 'dust2',
  });

  const [match, setMatch] = useState(() => createMatch());
  const [economy, setEconomy] = useState<EconomyOption>('eco');
  const [tactic, setTactic] = useState<TacticOption>('default');
  const [panelOpen, setPanelOpen] = useState(false);

  const canDecide = match.phase === 'decision';
  const canSim = match.phase === 'live_round';
  const canNext = match.phase === 'post_round';
  const ended = match.phase === 'match_end';

  const tacticLabels: Record<TacticOption, string> = useMemo(
    () => ({
      default: '默认控图',
      mid: '中路强控',
      explode_a: 'A点爆开',
      slow_b: 'B点慢摸',
      fake: '假打转点',
    }),
    []
  );

  const start = () => {
    const pool = teams.filter((t) => t !== setup.team);
    const opp = pool[Math.floor(Math.random() * pool.length)] ?? 'FaZe';
    setMatch(createMatch({ map: setup.map, teamAName: setup.team, teamBName: opp }));
    setStarted(true);
  };

  const confirmDecision = () => setMatch((s) => ({ ...s, phase: 'live_round' }));
  const playRound = () => setMatch((s) => simulateRound(s, { economy, tactic }));
  const nextRound = () => setMatch((s) => ({ ...s, phase: 'decision', killfeed: [] }));

  if (!started) {
    return (
      <main className="mx-auto min-h-screen max-w-md space-y-3 bg-[#0d1117] p-3 text-sm text-[#f0f6fc]">
        <header className="panel p-2 text-[#8b949e]">开局设置</header>
        <section className="panel space-y-2 p-3">
          <div className="text-xs text-[#8b949e]">队伍</div>
          <select
            className="panel w-full p-2"
            value={setup.team}
            onChange={(e) => setSetup((s) => ({ ...s, team: e.target.value as any }))}
          >
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="text-xs text-[#8b949e]">地图</div>
          <select
            className="panel w-full p-2"
            value={setup.map}
            onChange={(e) => setSetup((s) => ({ ...s, map: e.target.value as any }))}
          >
            {maps.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>

          <button className="panel w-full p-2" onClick={start}>
            开始
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md space-y-3 bg-[#0d1117] p-3 text-sm text-[#f0f6fc]">
      <header className="panel p-2 text-[#8b949e]">Major Timeout · {match.map}</header>

      <section className="panel p-3 text-center">
        <div className="mono text-5xl font-bold">
          {match.teamA.score} : {match.teamB.score}
        </div>
        <div>
          {match.teamA.name} [ {match.teamA.side} ] vs {match.teamB.name} [ {match.teamB.side} ]
        </div>
        {ended && <div className="mt-1 font-bold text-[#d29922]">比赛结束</div>}
      </section>

      <section className="panel p-2 text-[#8b949e]">第 {match.roundNumber} 回合</section>

      <section className="panel relative min-h-80 p-3">
        <button className="panel px-2 py-1" onClick={() => setPanelOpen((v) => !v)}>
          {panelOpen ? '▾' : '▸'} 队员
        </button>

        {panelOpen && (
          <div className="mt-2 space-y-1">
            {match.teamA.players.map((p) => (
              <div key={p.name} className="panel p-1 text-xs">
                {p.name} K{p.kills}/D{p.deaths}/A{p.assists} HP {p.hp}
              </div>
            ))}
          </div>
        )}

        <div className="panel absolute right-2 top-2 z-20 w-[120px] p-2 text-xs">
          {match.killfeed.length === 0 ? (
            <div className="text-[#8b949e]">击杀</div>
          ) : (
            match.killfeed.map((k, i) => (
              <div key={i}>
                {k.killer} {'->'} {k.victim}
              </div>
            ))
          )}
        </div>

        <div className="mt-3 space-y-2 pr-[130px]">
          {match.commentary.map((c, i) => (
            <div key={i} className={c.highlight ? 'text-[#d29922]' : ''}>
              {c.caster === 'wanjiqi' ? '玩机器' : '马西西'}: {c.text}
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-2 text-xs">
        <div>
          {match.teamA.name} ${match.teamA.money} [{roundType(match.teamA.money)}]
        </div>
        <div>
          {match.teamB.name} ${match.teamB.money} [{roundType(match.teamB.money)}]
        </div>
      </section>

      {canDecide && !ended && (
        <section className="panel space-y-2 p-2">
          <div>你的决策</div>
          <div className="grid grid-cols-2 gap-2">
            {(['eco', 'semi', 'force', 'full'] as EconomyOption[]).map((op) => (
              <button
                key={op}
                className={`panel p-2 ${economy === op ? 'border-[#58a6ff]' : ''}`}
                onClick={() => setEconomy(op)}
              >
                {op.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['default', 'mid', 'explode_a', 'slow_b', 'fake'] as TacticOption[]).map((k) => (
              <button
                key={k}
                className={`panel p-2 ${tactic === k ? 'border-[#7b2d8e]' : ''}`}
                onClick={() => setTactic(k)}
              >
                {tacticLabels[k]}
              </button>
            ))}
          </div>
          <button className="panel w-full p-2" onClick={confirmDecision}>
            确认决策
          </button>
        </section>
      )}

      {canSim && !ended && (
        <button className="panel w-full p-2" onClick={playRound}>
          模拟回合
        </button>
      )}
      {canNext && !ended && (
        <button className="panel w-full p-2" onClick={nextRound}>
          下一回合决策
        </button>
      )}
    </main>
  );
}

