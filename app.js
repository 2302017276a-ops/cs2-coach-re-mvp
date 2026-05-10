import { createStore } from "https://esm.sh/zustand@5.0.8/vanilla";

const SAVE_KEY = "cs2-coach-season-v4";
const SEASON_WEEKS = 5;
const WIN_SCORE = 13;
const START_BUDGET = 100;

const teamStatDefs = [
  ["资金", "money", "¥"],
  ["士气", "morale", ""],
  ["名气", "fame", ""],
  ["战术熟练度", "tactics", ""],
  ["团队默契", "chemistry", ""],
  ["粉丝支持", "fans", ""],
];

const playerStatDefs = [
  ["枪", "aim"],
  ["脑", "sense"],
  ["心", "mental"],
  ["团", "teamwork"],
  ["商", "market"],
  ["疲", "fatigue"],
];

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
  {
    name: "Vitality",
    note: "稳定、纪律、明星不讲理",
    style: "discipline",
    players: [
      { name: "ZywOo", aim: 98, sense: 96, mental: 92, teamwork: 86, clutch: 96 },
      { name: "flameZ", aim: 82, sense: 80, mental: 84, teamwork: 92, clutch: 72 },
      { name: "apEX", aim: 70, sense: 89, mental: 78, teamwork: 86, clutch: 66 },
      { name: "ropz", aim: 88, sense: 95, mental: 90, teamwork: 80, clutch: 90 },
      { name: "mezii", aim: 78, sense: 82, mental: 80, teamwork: 88, clutch: 70 },
    ],
  },
  {
    name: "FaZe Clan",
    note: "宿命感很重，残局很硬",
    style: "clutch",
    players: [
      { name: "rain", aim: 82, sense: 82, mental: 88, teamwork: 82, clutch: 82 },
      { name: "frozen", aim: 86, sense: 84, mental: 84, teamwork: 88, clutch: 80 },
      { name: "broky", aim: 84, sense: 82, mental: 78, teamwork: 72, clutch: 86 },
      { name: "karrigan", aim: 66, sense: 94, mental: 88, teamwork: 90, clutch: 70 },
      { name: "Twistzz", aim: 88, sense: 78, mental: 78, teamwork: 78, clutch: 80 },
    ],
  },
  {
    name: "Falcons",
    note: "预算像开了控制台",
    style: "star",
    players: [
      { name: "NiKo", aim: 94, sense: 88, mental: 72, teamwork: 72, clutch: 84 },
      { name: "m0NESY", aim: 97, sense: 87, mental: 78, teamwork: 68, clutch: 94 },
      { name: "Magisk", aim: 80, sense: 88, mental: 88, teamwork: 90, clutch: 78 },
      { name: "Snappi", aim: 68, sense: 88, mental: 80, teamwork: 86, clutch: 66 },
      { name: "TeSeS", aim: 81, sense: 80, mental: 80, teamwork: 84, clutch: 74 },
    ],
  },
  {
    name: "Spirit",
    note: "对面也有一个不想等烟散的人",
    style: "speed",
    players: [
      { name: "donk", aim: 99, sense: 80, mental: 68, teamwork: 64, clutch: 82 },
      { name: "sh1ro", aim: 90, sense: 91, mental: 88, teamwork: 76, clutch: 90 },
      { name: "chopper", aim: 72, sense: 88, mental: 82, teamwork: 86, clutch: 66 },
      { name: "zont1x", aim: 82, sense: 78, mental: 76, teamwork: 80, clutch: 72 },
      { name: "magixx", aim: 80, sense: 80, mental: 78, teamwork: 82, clutch: 70 },
    ],
  },
  {
    name: "二线黑马队",
    note: "纸面不强，但最擅长让强队丢人",
    style: "upset",
    players: [
      { name: "Rookie", aim: 80, sense: 76, mental: 84, teamwork: 78, clutch: 88 },
      { name: "Caller", aim: 68, sense: 86, mental: 80, teamwork: 88, clutch: 66 },
      { name: "Anchor", aim: 76, sense: 80, mental: 82, teamwork: 90, clutch: 74 },
      { name: "AWPer", aim: 82, sense: 77, mental: 78, teamwork: 70, clutch: 84 },
      { name: "Lurker", aim: 78, sense: 84, mental: 78, teamwork: 74, clutch: 80 },
    ],
  },
];

const scenarios = [
  { id: "balanced", title: "均势拉扯", text: "两边都不肯先交底牌，比分会像心电图一样上下跳。", bias: 0 },
  { id: "slowCollapse", title: "慢性崩盘", text: "你不会突然爆炸，你会一分一分意识到事情不对。", bias: -4 },
  { id: "upset", title: "被爆冷", text: "纸面优势很大，但论坛最爱看的就是这种局。", bias: -8 },
  { id: "stomp", title: "强队碾压", text: "对手枪硬、纪律好，任何失误都会被放大。", bias: -10 },
  { id: "gambleComeback", title: "赌点翻盘", text: "常规打法赢不了，只有赌点、变速和信息差能把你拖回来。", bias: -5 },
  { id: "rivalry", title: "宿命局", text: "五年前他们还是队友。今天每个补枪都像私人恩怨。", bias: 0 },
];

const weeklyDeck = [
  { id: "discipline", title: "📋 强调纪律", text: "默认控图、补枪、听 IGL。暂停后更容易连续前压同一片区域。", effect: { tactics: 8, chemistry: 3, morale: -2 }, style: { discipline: 8, speed: -2 } },
  { id: "gamble", title: "🎲 放手赌点", text: "训练非常规赌点。可能打穿对手，也可能把自己打成论坛素材。", effect: { fame: 5, tactics: -2, morale: 2 }, style: { gamble: 9, discipline: -3 } },
  { id: "antiStar", title: "🎯 针对对面明星", text: "把资源都压到对方明星位：双架、反清、假信息。", effect: { tactics: 5, chemistry: -1 }, style: { antiStar: 9 } },
  { id: "speed", title: "⚡ 直接提速", text: "不让对手舒服架默认。你们会更像刀，也更像赌徒。", effect: { morale: 4, fans: 3, tactics: -3 }, style: { speed: 9 } },
  { id: "calm", title: "🧯 安抚红温选手", text: "把红温留给准星，不留给语音。关键局心态更稳。", effect: { morale: 8, chemistry: 4, fame: -1 }, style: { calm: 9 } },
  { id: "eco", title: "💸 经济纪律训练", text: "强起和保枪都不丢人，丢人的是不知道为什么买。", effect: { money: 4, tactics: 5, morale: -1 }, style: { economy: 8 } },
  { id: "info", title: "👁 信息差三架位", text: "练三架、反摸和假脚步。对手会明显没警戒默认位置。", effect: { tactics: 7, chemistry: 2 }, style: { info: 8 } },
  { id: "media", title: "📱 直播营业", text: "涨粉、涨名气、涨节奏。输了会被做切片，赢了会被吹成王朝。", effect: { fame: 8, fans: 7, money: 3, morale: -3 }, style: { heat: 6 } },
];

const interventionDeck = [
  { id: "timeout", label: "叫暂停，强调纪律", style: { discipline: 8, calm: 3 }, effect: { tactics: 3, morale: 1 }, text: "暂停之后，队伍连续三回合前压 A 厅。对手明显没警戒默认的位置。" },
  { id: "speed", label: "直接提速，抢节奏", style: { speed: 9 }, effect: { morale: 2, tactics: -1 }, text: "你让队伍把默认撕掉。下一回合，五个人像一把没上保险的刀。" },
  { id: "force", label: "强起，买无甲大狙", style: { economy: -4, gamble: 10 }, effect: { money: -2, fame: 3 }, text: "无甲大狙买出来那一刻，弹幕先笑了。十秒后没人笑了。" },
  { id: "gamble", label: "非常规赌点", style: { gamble: 10, info: 3 }, effect: { tactics: -1, fans: 2 }, text: "你赌了一个没人敢赌的位置。对手搜点路线慢了半秒，半秒就是枪线。" },
  { id: "antiStar", label: "针对对面明星选手", style: { antiStar: 10, discipline: 2 }, effect: { tactics: 2, morale: 1 }, text: "你把两颗闪和一个人都丢给对面明星。不是尊重，是围剿。" },
  { id: "calm", label: "安抚红温选手", style: { calm: 10 }, effect: { morale: 4, chemistry: 3 }, text: "你没有骂 donk，只说：下一枪你来开，但报点要报。语音降温了，准星没降。" },
];

const commentary = {
  open: [
    "好的这一回合先看默认，诶等等，脚步不对啊兄弟们，这味道已经开始不对了。",
    "开局平静分析一下，双方都很谨慎，但这个谨慎里面藏着杀气。",
    "手枪局这种东西，怎么说呢，让人不禁感叹，赢了不算成功，输了才是人生。",
  ],
  win: [
    "卧槽这波真打出来了！穷玩车富玩表，以高打低交叉火力，这就是教练暂停后的含金量！",
    "这不是普通的一分，这是黑暗中的曙光啊兄弟们，硬把局势从棺材里拽出来了。",
    "不得不提啊兄弟们，这个 call 真有东西，虽然看起来像赌，落地以后就是世界级。",
  ],
  lose: [
    "不是，这怎么能输的啊？这个信息都拿到了还能空转，真有点菜就多练的味道了。",
    "完了，慢性崩盘开始了。不是突然死，是一刀一刀被自己放血。",
    "我不喜欢这种警察一直输的比赛，对我的世界观冲击太大了。",
  ],
  clutch: [
    "残局来了，所有人都别眨眼，这种时候不是打游戏，是打心跳。",
    "一打一！他知道人在那儿，但知道和打死中间差了一个 Major。",
    "这枪要是空了，今晚论坛标题我都想好了。",
  ],
  upset: [
    "纸面强有什么用啊兄弟们？CS 最残忍的地方就在这儿，小孩真敢拉。",
    "爆冷味儿出来了，对手越打越像主角，你这边越打越像剪辑素材。",
  ],
};

const nodeTexts = {
  eco: ["经济局", "你们的经济像刚被老板审过，强起和保枪都很难看。"],
  clutch: ["关键残局", "场上只剩两个人，但语音里的重量像十个人。"],
  timeout: ["暂停窗口", "镜头切到教练席，所有人都在等你有没有东西。"],
  morale: ["士气波动", "这一分不只影响比分，也影响谁还愿意相信谁。"],
  gamble: ["赌点", "地图另一侧空得能听见风声，你赌对就是天才，赌错就是素材。"],
  info: ["信息误判", "对手给了一个假脚步，你们像真的听见了命运。"],
  duel: ["明星对位", "对面明星选手开始要球，这回合像单挑，也像审判。"],
];

const $ = (id) => document.getElementById(id);
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function avg(players, keys) {
  return players.reduce((sum, p) => sum + keys.reduce((s, k) => s + (p[k] || 0), 0) / keys.length, 0) / players.length;
}

function createState() {
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
    return raw ? { ...createState(), ...JSON.parse(raw), pendingDecision: null } : createState();
  } catch {
    return createState();
  }
}

const store = createStore((set, get) => ({
  ...loadState(),
  togglePick: (name) =>
    set((s) => {
      const player = marketPlayers.find((p) => p.name === name);
      const selected = s.pickedIds.includes(name);
      if (selected) return { pickedIds: s.pickedIds.filter((id) => id !== name), budget: s.budget + player.price };
      if (s.pickedIds.length >= 5 || s.budget < player.price) return {};
      return { pickedIds: [...s.pickedIds, name], budget: s.budget - player.price };
    }),
  startSeason: () =>
    set((s) => {
      const players = s.pickedIds.map((id) => clone(marketPlayers.find((p) => p.name === id)));
      return {
        phase: "week",
        players,
        weeklyActions: rollWeeklyActions(1),
        logs: [{ week: 1, title: "建队完成", text: `你选下了 ${players.map((p) => p.name).join("、")}。这不是阵容，这是五个会制造舆论的人。` }],
        lastResult: "第 1 周：选择本周方向",
      };
    }),
  newSeason: () => set(createState()),
  clearLog: () => set({ logs: [] }),
  addLog: (title, text) => set((s) => ({ logs: [{ week: s.week, title, text }, ...s.logs].slice(0, 80) })),
  applyTeam: (effect = {}) =>
    set((s) => ({
      team: Object.fromEntries(Object.entries(s.team).map(([k, v]) => [k, k === "money" ? clamp(v + (effect[k] || 0), 0, 999) : clamp(v + (effect[k] || 0))])),
    })),
  startMatch: (action) => set((s) => createMatchState(s, action)),
  appendLine: (line) => set((s) => ({ currentMatch: { ...s.currentMatch, lines: [...s.currentMatch.lines, line] } })),
  setDecision: (decision) => set({ pendingDecision: decision }),
  applyDecision: (option) =>
    set((s) => ({
      pendingDecision: null,
      team: Object.fromEntries(Object.entries(s.team).map(([k, v]) => [k, k === "money" ? clamp(v + (option.effect?.[k] || 0), 0, 999) : clamp(v + (option.effect?.[k] || 0))])),
      currentMatch: {
        ...s.currentMatch,
        coach: mergeStyle(s.currentMatch.coach, option.style),
        lines: [...s.currentMatch.lines, { tone: "event", text: `教练干预：${option.text}` }],
      },
    })),
  updateMatch: (patch) => set((s) => ({ currentMatch: { ...s.currentMatch, ...patch } })),
  finishMatch: (won, opinion, moment) =>
    set((s) => {
      const nextWeek = s.week + 1;
      const seasonEnded = nextWeek > SEASON_WEEKS;
      return {
        phase: seasonEnded ? "ended" : "post",
        wins: s.wins + (won ? 1 : 0),
        losses: s.losses + (won ? 0 : 1),
        lastOpinion: opinion,
        bestMoment: moment || s.bestMoment,
        seasonEnded,
        lastResult: `${won ? "胜利" : "失利"} ${s.currentMatch.us}:${s.currentMatch.them}`,
      };
    }),
  nextWeek: () =>
    set((s) => ({
      phase: "week",
      week: s.week + 1,
      weeklyActions: rollWeeklyActions(s.week + 1),
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

function rollWeeklyActions(week) {
  return shuffle(weeklyDeck).slice(0, 3).map((a) => ({ ...a, title: week === 5 && a.id === "gamble" ? "🏆 决赛赌点剧本" : a.title }));
}

function mergeStyle(base = {}, add = {}) {
  const next = { ...base };
  for (const [k, v] of Object.entries(add)) next[k] = (next[k] || 0) + v;
  return next;
}

function createMatchState(s, action) {
  const opponent = s.week === 5 ? opponents[0] : pick(opponents);
  const scenario = s.week === 5 ? scenarios.find((x) => x.id === "rivalry") : pick(scenarios);
  const coach = { ...action.style };
  const match = {
    opponent,
    scenario,
    map: pick(["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust2"]),
    round: 0,
    us: 0,
    them: 0,
    economyUs: 50,
    economyThem: 50,
    coach,
    usedDecisionRounds: [],
    lines: [
      {
        tone: "event",
        text: `局势：${scenario.title}。${scenario.text} 对手是 ${opponent.name}：${opponent.note}。本周你选择了「${action.title}」。`,
      },
    ],
  };
  const team = Object.fromEntries(Object.entries(s.team).map(([k, v]) => [k, k === "money" ? clamp(v + (action.effect[k] || 0), 0, 999) : clamp(v + (action.effect[k] || 0))]));
  return { phase: "match", team, currentMatch: match, lastResult: `${opponent.name} · ${scenario.title}` };
}

function teamPower(state) {
  const p = avg(state.players, ["aim", "sense", "mental", "teamwork", "clutch"]);
  return p * 0.62 + state.team.morale * 0.12 + state.team.tactics * 0.13 + state.team.chemistry * 0.1 + state.team.fans * 0.03;
}

function opponentPower(match) {
  return avg(match.opponent.players, ["aim", "sense", "mental", "teamwork", "clutch"]);
}

function tacticBonus(node, coach, match) {
  let b = 0;
  if (node === "eco") b += (coach.economy || 0) - 2;
  if (node === "gamble") b += (coach.gamble || 0) - (match.opponent.style === "discipline" ? 3 : 0);
  if (node === "info") b += (coach.info || 0) + (coach.discipline || 0) * 0.35;
  if (node === "duel") b += (coach.antiStar || 0) - (match.opponent.style === "star" ? 4 : 0);
  if (node === "morale") b += (coach.calm || 0);
  if (node === "timeout") b += (coach.discipline || 0) + (coach.calm || 0) * 0.4;
  if (coach.speed && match.opponent.style !== "speed") b += node === "info" ? -2 : coach.speed * 0.45;
  return b;
}

function nodeForRound(match) {
  if (match.round === 0) return "timeout";
  if (Math.max(match.us, match.them) >= 11) return "clutch";
  if (match.economyUs < 35 || match.economyThem < 35) return "eco";
  if (Math.abs(match.us - match.them) >= 5) return match.us < match.them ? "morale" : "info";
  return pick(["duel", "gamble", "info", "eco", "morale"]);
}

function winProbability(state, node) {
  const match = state.currentMatch;
  const baseDiff = teamPower(state) - opponentPower(match);
  const economy = (match.economyUs - match.economyThem) * 0.12;
  const scenario = match.scenario.bias;
  const tactic = tacticBonus(node, match.coach, match);
  const pressure = Math.max(match.us, match.them) >= 10 ? (state.team.morale - 50) * 0.1 + avg(state.players, ["clutch"]) * 0.04 - 3 : 0;
  const raw = 50 + baseDiff * 0.75 + economy + scenario + tactic + pressure;
  return clamp(raw, 8, 92);
}

function playNextRound() {
  const state = store.getState();
  const match = state.currentMatch;
  if (!match || state.pendingDecision || state.phase !== "match") return;

  if (shouldAskDecision(match)) {
    store.getState().setDecision(makeDecision(match));
    return;
  }

  const node = nodeForRound(match);
  const prob = winProbability(state, node);
  const roll = Math.random() * 100;
  const won = roll < prob;
  const us = match.us + (won ? 1 : 0);
  const them = match.them + (won ? 0 : 1);
  const economyUs = clamp(match.economyUs + (won ? 12 : -14) + (node === "eco" ? 8 : 0));
  const economyThem = clamp(match.economyThem + (won ? -12 : 12));
  const round = match.round + 1;
  const line = makeRoundLine(state, { node, prob, won, us, them, round });

  store.getState().appendLine(line);
  store.getState().updateMatch({ round, us, them, economyUs, economyThem });

  if (us >= WIN_SCORE || them >= WIN_SCORE) {
    const fresh = { ...store.getState(), currentMatch: { ...store.getState().currentMatch, us, them } };
    const opinion = makeOpinion(fresh, us > them);
    const moment = makeMoment(fresh, us > them);
    store.getState().addLog(us > them ? "比赛胜利" : "比赛失利", `${us}:${them}。${moment}`);
    store.getState().finishMatch(us > them, opinion, moment);
  }
}

function shouldAskDecision(match) {
  if (match.usedDecisionRounds.includes(match.round)) return false;
  if (match.round === 4 || match.round === 8) return true;
  if (match.them - match.us >= 3 && match.round > 3) return true;
  if (Math.max(match.us, match.them) === 11) return true;
  return false;
}

function makeDecision(match) {
  const options = shuffle(interventionDeck).slice(0, 3);
  const prompt =
    match.them - match.us >= 3
      ? "局势开始不对。你现在的干预会改变比赛风格，而不是只改一点数值。"
      : Math.max(match.us, match.them) >= 10
        ? "赛点边缘。你要相信纪律，还是相信一个能被剪成短视频的赌点？"
        : "教练暂停窗口。你要把比赛往哪个方向拽？";
  return { prompt, options, at: match.round };
}

function makeRoundLine(state, ctx) {
  const [nodeTitle, nodeText] = nodeTexts[ctx.node];
  const player = pickWeighted(state.players, ctx.won);
  const oppStar = strongest(state.currentMatch.opponent.players);
  const action = ctx.won ? winAction(player, ctx.node) : loseAction(player, oppStar, ctx.node);
  const cast = castLine(ctx, player);
  return {
    tone: ctx.won ? "good" : "bad",
    text: `<small>R${ctx.round}｜${ctx.us}:${ctx.them}｜${nodeTitle}｜参考胜率 ${ctx.prob.toFixed(2)}%</small>${nodeText}<br>${action}<br><br>解说台：${cast}`,
  };
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

function strongest(players) {
  return [...players].sort((a, b) => b.aim + b.clutch - (a.aim + a.clutch))[0];
}

function winAction(p, node) {
  const map = {
    eco: `${p.name} 用一把捡来的枪打出双杀，经济局硬是被翻成了论坛标题。`,
    clutch: `${p.name} 残局没有急，等到对手转身才开枪。那一秒，像所有训练都没白练。`,
    timeout: `暂停后队伍真的变了，${p.name} 第一个前压，把对手默认位置打穿。`,
    morale: `${p.name} 把一个不该赢的回合拖回来了，语音里第一次有人笑出声。`,
    gamble: `你的赌点生效了，${p.name} 蹲在非常规位，像蹲到了对手的剧本。`,
    info: `信息差三架位打成了，${p.name} 没看到人，但看到了对手的意图。`,
    duel: `${p.name} 对上对面明星没有退，第一枪准得像提前知道论坛会吵。`,
  };
  return map[node];
}

function loseAction(p, star, node) {
  const map = {
    eco: `${p.name} 这把强起没有声音，钱没了，回合也没了。`,
    clutch: `${p.name} 最后一枪空了，对面 ${star.name} 没给第二次机会。`,
    timeout: `暂停刚结束就白给，战术板还热着，比分已经凉了。`,
    morale: `${p.name} 没补上那枪，语音突然安静。不是没人说话，是没人敢先说。`,
    gamble: `你赌点赌错了。地图另一侧像开了门，对手排队进包点。`,
    info: `假脚步骗到了你们，五个人转身那一刻，真正的进攻已经进点。`,
    duel: `对面 ${star.name} 开始收割，你的针对像写在纸上的勇敢。`,
  };
  return map[node];
}

function castLine(ctx, player) {
  if (ctx.won && ctx.node === "clutch") return pick(commentary.clutch) + ` ${player.name} 这波真是秦王绕柱，以高打低。`;
  if (!ctx.won && ctx.node === "eco") return "不是，这经济局怎么能这样送的啊？再别说了，真的再别说了。";
  if (ctx.won && ctx.prob < 35) return "卧槽真的假的？参考胜率这么低都能翻，黑暗中的曙光啊兄弟们！";
  if (!ctx.won && ctx.prob > 68) return "这都能输？这对世界观冲击太大了，菜就多练好吧。";
  if (ctx.won) return pick(commentary.win);
  return pick(commentary.lose);
}

function makeOpinion(state, won) {
  const match = state.currentMatch;
  const headline = won
    ? pick(["这暂停值一个 Major 冠军。", "教练今天真有东西，三次干预全打到点上。", "从赌点到绝杀，这队终于像个队了。"])
    : pick(["这教练是不是不会 CALL？", "暂停叫了，但像叫给观众看的。", "这不是输比赛，这是把粉丝世界观打碎了。"]);
  const rivalry = match.scenario.id === "rivalry" ? "五年前他们还是队友，今天每一枪都像在清算旧账。" : "";
  const ratings = state.players.map((p) => ({
    name: p.name,
    score: clamp((won ? 7.2 : 5.4) + (p.clutch - 70) / 20 + Math.random() * 1.8, 1, 10).toFixed(1),
  }));
  return { headline, body: `${match.opponent.name} ${match.map}，最终 ${match.us}:${match.them}。${rivalry} 论坛争论点：参考胜率到底有没有用，为什么低胜率回合反而最像名场面。`, ratings };
}

function makeMoment(state, won) {
  const match = state.currentMatch;
  if (match.scenario.id === "rivalry") return won ? "那个宿命局：五年前的队友，今天被你的暂停拆开了" : "那个宿命局：旧队友情分没救回最后一分";
  if (won && match.them >= 11) return "那次绝杀：参考胜率 30% 的回合，被你赌成了封面";
  if (won && match.them - match.us <= -5) return "那次碾压：对手从第五回合开始就不像能赢";
  if (!won && match.us >= 11) return "那次崩盘：离 13 分只差一口气，最后全队都不敢呼吸";
  if (won && match.scenario.id === "upset") return "那次反爆冷：论坛准备好标题，你把标题撕了";
  return won ? "那次翻盘：不是数值赢了，是暂停真的改了走势" : "那次被爆冷：强队的纸面优势被一回合一回合拆掉";
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
  $("market").innerHTML = marketPlayers
    .map((p) => {
      const selected = s.pickedIds.includes(p.name);
      const disabled = !selected && (s.pickedIds.length >= 5 || s.budget < p.price);
      return `<button class="player-card ${selected ? "selected" : ""}" ${disabled ? "disabled" : ""} data-pick="${p.name}" type="button">
        <h3><span>${p.name}</span><span>¥${p.price}</span></h3>
        <p>${p.role} · ${p.tag} · ${p.voice}</p>
        <div class="mini">${playerStatDefs.map(([l, k]) => `<span>${l}${p[k]}</span>`).join("")}</div>
      </button>`;
    })
    .join("");
  document.querySelectorAll("[data-pick]").forEach((btn) => btn.addEventListener("click", () => store.getState().togglePick(btn.dataset.pick)));
}

function renderTeam(s) {
  $("seasonLine").textContent = `第 ${s.week} 周 / ${SEASON_WEEKS} 周`;
  $("recordLine").textContent = `${s.wins}W-${s.losses}L`;
  $("lastResult").textContent = s.lastResult;
  $("weekTitle").textContent = s.phase === "match" ? "点击推进每个回合" : s.phase === "post" ? "赛后舆论" : s.phase === "ended" ? "赛季结束" : "选择本周行动";
  $("phaseLabel").textContent = s.phase === "match" ? "文字直播" : "每周局势";
  $("teamStats").innerHTML = teamStatDefs
    .map(([label, key, prefix]) => `<div class="stat-row"><div class="stat-top"><span>${label}</span><b>${prefix}${s.team[key]}</b></div><div class="bar"><span style="width:${Math.min(100, s.team[key])}%"></span></div></div>`)
    .join("");
  $("roster").innerHTML = s.players
    .map((p) => `<div class="player"><strong><span>${p.name}</span><span>${p.role}</span></strong><p>${p.tag} · ${p.voice}</p><div class="mini">${playerStatDefs.map(([l, k]) => `<span>${l}${p[k]}</span>`).join("")}</div></div>`)
    .join("");
}

function renderActions(s) {
  $("actions").classList.toggle("hidden", s.phase !== "week");
  $("actions").innerHTML = s.weeklyActions
    .map((a) => `<button class="action-card" data-action="${a.id}" type="button"><h3>${a.title}</h3><p>${a.text}</p><span class="tag">本周风格会变化</span></button>`)
    .join("");
  document.querySelectorAll("[data-action]").forEach((btn) => btn.addEventListener("click", () => store.getState().startMatch(s.weeklyActions.find((a) => a.id === btn.dataset.action))));
}

function renderDecision(s) {
  $("decisionBox").classList.toggle("hidden", !s.pendingDecision);
  if (!s.pendingDecision) return;
  $("decisionText").textContent = s.pendingDecision.prompt;
  $("decisionOptions").innerHTML = s.pendingDecision.options
    .map((o, i) => `<button class="decision-option" data-decision="${i}" type="button">${o.label}</button>`)
    .join("");
  document.querySelectorAll("[data-decision]").forEach((btn) => btn.addEventListener("click", () => store.getState().applyDecision(s.pendingDecision.options[Number(btn.dataset.decision)])));
}

function renderMatch(s) {
  const m = s.currentMatch;
  $("matchCard").classList.toggle("hidden", s.phase !== "match" || !m);
  if (!m) return;
  $("matchName").textContent = `${m.map} vs ${m.opponent.name}`;
  $("matchScore").textContent = `${m.us} : ${m.them}`;
  $("matchMeta").innerHTML = [`局势 ${m.scenario.title}`, `对手风格 ${m.opponent.style}`, `我方经济 ${m.economyUs}`, `对方经济 ${m.economyThem}`].map((x) => `<span class="tag">${x}</span>`).join("");
  $("matchFeed").innerHTML = m.lines.map((line) => `<div class="round-line ${line.tone === "bad" ? "bad" : line.tone === "event" ? "event" : ""}">${line.text}</div>`).join("");
  $("matchFeed").scrollTop = $("matchFeed").scrollHeight;
}

function renderOpinion(s) {
  $("opinionBox").classList.toggle("hidden", s.phase !== "post");
  if (!s.lastOpinion) return;
  $("forumCard").innerHTML = `<h3>虎扑 CS2｜${s.lastOpinion.headline}</h3><p>${s.lastOpinion.body}</p><div class="rating-grid">${s.lastOpinion.ratings
    .map((r) => `<div class="rating"><span>${r.name}</span><strong>${r.score}</strong></div>`)
    .join("")}</div>`;
}

function renderEnd(s) {
  $("seasonEnd").classList.toggle("hidden", s.phase !== "ended");
  if (s.phase !== "ended") return;
  $("endingTitle").textContent = s.wins >= 4 ? "那个被记住的赛季" : s.wins >= 2 ? "有名场面的危险项目" : "流量很高的事故现场";
  $("endingBody").textContent = `5 周结束，战绩 ${s.wins}W-${s.losses}L。你留下的不是经营数值，而是：${s.bestMoment}`;
  $("records").innerHTML = [
    ["最终战绩", `${s.wins}W-${s.losses}L`],
    ["赛季记忆", s.bestMoment],
    ["最终名气", s.team.fame],
    ["粉丝支持", s.team.fans],
    ["战术熟练度", s.team.tactics],
    ["团队默契", s.team.chemistry],
  ]
    .map(([a, b]) => `<div class="record"><span>${a}</span><strong>${b}</strong></div>`)
    .join("");
}

function renderLog(s) {
  $("log").innerHTML = s.logs.map((l) => `<article class="log-item"><strong>W${l.week} · ${l.title}</strong><p>${l.text}</p></article>`).join("");
}

$("startSeasonBtn").addEventListener("click", () => store.getState().startSeason());
$("newSeasonBtn").addEventListener("click", () => {
  if (confirm("确定重开？当前存档会被覆盖。")) store.getState().newSeason();
});
$("restartBtn").addEventListener("click", () => store.getState().newSeason());
$("clearLogBtn").addEventListener("click", () => store.getState().clearLog());
$("nextRoundBtn").addEventListener("click", playNextRound);
$("nextWeekBtn").addEventListener("click", () => store.getState().nextWeek());

render();
