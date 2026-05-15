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
  return { getState, subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)) };
}

const SAVE_KEY = "cs2-coach-season-v6";
const WIN_SCORE = 13;
const SEASON_WEEKS = 5;
const START_BUDGET = 100;

// MR12 cashflow (used to back economy bars/labels; gameplay structure stays the same).
const MR12_KILL_REWARD = { rifle: 300, smg: 600, awp: 100, shotgun: 900 };
const MR12_LOSS_BONUS = [0, 1400, 1900, 2400, 2900, 3400];

// Narrative placeholders (UI copy only).
const narrative = {
  heroLines: [],
  broadcastShots: [],
  benchNotes: [],
};

const $ = (id) => document.getElementById(id);
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const clone = (v) => JSON.parse(JSON.stringify(v));

function mr12EconomyScore(money) {
  return clamp((money / 16000) * 100);
}

function settleMr12Round({ winner, loser, winnerCause, loserLossStreak, winnerLossStreak }) {
  const next = {
    winnerMoney: winner.money,
    loserMoney: loser.money,
    winnerLossStreak: winnerLossStreak,
    loserLossStreak: loserLossStreak,
  };

  // 1) streaks
  next.loserLossStreak += 1;
  next.winnerLossStreak = 0;

  // 2) loser bonus
  next.loserMoney += MR12_LOSS_BONUS[Math.min(next.loserLossStreak, 5)];

  // 3) winner bonus
  next.winnerMoney += winnerCause === "bomb" ? 3500 : 3250;

  // 4) kill rewards (simple proxy: winner secures 3 kills each round)
  const weapons = ["rifle", "smg", "awp"];
  for (const w of weapons) next.winnerMoney += MR12_KILL_REWARD[w];

  // 5) caps
  next.winnerMoney = Math.min(next.winnerMoney, 16000);
  next.loserMoney = Math.min(next.loserMoney, 16000);

  return next;
}

const teamStatDefs = [["资金", "money", "¥"], ["士气", "morale", ""], ["名气", "fame", ""], ["战术熟练度", "tactics", ""], ["团队默契", "chemistry", ""], ["粉丝支持", "fans", ""]];
const playerStatDefs = [["枪", "aim"], ["脑", "sense"], ["心", "mental"], ["团", "teamwork"], ["商", "market"], ["疲", "fatigue"]];

const rawPlayers = [
  ["ZywOo","全能核心",40,"六边形战士","S级超巨",100,100,90,80,100,94,22],
  ["donk","突破",37,"枪法天花板","S级超巨",100,80,70,70,90,75,58],
  ["ropz","自由人",34,"自由人教科书","S级超巨",90,100,90,90,70,94,19],
  ["m0NESY","狙击",36,"狙击艺术家","S级超巨",100,90,80,70,100,84,38],
  ["sh1ro","狙击",28,"保守狙神","A级核心",80,90,90,80,60,90,22],
  ["molodoy","辅助",22,"体系绿叶","A级核心",80,80,80,90,50,80,27],
  ["flameZ","辅助",22,"牺牲拼图","A级核心",70,80,80,100,50,80,24],
  ["frozen","步枪",25,"稳定器","A级核心",80,80,80,90,60,80,27],
  ["KSCERATO","步枪",25,"巴西一哥","A级核心",80,80,80,80,70,80,30],
  ["Spinx","步枪",24,"以色列核心","A级核心",80,80,80,80,60,80,30],
  ["Twistzz","步枪",23,"北美枪男","A级核心",80,70,70,80,70,70,38],
  ["mezii","辅助",18,"团队粘合剂","B级主力",70,80,80,90,50,80,27],
  ["Senzu","步枪",18,"亚洲核心","B级主力",80,70,80,80,40,76,30],
  ["XANTARES","突破",21,"土耳其 aim 神","B级主力",90,70,70,60,50,70,44],
  ["YEKINDAR","突破",22,"狂哥","B级主力",90,70,70,70,60,70,41],
  ["xertioN","突破",19,"冷静突破","B级主力",70,80,80,90,50,80,27],
  ["torzsi","狙击",18,"体系狙","B级主力",70,80,70,80,50,75,38],
  ["NiKo","明星步枪",30,"Major 魔咒","A级核心",90,80,50,70,80,64,57],
  ["iM","辅助",18,"逆境爆发","B级主力",70,80,80,90,50,80,27],
  ["b1t","步枪",24,"冠军拼图","A级核心",80,80,80,90,60,80,27],
  ["HeavyGod","步枪",18,"高光低谷","B级主力",80,70,70,70,50,70,41],
  ["kyousuke","步枪",17,"未来可期","潜力新星",80,70,70,70,60,70,41],
  ["w0nderful","狙击",20,"稳定成长","B级主力",80,80,70,80,60,75,38],
  ["Wicadia","步枪",16,"土耳其枪手","B级主力",80,70,70,70,40,70,41],
  ["yuurih","步枪",18,"南美核心","B级主力",80,70,70,80,50,70,38],
  ["Makazze","辅助",14,"国际纵队新血","潜力新星",70,70,80,80,40,76,30],
  ["910","狙击",16,"蒙古狙击手","潜力新星",80,70,70,70,40,70,41],
  ["MATYS","步枪",16,"年轻步枪手","潜力新星",80,70,70,70,50,70,41],
  ["tN1R","步枪",16,"Spirit 新血","潜力新星",80,70,70,70,50,70,41],
  ["latto","辅助",14,"南美绿叶","B级主力",70,70,80,80,40,76,30],
  ["s1mple","狙击",34,"CS:GO GOAT","传奇级",100,90,70,60,100,79,44],
  ["device","狙击",28,"丹麦传奇","传奇级",80,90,80,80,70,84,30],
  ["huNter-","步枪",22,"巴尔干核心","A级核心",80,80,70,80,60,75,38],
  ["broky","狙击",22,"松弛狙击","A级核心",80,80,70,80,60,75,38],
  ["rain","步枪",23,"十年忠诚","A级核心",80,70,80,90,60,76,27],
  ["Magisk","步枪",24,"冠军拼图","A级核心",80,80,80,90,60,80,27],
  ["cadiaN","IGL",24,"争议领袖","传奇级",70,90,70,80,70,79,38],
  ["jks","自由人",23,"冷面杀手","A级核心",80,80,80,90,50,80,27],
  ["Jimpphat","步枪",18,"18岁冠军","潜力新星",80,70,80,80,60,76,30],
  ["EliGE","步枪",23,"北美荣光","A级核心",80,70,80,90,60,76,27],
];

const marketPlayers = rawPlayers.map(([name, role, price, tag, voice, aim, sense, mental, teamwork, market, clutch, tilt]) => ({
  name, role, price, tag, voice, aim, sense, mental, teamwork, market, clutch, tilt, fatigue: 18,
}));

const opponents = [
  { name: "Vitality", style: "纪律队", note: "稳定、纪律、明星不讲理", power: 88, star: "ZywOo" },
  { name: "FaZe Clan", style: "慢打队", note: "宿命感很重，残局很硬", power: 84, star: "ropz" },
  { name: "Falcons", style: "明星单核队", note: "预算像开了控制台", power: 86, star: "NiKo" },
  { name: "Spirit", style: "激进队", note: "对面也有一个不想等烟散的人", power: 85, star: "donk" },
  { name: "二线黑马队", style: "赌点队", note: "纸面不强，最擅长让强队丢人", power: 76, star: "Rookie" },
  { name: "心理战队", style: "心理战队", note: "暂停很慢，假动作很多", power: 80, star: "Caller" },
];

const weeklyDeck = [
  { id: "discipline", title: "📋 强调纪律", text: "默认控图、补枪、听 IGL。暂停后更容易连续前压同一片区域。", effect: { tactics: 8, chemistry: 3, morale: -2 }, style: { discipline: 8 } },
  { id: "gamble", title: "🎲 放手赌点", text: "训练非常规赌点。打穿对手或变成论坛素材。", effect: { fame: 5, tactics: -2, morale: 2 }, style: { gamble: 9 } },
  { id: "antiStar", title: "🎯 针对对面明星", text: "双架、反清、假信息，全都往对面明星脸上招呼。", effect: { tactics: 5, chemistry: -1 }, style: { antiStar: 9 } },
  { id: "speed", title: "⚡ 直接提速", text: "不让对手舒服架默认。你们会更像刀，也更像赌徒。", effect: { morale: 4, fans: 3, tactics: -3 }, style: { speed: 9 } },
  { id: "calm", title: "🧯 安抚红温选手", text: "把红温留给准星，不留给语音。关键局心态更稳。", effect: { morale: 8, chemistry: 4, fame: -1 }, style: { calm: 9 } },
  { id: "eco", title: "💸 经济纪律训练", text: "强起和保枪都有理由。买枪开始变成选择题。", effect: { money: 4, tactics: 5, morale: -1 }, style: { economy: 8 } },
  { id: "info", title: "👁 信息差三架位", text: "练三架、反摸和假脚步。对手会开始怀疑默认位置。", effect: { tactics: 7, chemistry: 2 }, style: { info: 8 } },
];

const baseInterventions = [
  { label: "叫暂停，强调纪律", style: { discipline: 8, calm: 2 }, effect: { tactics: 3, morale: 1 }, text: "暂停之后，队伍连续三回合前压 A 厅。对手没有提前警戒这个默认位。" },
  { label: "直接提速", style: { speed: 9 }, effect: { morale: 2, tactics: -1 }, text: "你让队伍把默认撕掉。下一回合，五个人像一把没上保险的刀。" },
  { label: "强起，买无甲大狙", style: { gamble: 10, economy: -4 }, effect: { money: -2, fame: 3 }, text: "无甲大狙买出来那一刻，弹幕先笑了。十秒后没人笑了。" },
  { label: "非常规赌点", style: { gamble: 10, info: 3 }, effect: { tactics: -1, fans: 2 }, text: "你赌了一个没人敢赌的位置。对手搜点路线慢了半秒，半秒就是枪线。" },
  { label: "针对对面明星", style: { antiStar: 10, discipline: 2 }, effect: { tactics: 2, morale: 1 }, text: "你把两颗闪和一个人都丢给对面明星。围剿开始。" },
  { label: "安抚红温选手", style: { calm: 10 }, effect: { morale: 4, chemistry: 3 }, text: "你没有骂 {hot}，只说：下一枪你来开，但报点要报。语音降温了，准星没降。" },
];

const nodes = {
  eco: ["经济局", "经济像刚被老板审过，强起和保枪都很难看。"],
  clutch: ["关键残局", "场上只剩两个人，语音里只剩呼吸声。"],
  timeout: ["暂停窗口", "镜头切到教练席，所有人都在等你有没有东西。"],
  morale: ["心态回合", "这一分会影响谁还愿意相信谁。"],
  gamble: ["赌点", "地图另一侧空得能听见风声，赌对是天才，赌错是素材。"],
  info: ["信息误判", "对手给了一个假脚步，你们像真的听见了命运。"],
  duel: ["明星对位", "对面明星开始要球，这回合像单挑，也像审判。"],
};

const scripts = [
  ["开局暴打", -8],
  ["被碾压", -10],
  ["经济崩盘", -6],
  ["加时鏖战", 0],
  ["赌点翻盘", -4],
  ["明星爆种", 4],
  ["对手调整战术", -3],
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
    // v2-mobile: skip draft (don't read pickedIds), hardcode a roster.
    const players = ["donk", "ropz", "sh1ro", "NiKo", "ZywOo"].map((id) => clone(marketPlayers.find((p) => p.name === id)));
    return {
      phase: "week",
      week: 1,
      players,
      weeklyActions: rollWeeklyActions(),
      logs: [{ week: 1, title: "建队完成", text: `你选下了 ${players.map((p) => p.name).join("、")}。这套阵容决定你能叫出什么暂停，也决定谁会在关键局站出来。` }],
      lastResult: "第 1 周：选择本周方向",
    };
  }),
  newSeason: () => set(createInitialState()),
  continueSeason: () => set((s) => ({
    week: 1,
    team: applyTeamEffect(s.team, { morale: 8, chemistry: 8, tactics: 4 }),
    players: s.players.map((p) => ({ ...p, fatigue: clamp(p.fatigue - 10), teamwork: clamp(p.teamwork + 2) })),
    logs: [{ week: 1, title: "继续磨合", text: "你没有拆队。队员理解这是信任，也明白下一次崩盘要自己扛。" }, ...s.logs].slice(0, 80),
    wins: 0,
    losses: 0,
    seasonEnded: false,
    lastResult: "新 5 周：继续磨合",
  })),
  addLog: (title, text) => set((s) => ({ logs: [{ week: s.week, title, text }, ...s.logs].slice(0, 80) })),
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
      timeouts: s.currentMatch.timeouts - (s.pendingDecision?.timeoutCost ? 1 : 0),
      usedDecisionRounds: [...s.currentMatch.usedDecisionRounds, s.currentMatch.round],
      lines: [...s.currentMatch.lines, { tone: "event", text: `教练干预：${renderDecisionText(option.text, s)}` }],
    },
  })),
  finishMatch: (won, opinion, moment) => set((s) => {
    return {
      // v2-mobile: no multi-week loop; always allow immediate rematch.
      phase: "post",
      wins: s.wins + (won ? 1 : 0),
      losses: s.losses + (won ? 0 : 1),
      lastOpinion: opinion,
      bestMoment: moment,
      seasonEnded: false,
      lastResult: `${won ? "胜利" : "失利"} ${s.currentMatch.us}:${s.currentMatch.them}`,
    };
  }),
  nextWeek: () => set((s) => {
    // v2-mobile: "再来一局" - restart the same matchup/script/map.
    if (!s.currentMatch) return { phase: "week", week: 1 };
    const m = s.currentMatch;
    return {
      phase: "match",
      week: 1,
      pendingDecision: null,
      lastOpinion: null,
      lastResult: `${m.opponent.name} · ${m.script}`,
      currentMatch: {
        ...m,
        round: 0,
        us: 0,
        them: 0,
        economyUs: 50,
        economyThem: 50,
        adjustCount: 0,
        timeouts: 3,
        usedDecisionRounds: [],
        lines: [{ tone: "event", text: `剧本：${m.script}。对手是 ${m.opponent.name}：${m.opponent.note}。` }],
      },
    };
  }),
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
  const [script, bias] = s.week === 5 ? ["宿命局", 0] : pick(scripts);
  return {
    phase: "match",
    team: applyTeamEffect(s.team, action.effect),
    currentMatch: {
      opponent,
      script,
      bias,
      map: pick(["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust2"]),
      round: 0,
      us: 0,
      them: 0,
      economyUs: 800,
      economyThem: 800,
      lossStreakUs: 0,
      lossStreakThem: 0,
      coach: { ...action.style },
      timeouts: 3,
      adjustCount: 0,
      usedDecisionRounds: [],
      lines: [{ tone: "event", text: `剧本：${script}。对手是 ${opponent.name}：${opponent.note}。本周你选择了「${action.title}」。` }],
    },
    lastResult: `${opponent.name} · ${script}`,
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
  if (m.economyUs < 3300 || m.economyThem < 3300) return "eco";
  if (Math.abs(m.us - m.them) >= 5) return m.us < m.them ? "morale" : "info";
  return pick(["duel", "gamble", "info", "eco", "morale"]);
}

function tacticBonus(node, coach, opponent) {
  let b = 0;
  if (node === "eco") b += (coach.economy || 0) - 2;
  if (node === "gamble") b += (coach.gamble || 0) - (opponent.style === "纪律队" ? 3 : 0);
  if (node === "info") b += (coach.info || 0) + (coach.discipline || 0) * 0.35;
  if (node === "duel") b += (coach.antiStar || 0) - (opponent.style === "明星单核队" ? 4 : 0);
  if (node === "morale") b += coach.calm || 0;
  if (node === "timeout") b += (coach.discipline || 0) + (coach.calm || 0) * 0.4;
  if (coach.speed && opponent.style !== "激进队") b += node === "info" ? -2 : coach.speed * 0.45;
  return b;
}

function winProbability(state, node) {
  const m = state.currentMatch;
  const base = 50 + (teamPower(state) - m.opponent.power) * 0.75;
  const economy = ((m.economyUs - m.economyThem) / 1000) * 0.12;
  const pressure = Math.max(m.us, m.them) >= 10 ? (state.team.morale - 50) * 0.1 + avg(state.players, ["clutch"]) * 0.04 - 3 : 0;
  return clamp(base + economy + m.bias + tacticBonus(node, m.coach, m.opponent) + pressure - m.adjustCount * 2.2, 8, 92);
}

function shouldAskDecision(m) {
  if (m.usedDecisionRounds.includes(m.round)) return false;
  return m.round === 4 || m.round === 8 || (m.them - m.us >= 3 && m.round > 3) || Math.max(m.us, m.them) === 11;
}

function makeDecisionPrompt(m) {
  if (m.them - m.us >= 3) return "连续丢分，士气在掉。你要训话、变速，还是把比赛交给明星？";
  if (m.adjustCount >= 2) return "对手已经连续两次针对你的转点做调整。继续默认会被吃，换一个高风险 call？";
  if (Math.max(m.us, m.them) >= 11) return "赛点边缘。每一个赌点都可能变成封面，也可能变成会议材料。";
  return "局势节点到了。暂停、变速、强起或赌点，都会改变后续比赛风格。";
}

function dynamicInterventions(m) {
  const pool = [...baseInterventions];
  if (m.them - m.us >= 3) {
    pool.unshift(
      { label: "暂停训话", style: { calm: 9, discipline: 4 }, effect: { morale: 5, chemistry: 2 }, text: "你把耳机放下，只讲下一分怎么拿。队员的呼吸慢了下来。" },
      { label: "让明星自由发挥", style: { speed: 4, gamble: 7 }, effect: { fame: 4, chemistry: -3 }, text: "你把战术板合上：这一回合，谁敢开枪谁说了算。" }
    );
  }
  if (m.adjustCount >= 2) {
    pool.unshift({ label: "假转点骗调整", style: { info: 10, discipline: 3 }, effect: { tactics: 3 }, text: "对手开始针对你的转点，你给他们一个假答案。" });
  }
  if (m.economyUs < 3300) {
    pool.unshift({ label: "半甲 Tec-9 提速", style: { speed: 8, economy: -2 }, effect: { money: -1, fame: 2 }, text: "经济已经烂了，那就把节奏也打烂。" });
  }
  return shuffle(pool).slice(0, 3);
}

function activePause() {
  const s = store.getState();
  const m = s.currentMatch;
  if (s.phase !== "match" || s.pendingDecision || !m || m.timeouts <= 0) return;
  store.getState().setDecision({
    prompt: `主动暂停。你还剩 ${m.timeouts} 次暂停，这次会消耗 1 次。`,
    options: dynamicInterventions(m),
    timeoutCost: true,
  });
}

function renderDecisionText(text, state) {
  const hot = [...state.players].sort((a, b) => b.tilt + b.fatigue - (a.tilt + a.fatigue))[0]?.name || "核心选手";
  return text.replaceAll("{hot}", hot);
}

function playNextRound() {
  const state = store.getState();
  const m = state.currentMatch;
  if (!m || state.pendingDecision || state.phase !== "match") return;
  if (shouldAskDecision(m)) {
    store.getState().setDecision({ prompt: makeDecisionPrompt(m), options: dynamicInterventions(m) });
    return;
  }
  const node = nodeForRound(m);
  const prob = winProbability(state, node);
  const won = Math.random() * 100 < prob;
  const us = m.us + (won ? 1 : 0);
  const them = m.them + (won ? 0 : 1);
  const round = m.round + 1;
  let economyUs = m.economyUs;
  let economyThem = m.economyThem;
  let lossStreakUs = m.lossStreakUs || 0;
  let lossStreakThem = m.lossStreakThem || 0;

  const winnerCause = Math.random() < 0.28 ? "bomb" : "elim";
  const settled = won
    ? settleMr12Round({
        winner: { money: economyUs },
        loser: { money: economyThem },
        winnerCause,
        loserLossStreak: lossStreakThem,
        winnerLossStreak: lossStreakUs,
      })
    : settleMr12Round({
        winner: { money: economyThem },
        loser: { money: economyUs },
        winnerCause,
        loserLossStreak: lossStreakUs,
        winnerLossStreak: lossStreakThem,
      });

  if (won) {
    economyUs = settled.winnerMoney;
    economyThem = settled.loserMoney;
    lossStreakUs = settled.winnerLossStreak;
    lossStreakThem = settled.loserLossStreak;
  } else {
    economyUs = settled.loserMoney;
    economyThem = settled.winnerMoney;
    lossStreakUs = settled.loserLossStreak;
    lossStreakThem = settled.winnerLossStreak;
  }
  const adjustCount = m.adjustCount + (!won && ["info", "gamble", "duel"].includes(node) ? 1 : 0);
  store.getState().appendLine(makeRoundLine(state, { node, prob, won, us, them, round, adjustCount }));
  store.getState().updateMatch({ round, us, them, economyUs, economyThem, lossStreakUs, lossStreakThem, adjustCount });
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
  const adjust = ctx.adjustCount >= 2 && !ctx.won ? "<br>警报：对方已经开始根据你的转点节奏提前站位。" : "";
  return { tone: ctx.won ? "good" : "bad", text: `<small>第${ctx.round}回合｜${ctx.us}:${ctx.them}｜${title}｜参考胜率 ${ctx.prob.toFixed(2)}%</small>${detail}<br>${action}${adjust}<br><br>解说台：${cast}` };
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
  const winLines = [
    `不得不提啊兄弟们，${p.name} 这回合真有东西。`,
    "这波有暂停后的味道，线路全对上了。",
    "赌对了！这一下对手的默认被你撕开了。",
    "黑暗中的曙光出来了，硬把局势从地上捡起来。",
    "这个回合打完，对面下次真不敢这么默认了。",
  ];
  const loseLines = [
    "这分丢得太伤，局势被对方提前调整压住了。",
    "慢性崩盘的味道出来了，但还没到不能救。",
    "这个 call 没打出来，论坛标题已经开始自己写了。",
    "这种信息误判，对世界观冲击太大了。",
    "这回合要进复盘，而且会反复暂停。",
  ];
  if (ctx.won && ctx.prob < 35) return "卧槽真的假的？参考胜率这么低都能翻，黑暗中的曙光啊兄弟们！";
  if (!ctx.won && ctx.prob > 68) return "这都能输？对世界观冲击太大了，菜就多练好吧。";
  if (ctx.node === "clutch") return "残局来了，所有人都别眨眼，现在打的是心跳。";
  return ctx.won ? pick(winLines) : pick(loseLines);
}

function makeOpinion(state, won) {
  const m = state.currentMatch;
  const headline = won ? pick(["这暂停值一个 Major 冠军。", "教练今天真有东西。", "从赌点到绝杀，这队终于像个队了。"]) : pick(["这教练会不会 CALL？", "暂停叫了，但像叫给观众看的。", "粉丝世界观被这一场打碎了。"]);
  const ratings = state.players.map((p) => ({ name: p.name, score: clamp((won ? 7.2 : 5.4) + (p.clutch - 70) / 20 + Math.random() * 1.8, 1, 10).toFixed(1) }));
  return { headline, body: `${m.opponent.name} ${m.map}，最终 ${m.us}:${m.them}。论坛争论点：对方调整为什么来得这么快，低胜率回合为什么最像名场面。`, ratings };
}

function makeMoment(state, won) {
  const m = state.currentMatch;
  if (m.script === "宿命局") return won ? "那个宿命局：五年前的队友，今天被你的暂停拆开了" : "那个宿命局：旧队友情分没救回最后一分";
  if (won && m.them >= 11) return "那次绝杀：参考胜率很低的回合，被你赌成了封面";
  if (!won && m.us >= 11) return "那次崩盘：离 13 分只差一口气，最后全队都不敢呼吸";
  return won ? "那次翻盘：暂停真的改了走势" : "那次被爆冷：纸面优势被一回合一回合拆掉";
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
  $("activePauseBtn").disabled = s.phase !== "match" || !m || !!s.pendingDecision || m.timeouts <= 0;
  $("activePauseBtn").textContent = m ? `主动暂停 x${m.timeouts}` : "主动暂停 x3";
  if (!m) return;
  $("matchName").textContent = `${m.map} vs ${m.opponent.name}`;
  $("matchScore").textContent = `${m.us} : ${m.them}`;
  $("matchMeta").innerHTML = [
    `剧本 ${m.script}`,
    `对手风格 ${m.opponent.style}`,
    `我方经济 $${m.economyUs}`,
    `对方经济 $${m.economyThem}`,
    `对手调整 ${m.adjustCount} 次`,
  ].map((x) => `<span class="tag">${x}</span>`).join("");
  $("matchFeed").innerHTML = m.lines.map((line) => `<div class="round-line ${line.tone === "bad" ? "bad" : line.tone === "event" ? "event" : ""}">${line.text}</div>`).join("");
  $("matchFeed").scrollTop = $("matchFeed").scrollHeight;
  $("nextRoundBtn").textContent = `第${m.round + 1}回合\n\n[继续]`;
}

function renderOpinion(s) {
  $("opinionBox").classList.toggle("hidden", s.phase !== "post");
  if (!s.lastOpinion) return;
  $("nextWeekBtn").textContent = "再来一局";
  $("forumCard").innerHTML = `<h3>虎扑 CS2｜${s.lastOpinion.headline}</h3><p>${s.lastOpinion.body}</p><div class="rating-grid">${s.lastOpinion.ratings.map((r) => `<div class="rating"><span>${r.name}</span><strong>${r.score}</strong></div>`).join("")}</div>`;
}

function renderEnd(s) {
  $("seasonEnd").classList.toggle("hidden", s.phase !== "ended");
  if (s.phase !== "ended") return;
  $("endingTitle").textContent = s.wins >= 4 ? "那个被记住的赛季" : s.wins >= 2 ? "有名场面的危险项目" : "流量很高的事故现场";
  $("endingBody").textContent = `5 周结束，战绩 ${s.wins}W-${s.losses}L。这个赛季留下的镜头：${s.bestMoment}`;
  $("records").innerHTML = [["最终战绩", `${s.wins}W-${s.losses}L`], ["赛季记忆", s.bestMoment], ["最终名气", s.team.fame], ["粉丝支持", s.team.fans], ["战术熟练度", s.team.tactics], ["团队默契", s.team.chemistry]].map(([a, b]) => `<div class="record"><span>${a}</span><strong>${b}</strong></div>`).join("");
}

function renderLog(s) {
  $("log").innerHTML = s.logs.map((l) => `<article class="log-item"><strong>W${l.week} · ${l.title}</strong><p>${l.text}</p></article>`).join("");
}

$("startSeasonBtn").addEventListener("click", () => store.getState().startSeason());
$("newSeasonBtn").addEventListener("click", () => { if (confirm("确定变阵重组？当前存档会被覆盖。")) store.getState().newSeason(); });
$("restartBtn").addEventListener("click", () => store.getState().newSeason());
$("continueBtn").addEventListener("click", () => store.getState().continueSeason());
$("activePauseBtn").addEventListener("click", activePause);
$("nextRoundBtn").addEventListener("click", playNextRound);
$("nextWeekBtn").addEventListener("click", () => store.getState().nextWeek());

window.addEventListener("load", () =>
  store.getState().phase === "setup" ? store.getState().startSeason() : null
);
render();
