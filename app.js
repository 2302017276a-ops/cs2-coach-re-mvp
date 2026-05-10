function createStore(createState) {
  let state;
  const listeners = new Set();
  const setState = (partial) => {
    const next = typeof partial === "function" ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((fn) => fn(state));
  };
  const getState = () => state;
  state = createState(setState, getState);
  return { getState, setState, subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)) };
}

const SAVE_KEY = "cs2-coach-season-v5";
const WIN_SCORE = 13;
const SEASON_WEEKS = 5;
const START_BUDGET = 100;

const $ = (id) => document.getElementById(id);
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const clone = (v) => JSON.parse(JSON.stringify(v));

const teamStatDefs = [["资金", "money", "¥"], ["士气", "morale", ""], ["名气", "fame", ""], ["战术熟练度", "tactics", ""], ["团队默契", "chemistry", ""], ["粉丝支持", "fans", ""]];
const playerStatDefs = [["枪", "aim"], ["脑", "sense"], ["心", "mental"], ["团", "teamwork"], ["商", "market"], ["疲", "fatigue"]];

const marketPlayers = [
  { name: "donk", role: "突破", price: 35, tag: "红温巨星", voice: "不想等烟散", aim: 99, sense: 80, mental: 64, teamwork: 58, market: 98, fatigue: 22, clutch: 80, tilt: 78 },
  { name: "m0NESY", role: "狙击", price: 32, tag: "镜头制造机", voice: "一笑就要进集锦", aim: 97, sense: 87, mental: 77, teamwork: 67, market: 97, fatigue: 20, clutch: 94, tilt: 42 },
  { name: "ropz", role: "自由人", price: 27, tag: "沉默背影", voice: "绕后不解释", aim: 88, sense: 96, mental: 91, teamwork: 78, market: 78, fatigue: 16, clutch: 90, tilt: 18 },
  { name: "siuhy", role: "IGL", price: 21, tag: "年轻指挥", voice: "把沉默也当信息", aim: 76, sense: 91, mental: 84, teamwork: 90, market: 70, fatigue: 18, clutch: 74, tilt: 34 },
  { name: "flameZ", role: "辅助", price: 18, tag: "更衣室胶水", voice: "数据不会记闪光", aim: 80, sense: 79, mental: 84, teamwork: 94, market: 66, fatigue: 18, clutch: 70, tilt: 28 },
  { name: "NiKo", role: "明星步枪", price: 30, tag: "关键局谜题", voice: "所有人都等他开第一枪", aim: 94, sense: 88, mental: 70, teamwork: 70, market: 95, fatigue: 21, clutch: 83, tilt: 52 },
  { name: "ZywOo", role: "全能核心", price: 38, tag: "六边形答案", voice: "不吵，但全都能做", aim: 98, sense: 96, mental: 92, teamwork: 84, market: 99, fatigue: 18, clutch: 96, tilt: 16 },
  { name: "karrigan", role: "老派 IGL", price: 16, tag: "赌点导演", voice: "输赢都敢叫暂停", aim: 66, sense: 93, mental: 88, teamwork: 88, market: 80, fatigue: 24, clutch: 68, tilt: 26 },
  { name: "sh1ro", role: "保守狙", price: 24, tag: "Jame Time 亲戚", voice: "活着才有下一回合", aim: 90, sense: 90, mental: 87, teamwork: 76, market: 66, fatigue: 15, clutch: 88, tilt: 22 },
  { name: "Twistzz", role: "枪男", price: 20, tag: "北美发型总监", voice: "顺风很帅，逆风也帅", aim: 87, sense: 77, mental: 76, teamwork: 78, market: 82, fatigue: 20, clutch: 78, tilt: 38 },
  { name: "Jimpphat", role: "年轻核心", price: 15, tag: "冷静小孩", voice: "不说大话但敢补枪", aim: 82, sense: 84, mental: 86, teamwork: 82, market: 64, fatigue: 14, clutch: 78, tilt: 20 },
  { name: "Nova", role: "青训新人", price: 8, tag: "天才彩票", voice: "他不是来学习的", aim: 78, sense: 70, mental: 72, teamwork: 66, market: 58, fatigue: 12, clutch: 86, tilt: 44 },
];

const opponents = [
  { name: "Vitality", style: "纪律", note: "稳定、纪律、明星不讲理", power: 88, star: "ZywOo" },
  { name: "FaZe Clan", style: "残局", note: "宿命感很重，残局很硬", power: 84, star: "ropz" },
  { name: "Falcons", style: "明星", note: "预算像开了控制台", power: 86, star: "NiKo" },
  { name: "Spirit", style: "提速", note: "对面也有一个不想等烟散的人", power: 85, star: "donk" },
  { name: "二线黑马队", style: "爆冷", note: "纸面不强，但最擅长让强队丢人", power: 76, star: "Rookie" },
];

const weeklyDeck = [
  { id: "discipline", title: "📋 强调纪律", text: "默认控图、补枪、听 IGL。暂停后更容易连续前压同一片区域。", effect: { tactics: 8, chemistry: 3, morale: -2 }, style: { discipline: 8 } },
  { id: "gamble", title: "🎲 放手赌点", text: "训练非常规赌点。可能打穿对手，也可能把自己打成论坛素材。", effect: { fame: 5, tactics: -2, morale: 2 }, style: { gamble: 9 } },
  { id: "antiStar", title: "🎯 针对对面明星", text: "双架、反清、假信息，全都往对面明星脸上招呼。", effect: { tactics: 5, chemistry: -1 }, style: { antiStar: 9 } },
  { id: "speed", title: "⚡ 直接提速", text: "不让对手舒服架默认。你们会更像刀，也更像赌徒。", effect: { morale: 4, fans: 3, tactics: -3 }, style: { speed: 9 } },
  { id: "calm", title: "🧯 安抚红温选手", text: "把红温留给准星，不留给语音。关键局心态更稳。", effect: { morale: 8, chemistry: 4, fame: -1 }, style: { calm: 9 } },
  { id: "eco", title: "💸 经济纪律训练", text: "强起和保枪都不丢人，丢人的是不知道为什么买。", effect: { money: 4, tactics: 5, morale: -1 }, style: { economy: 8 } },
  { id: "info", title: "👁 信息差三架位", text: "练三架、反摸和假脚步。对手会明显没警戒默认位置。", effect: { tactics: 7, chemistry: 2 }, style: { info: 8 } },
];

const interventions = [
  { label: "叫暂停，强调纪律", style: { discipline: 8, calm: 2 }, effect: { tactics: 3, morale: 1 }, text: "暂停之后，队伍连续三回合前压 A 厅。对手明显没警戒默认的位置。" },
  { label: "直接提速", style: { speed: 9 }, effect: { morale: 2, tactics: -1 }, text: "你让队伍把默认撕掉。下一回合，五个人像一把没上保险的刀。" },
  { label: "强起，买无甲大狙", style: { gamble: 10, economy: -4 }, effect: { money: -2, fame: 3 }, text: "无甲大狙买出来那一刻，弹幕先笑了。十秒后没人笑了。" },
  { label: "非常规赌点", style: { gamble: 10, info: 3 }, effect: { tactics: -1, fans: 2 }, text: "你赌了一个没人敢赌的位置。对手搜点路线慢了半秒，半秒就是枪线。" },
  { label: "针对对面明星", style: { antiStar: 10, discipline: 2 }, effect: { tactics: 2, morale: 1 }, text: "你把两颗闪和一个人都丢给对面明星。不是尊重，是围剿。" },
  { label: "安抚红温选手", style: { calm: 10 }, effect: { morale: 4, chemistry: 3 }, text: "你没有骂 donk，只说：下一枪你来开，但报点要报。语音降温了，准星没降。" },
];

const nodes = {
  eco: ["经济局", "经济像刚被老板审过，强起和保枪都很难看。"],
  clutch: ["关键残局", "场上只剩两个人，但语音里的重量像十个人。"],
  timeout: ["暂停窗口", "镜头切到教练席，所有人都在等你有没有东西。"],
  morale: ["士气变化", "这一分不只影响比分，也影响谁还愿意相信谁。"],
  gamble: ["赌点", "地图另一侧空得能听见风声，赌对是天才，赌错是素材。"],
  info: ["信息误判", "对手给了一个假脚步，你们像真的听见了命运。"],
  duel: ["明星对位", "对面明星开始要球，这回合像单挑，也像审判。"],
};

const scenarioList = [
  ["均势拉扯", 0],
  ["慢性崩盘", -5],
  ["被爆冷", -8],
  ["强队碾压", -10],
  ["赌点翻盘", -4],
  ["宿命局", 0],
];

function createInitialState() {
  return {
    phase: "setup",
    budget: START_BUDGET,
    pickedIds: [],
    week: 1,
    team: { money: 60, morale: 55, fame: 38, tactics: 50, chemistry: 50, fans: 42 },
    players: [],
    weeklyActions: [],
    currentMatch: null,
    pendingDecision: null,
    lastOpinion: null,
    logs: [],
    wins: 0,
    losses: 0,
    bestMoment: "还没有名场面",
    seasonEnded: false,
    lastResult: "等待建队",
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? { ...createInitialState(), ...JSON.parse(raw), pendingDecision: null } : createInitialState();
  } catch {
    return createInitialState();
  }
}

const store = createStore((set) => ({
  ...loadState(),
  togglePick: (name) => set((s) => {
    const player = marketPlayers.find((p) => p.name === name);
    const selected = s.pickedIds.includes(name);
    if (selected) return { pickedIds: s.pickedIds.filter((id) => id !== name), budget: s.budget + player.price };
    if (s.pickedIds.length >= 5 || s.budget < player.price) return {};
    return { pickedIds: [...s.pickedIds, name], budget: s.budget - player.price };
  }),
  startSeason: () => set((s) => {
    const players = s.pickedIds.map((id) => clone(marketPlayers.find((p) => p.name === id)));
    return {
      phase: "week",
      players,
      weeklyActions: rollWeeklyActions(),
      logs: [{ week: 1, title: "建队完成", text: `你选下了 ${players.map((p) => p.name).join("、")}。这不是阵容，这是五个会制造舆论的人。` }],
      lastResult: "第 1 周：选择本周方向",
    };
  }),
  newSeason: () => set(createInitialState()),
  clearLog: () => set({ logs: [] }),
  addLog: (title, text) => set((s) => ({ logs: [{ week: s.week, title, text }, ...s.logs].slice(0, 80) })),
  applyTeam: (effect = {}) => set((s) => ({ team: applyTeamEffect(s.team, effect) })),
  startMatch: (action) => set((s) => startMatchState(s, action)),
  appendLine: (line) => set((s) => ({ currentMatch: { ...s.currentMatch, lines: [...s.currentMatch.lines, line] } })),
  updateMatch: (patch) => set((s) => ({ currentMatch: { ...s.currentMatch, ...patch } })),
  setDecision: (decision) => set({ pendingDecision: decision }),
  applyDecision: (option) => set((s) => ({
    pendingDecision: null,
    team: applyTeamEffect(s.team, option.effect || {}),
    currentMatch: {
      ...s.currentMatch,
      coach: mergeStyle(s.currentMatch.coach, option.style),
      usedDecisionRounds: [...s.currentMatch.usedDecisionRounds, s.currentMatch.round],
      lines: [...s.currentMatch.lines, { tone: "event", text: `教练干预：${option.text}` }],
    },
  })),
  finishMatch: (won, opinion, moment) => set((s) => {
    const nextWeek = s.week + 1;
    const ended = nextWeek > SEASON_WEEKS;
    return {
      phase: ended ? "ended" : "post",
      wins: s.wins + (won ? 1 : 0),
      losses: s.losses + (won ? 0 : 1),
      lastOpinion: opinion,
      bestMoment: moment,
      seasonEnded: ended,
      lastResult: `${won ? "胜利" : "失利"} ${s.currentMatch.us}:${s.currentMatch.them}`,
    };
  }),
  nextWeek: () => set((s) => ({
    phase: "week",
    week: s.week + 1,
    weeklyActions: rollWeeklyActions(),
    currentMatch: null,
    pendingDecision: null,
    lastOpinion: null,
    lastResult: `第 ${s.week + 1} 周：选择本周方向`,
  })),
}));

store.subscribe((state) => {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, pendingDecision: null }));
  render();
});

function rollWeeklyActions() {
  return shuffle(weeklyDeck).slice(0, 3);
}

function applyTeamEffect(team, effect) {
  return Object.fromEntries(Object.entries(team).map(([k, v]) => [k, k === "money" ? clamp(v + (effect[k] || 0), 0, 999) : clamp(v + (effect[k] || 0))]));
}

function mergeStyle(base = {}, add = {}) {
  const next = { ...base };
  Object.entries(add).forEach(([k, v]) => (next[k] = (next[k] || 0) + v));
  return next;
}

function startMatchState(s, action) {
  const opponent = s.week === 5 ? opponents[0] : pick(opponents);
  const [scenario, bias] = s.week === 5 ? ["宿命局", 0] : pick(scenarioList);
  return {
    phase: "match",
    team: applyTeamEffect(s.team, action.effect),
    currentMatch: {
      opponent,
      scenario,
      bias,
      map: pick(["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust2"]),
      round: 0,
      us: 0,
      them: 0,
      economyUs: 50,
      economyThem: 50,
      coach: { ...action.style },
      usedDecisionRounds: [],
      lines: [{ tone: "event", text: `局势：${scenario}。对手是 ${opponent.name}：${opponent.note}。本周你选择了「${action.title}」。` }],
    },
    lastResult: `${opponent.name} · ${scenario}`,
  };
}

function avg(players, keys) {
  return players.reduce((sum, p) => sum + keys.reduce((s, k) => s + (p[k] || 0), 0) / keys.length, 0) / players.length;
}

function teamPower(state) {
  return avg(state.players, ["aim", "sense", "mental", "teamwork", "clutch"]) * 0.62 + state.team.morale * 0.12 + state.team.tactics * 0.13 + state.team.chemistry * 0.1 + state.team.fans * 0.03;
}

function nodeForRound(m) {
  if (m.round === 0) return "timeout";
  if (Math.max(m.us, m.them) >= 11) return "clutch";
  if (m.economyUs < 35 || m.economyThem < 35) return "eco";
  if (Math.abs(m.us - m.them) >= 5) return m.us < m.them ? "morale" : "info";
  return pick(["duel", "gamble", "info", "eco", "morale"]);
}

function tacticBonus(node, coach, opponent) {
  let b = 0;
  if (node === "eco") b += (coach.economy || 0) - 2;
  if (node === "gamble") b += (coach.gamble || 0) - (opponent.style === "纪律" ? 3 : 0);
  if (node === "info") b += (coach.info || 0) + (coach.discipline || 0) * 0.35;
  if (node === "duel") b += (coach.antiStar || 0) - (opponent.style === "明星" ? 4 : 0);
  if (node === "morale") b += coach.calm || 0;
  if (node === "timeout") b += (coach.discipline || 0) + (coach.calm || 0) * 0.4;
  if (coach.speed && opponent.style !== "提速") b += node === "info" ? -2 : coach.speed * 0.45;
  return b;
}

function winProbability(state, node) {
  const m = state.currentMatch;
  const base = 50 + (teamPower(state) - m.opponent.power) * 0.75;
  const economy = (m.economyUs - m.economyThem) * 0.12;
  const pressure = Math.max(m.us, m.them) >= 10 ? (state.team.morale - 50) * 0.1 + avg(state.players, ["clutch"]) * 0.04 - 3 : 0;
  return clamp(base + economy + m.bias + tacticBonus(node, m.coach, m.opponent) + pressure, 8, 92);
}

function shouldAskDecision(m) {
  if (m.usedDecisionRounds.includes(m.round)) return false;
  return m.round === 4 || m.round === 8 || (m.them - m.us >= 3 && m.round > 3) || Math.max(m.us, m.them) === 11;
}

function playNextRound() {
  const state = store.getState();
  const m = state.currentMatch;
  if (!m || state.pendingDecision || state.phase !== "match") return;
  if (shouldAskDecision(m)) {
    store.getState().setDecision({ prompt: "局势节点到了。你的暂停、变速、强起或赌点，会改变后续比赛风格。", options: shuffle(interventions).slice(0, 3) });
    return;
  }
  const node = nodeForRound(m);
  const prob = winProbability(state, node);
  const won = Math.random() * 100 < prob;
  const us = m.us + (won ? 1 : 0);
  const them = m.them + (won ? 0 : 1);
  const round = m.round + 1;
  const economyUs = clamp(m.economyUs + (won ? 12 : -14) + (node === "eco" ? 8 : 0));
  const economyThem = clamp(m.economyThem + (won ? -12 : 12));
  store.getState().appendLine(makeRoundLine(state, { node, prob, won, us, them, round }));
  store.getState().updateMatch({ round, us, them, economyUs, economyThem });
  if (us >= WIN_SCORE || them >= WIN_SCORE) {
    const fresh = { ...store.getState(), currentMatch: { ...store.getState().currentMatch, us, them } };
    const wonMatch = us > them;
    const moment = makeMoment(fresh, wonMatch);
    store.getState().addLog(wonMatch ? "比赛胜利" : "比赛失利", `${us}:${them}。${moment}`);
    store.getState().finishMatch(wonMatch, makeOpinion(fresh, wonMatch), moment);
  }
}

function pickWeighted(players, won) {
  const total = players.reduce((sum, p) => sum + (won ? p.aim + p.clutch : p.tilt + p.fatigue + 30), 0);
  let roll = Math.random() * total;
  for (const p of players) {
    roll -= won ? p.aim + p.clutch : p.tilt + p.fatigue + 30;
    if (roll <= 0) return p;
  }
  return players[0];
}

function makeRoundLine(state, ctx) {
  const [title, detail] = nodes[ctx.node];
  const p = pickWeighted(state.players, ctx.won);
  const action = ctx.won ? winAction(p, ctx.node) : loseAction(p, state.currentMatch.opponent.star, ctx.node);
  const cast = castLine(ctx, p);
  return { tone: ctx.won ? "good" : "bad", text: `<small>R${ctx.round}｜${ctx.us}:${ctx.them}｜${title}｜参考胜率 ${ctx.prob.toFixed(2)}%</small>${detail}<br>${action}<br><br>解说台：${cast}` };
}

function winAction(p, node) {
  const map = {
    eco: `${p.name} 用捡来的枪打出双杀，经济局硬翻。`,
    clutch: `${p.name} 残局没有急，等到对手转身才开枪。`,
    timeout: `暂停后队伍真的变了，${p.name} 第一个前压，把默认位置打穿。`,
    morale: `${p.name} 把不该赢的回合拖回来了，语音里第一次有人笑出声。`,
    gamble: `赌点生效，${p.name} 蹲在非常规位，像蹲到了对手剧本。`,
    info: `信息差三架位打成了，${p.name} 没看到人，但看到了对手意图。`,
    duel: `${p.name} 对上对面明星没有退，第一枪准得像提前知道论坛会吵。`,
  };
  return map[node];
}

function loseAction(p, star, node) {
  const map = {
    eco: `${p.name} 这把强起没有声音，钱没了，回合也没了。`,
    clutch: `${p.name} 最后一枪空了，对面 ${star} 没给第二次机会。`,
    timeout: `暂停刚结束就白给，战术板还热着，比分已经凉了。`,
    morale: `${p.name} 没补上那枪，语音突然安静。`,
    gamble: `赌点赌错了，地图另一侧像开了门，对手排队进包点。`,
    info: `假脚步骗到了你们，真正的进攻已经进点。`,
    duel: `对面 ${star} 开始收割，你的针对像写在纸上的勇敢。`,
  };
  return map[node];
}

function castLine(ctx, p) {
  if (ctx.won && ctx.prob < 35) return "卧槽真的假的？参考胜率这么低都能翻，黑暗中的曙光啊兄弟们！";
  if (!ctx.won && ctx.prob > 68) return "这都能输？对世界观冲击太大了，菜就多练好吧。";
  if (ctx.node === "clutch") return "残局来了，所有人都别眨眼，这不是打游戏，是打心跳。";
  return ctx.won ? `不得不提啊兄弟们，${p.name} 这回合真有东西。` : "完了，慢性崩盘的味道出来了，再别说了。";
}

function makeOpinion(state, won) {
  const m = state.currentMatch;
  const headline = won ? pick(["这暂停值一个 Major 冠军。", "教练今天真有东西。", "从赌点到绝杀，这队终于像个队了。"]) : pick(["这教练是不是不会 CALL？", "暂停叫了，但像叫给观众看的。", "这不是输比赛，是把粉丝世界观打碎了。"]);
  const ratings = state.players.map((p) => ({ name: p.name, score: clamp((won ? 7.2 : 5.4) + (p.clutch - 70) / 20 + Math.random() * 1.8, 1, 10).toFixed(1) }));
  return { headline, body: `${m.opponent.name} ${m.map}，最终 ${m.us}:${m.them}。论坛争论点：参考胜率到底有没有用，为什么低胜率回合反而最像名场面。`, ratings };
}

function makeMoment(state, won) {
  const m = state.currentMatch;
  if (m.scenario === "宿命局") return won ? "那个宿命局：五年前的队友，今天被你的暂停拆开了" : "那个宿命局：旧队友情分没救回最后一分";
  if (won && m.them >= 11) return "那次绝杀：参考胜率很低的回合，被你赌成了封面";
  if (!won && m.us >= 11) return "那次崩盘：离 13 分只差一口气，最后全队都不敢呼吸";
  return won ? "那次翻盘：不是数值赢了，是暂停真的改了走势" : "那次被爆冷：纸面优势被一回合一回合拆掉";
}

function render() {
  const s = store.getState();
  $("setupView").classList.toggle("hidden", s.phase !== "setup");
  $("gameView").classList.toggle("hidden", s.phase === "setup");
  $("saveStatus").textContent = `已自动存档 · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  renderSetup(s);
  if (s.phase !== "setup") {
    renderTeam(s);
    renderActions(s);
    renderDecision(s);
    renderMatch(s);
    renderOpinion(s);
    renderEnd(s);
    renderLog(s);
  }
}

function renderSetup(s) {
  $("budgetText").textContent = `预算 ¥${s.budget}`;
  $("pickedText").textContent = `已选 ${s.pickedIds.length} / 5`;
  $("startSeasonBtn").disabled = s.pickedIds.length !== 5;
  $("market").innerHTML = marketPlayers.map((p) => {
    const selected = s.pickedIds.includes(p.name);
    const disabled = !selected && (s.pickedIds.length >= 5 || s.budget < p.price);
    return `<button class="player-card ${selected ? "selected" : ""}" ${disabled ? "disabled" : ""} data-pick="${p.name}" type="button"><h3><span>${p.name}</span><span>¥${p.price}</span></h3><p>${p.role} · ${p.tag} · ${p.voice}</p><div class="mini">${playerStatDefs.map(([l, k]) => `<span>${l}${p[k]}</span>`).join("")}</div></button>`;
  }).join("");
  document.querySelectorAll("[data-pick]").forEach((btn) => btn.addEventListener("click", () => store.getState().togglePick(btn.dataset.pick)));
}

function renderTeam(s) {
  $("seasonLine").textContent = `第 ${s.week} 周 / ${SEASON_WEEKS} 周`;
  $("recordLine").textContent = `${s.wins}W-${s.losses}L`;
  $("lastResult").textContent = s.lastResult;
  $("weekTitle").textContent = s.phase === "match" ? "点击推进每个回合" : s.phase === "post" ? "赛后舆论" : s.phase === "ended" ? "赛季结束" : "选择本周行动";
  $("phaseLabel").textContent = s.phase === "match" ? "文字直播" : "每周局势";
  $("teamStats").innerHTML = teamStatDefs.map(([label, key, prefix]) => `<div class="stat-row"><div class="stat-top"><span>${label}</span><b>${prefix}${s.team[key]}</b></div><div class="bar"><span style="width:${Math.min(100, s.team[key])}%"></span></div></div>`).join("");
  $("roster").innerHTML = s.players.map((p) => `<div class="player"><strong><span>${p.name}</span><span>${p.role}</span></strong><p>${p.tag} · ${p.voice}</p><div class="mini">${playerStatDefs.map(([l, k]) => `<span>${l}${p[k]}</span>`).join("")}</div></div>`).join("");
}

function renderActions(s) {
  $("actions").classList.toggle("hidden", s.phase !== "week");
  $("actions").innerHTML = s.weeklyActions.map((a) => `<button class="action-card" data-action="${a.id}" type="button"><h3>${a.title}</h3><p>${a.text}</p><span class="tag">本周风格会变化</span></button>`).join("");
  document.querySelectorAll("[data-action]").forEach((btn) => btn.addEventListener("click", () => store.getState().startMatch(s.weeklyActions.find((a) => a.id === btn.dataset.action))));
}

function renderDecision(s) {
  $("decisionBox").classList.toggle("hidden", !s.pendingDecision);
  if (!s.pendingDecision) return;
  $("decisionText").textContent = s.pendingDecision.prompt;
  $("decisionOptions").innerHTML = s.pendingDecision.options.map((o, i) => `<button class="decision-option" data-decision="${i}" type="button">${o.label}</button>`).join("");
  document.querySelectorAll("[data-decision]").forEach((btn) => btn.addEventListener("click", () => store.getState().applyDecision(s.pendingDecision.options[Number(btn.dataset.decision)])));
}

function renderMatch(s) {
  const m = s.currentMatch;
  $("matchCard").classList.toggle("hidden", s.phase !== "match" || !m);
  if (!m) return;
  $("matchName").textContent = `${m.map} vs ${m.opponent.name}`;
  $("matchScore").textContent = `${m.us} : ${m.them}`;
  $("matchMeta").innerHTML = [`局势 ${m.scenario}`, `对手风格 ${m.opponent.style}`, `我方经济 ${m.economyUs}`, `对方经济 ${m.economyThem}`].map((x) => `<span class="tag">${x}</span>`).join("");
  $("matchFeed").innerHTML = m.lines.map((line) => `<div class="round-line ${line.tone === "bad" ? "bad" : line.tone === "event" ? "event" : ""}">${line.text}</div>`).join("");
  $("matchFeed").scrollTop = $("matchFeed").scrollHeight;
}

function renderOpinion(s) {
  $("opinionBox").classList.toggle("hidden", s.phase !== "post");
  if (!s.lastOpinion) return;
  $("forumCard").innerHTML = `<h3>虎扑 CS2｜${s.lastOpinion.headline}</h3><p>${s.lastOpinion.body}</p><div class="rating-grid">${s.lastOpinion.ratings.map((r) => `<div class="rating"><span>${r.name}</span><strong>${r.score}</strong></div>`).join("")}</div>`;
}

function renderEnd(s) {
  $("seasonEnd").classList.toggle("hidden", s.phase !== "ended");
  if (s.phase !== "ended") return;
  $("endingTitle").textContent = s.wins >= 4 ? "那个被记住的赛季" : s.wins >= 2 ? "有名场面的危险项目" : "流量很高的事故现场";
  $("endingBody").textContent = `5 周结束，战绩 ${s.wins}W-${s.losses}L。你留下的不是经营数值，而是：${s.bestMoment}`;
  $("records").innerHTML = [["最终战绩", `${s.wins}W-${s.losses}L`], ["赛季记忆", s.bestMoment], ["最终名气", s.team.fame], ["粉丝支持", s.team.fans], ["战术熟练度", s.team.tactics], ["团队默契", s.team.chemistry]].map(([a, b]) => `<div class="record"><span>${a}</span><strong>${b}</strong></div>`).join("");
}

function renderLog(s) {
  $("log").innerHTML = s.logs.map((l) => `<article class="log-item"><strong>W${l.week} · ${l.title}</strong><p>${l.text}</p></article>`).join("");
}

$("startSeasonBtn").addEventListener("click", () => store.getState().startSeason());
$("newSeasonBtn").addEventListener("click", () => { if (confirm("确定重开？当前存档会被覆盖。")) store.getState().newSeason(); });
$("restartBtn").addEventListener("click", () => store.getState().newSeason());
$("clearLogBtn").addEventListener("click", () => store.getState().clearLog());
$("nextRoundBtn").addEventListener("click", playNextRound);
$("nextWeekBtn").addEventListener("click", () => store.getState().nextWeek());

render();
