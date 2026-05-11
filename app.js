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

const SAVE_KEY = "cs2-coach-season-v8-major-ui";
const WIN_SCORE = 13;
const SEASON_WEEKS = 5;
const START_BUDGET = 128;
const MIN_AVG_RATING = 74;
const MIN_BALANCE_SCORE = 62;
const $ = (id) => document.getElementById(id);
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const clone = (v) => JSON.parse(JSON.stringify(v));

const statTooltips = {
  morale: "影响连败抗压、暂停收益、关键局发挥、红温概率和低胜率回合的翻盘概率。",
  tactics: "影响默认成功率、转点质量、假打收益、道具协同，以及对手读懂你的速度。",
  chemistry: "影响补枪、trade、双人配合、残局稳定性，以及阵容结构是否完整。",
};

const teamStatDefs = [
  ["士气", "morale"],
  ["战术执行", "tactics"],
  ["团队默契", "chemistry"],
];

const playerStatDefs = [
  ["枪法", "aim"],
  ["意识", "sense"],
  ["心态", "mental"],
  ["团队", "teamwork"],
  ["残局", "clutch"],
];

const roleOrder = ["突破", "步枪", "狙击", "自由人", "辅助", "IGL"];
const weaponByRole = {
  突破: ["AK-47", "Galil", "MAC-10"],
  步枪: ["AK-47", "M4A4", "M4A1-S"],
  狙击: ["AWP", "SSG 08"],
  自由人: ["AK-47", "M4A1-S", "MP9"],
  辅助: ["M4A1-S", "FAMAS", "MP9"],
  IGL: ["M4A4", "AK-47", "UMP-45"],
};

const hltvSilhouette = "https://www.hltv.org/img/static/player/player_silhouette.png";
const hltvIds = {
  ZywOo: "11893/zywoo",
  donk: "21167/donk",
  ropz: "8248/ropz",
  m0NESY: "19230/m0nesy",
  sh1ro: "16920/sh1ro",
  NiKo: "3741/niko",
  "910": "20101/910",
  s1mple: "7998/s1mple",
  device: "7592/device",
  Twistzz: "10394/twistzz",
};

const rawPlayers = [
  ["ZywOo", "步枪", 40, "全能核心", "六边形战士", 98, 96, 94, 88, 98, 22],
  ["donk", "突破", 37, "枪法天花板", "开局撕口子", 100, 84, 78, 76, 92, 58],
  ["ropz", "自由人", 34, "自由人教科书", "残局冷处理", 92, 98, 91, 92, 90, 19],
  ["m0NESY", "狙击", 36, "狙击艺术家", "年轻但不手软", 98, 91, 84, 76, 93, 38],
  ["sh1ro", "狙击", 28, "保守狙神", "稳定提款机", 86, 93, 92, 83, 91, 22],
  ["molodoy", "辅助", 22, "体系绿叶", "愿意做脏活", 80, 82, 82, 92, 80, 27],
  ["flameZ", "辅助", 22, "牺牲拼图", "补枪很干净", 78, 82, 82, 96, 80, 24],
  ["frozen", "步枪", 25, "稳定器", "很少犯大错", 84, 84, 82, 90, 82, 27],
  ["KSCERATO", "步枪", 25, "巴西一哥", "残局有重量", 86, 86, 85, 84, 88, 30],
  ["Spinx", "步枪", 24, "以色列核心", "中后段收割", 85, 85, 82, 82, 84, 30],
  ["Twistzz", "步枪", 23, "北美枪男", "爆头线漂亮", 86, 78, 78, 82, 79, 38],
  ["mezii", "辅助", 18, "团队粘合剂", "愿意补洞", 74, 82, 84, 92, 78, 27],
  ["Senzu", "步枪", 18, "亚洲核心", "上限很亮", 82, 76, 80, 78, 78, 30],
  ["XANTARES", "突破", 21, "土耳其 aim 神", "对枪自信", 92, 72, 72, 66, 72, 44],
  ["YEKINDAR", "突破", 22, "狂哥", "节奏很硬", 90, 74, 73, 73, 72, 41],
  ["xertioN", "突破", 19, "冷静突破", "能打也能等", 80, 82, 82, 88, 80, 27],
  ["torzsi", "狙击", 18, "体系狙", "吃资源但稳", 78, 82, 76, 80, 76, 38],
  ["NiKo", "步枪", 30, "Major 魔咒", "一枪一个故事", 93, 86, 62, 74, 82, 57],
  ["iM", "辅助", 18, "逆境爆发", "愿意撞墙", 76, 78, 82, 88, 78, 27],
  ["b1t", "步枪", 24, "冠军拼图", "补枪很准", 84, 84, 84, 90, 82, 27],
  ["HeavyGod", "步枪", 18, "高光低谷", "需要被接住", 82, 74, 72, 74, 72, 41],
  ["kyousuke", "步枪", 17, "未来可期", "还没被写完", 82, 72, 74, 72, 72, 41],
  ["w0nderful", "狙击", 20, "稳定成长", "不贪枪", 82, 84, 78, 82, 78, 38],
  ["Wicadia", "步枪", 16, "土耳其枪手", "敢打敢输", 80, 72, 72, 72, 70, 41],
  ["yuurih", "步枪", 18, "南美核心", "能补也能收", 80, 76, 76, 82, 74, 38],
  ["Makazze", "辅助", 14, "国际纵队新血", "便宜但懂配合", 72, 72, 80, 82, 74, 30],
  ["910", "狙击", 16, "蒙古狙击手", "有镜头感", 80, 72, 72, 72, 72, 41],
  ["MATYS", "步枪", 16, "年轻步枪手", "有冲劲", 80, 72, 72, 72, 70, 41],
  ["tN1R", "步枪", 16, "Spirit 新血", "敢补枪", 80, 72, 72, 74, 72, 41],
  ["latto", "辅助", 14, "南美绿叶", "不抢镜头", 72, 72, 80, 82, 74, 30],
  ["s1mple", "狙击", 34, "CS:GO GOAT", "情绪也是武器", 98, 91, 76, 68, 86, 44],
  ["device", "狙击", 28, "丹麦传奇", "像钟一样准", 86, 92, 86, 84, 86, 30],
  ["huNter-", "步枪", 22, "巴尔干核心", "经验很厚", 82, 82, 76, 82, 78, 38],
  ["broky", "狙击", 22, "松弛狙击", "敢在残局等", 82, 82, 76, 80, 78, 38],
  ["rain", "突破", 23, "十年忠诚", "大赛不怯", 82, 78, 84, 90, 82, 27],
  ["Magisk", "步枪", 24, "冠军拼图", "纪律性强", 82, 84, 84, 90, 82, 27],
  ["cadiaN", "IGL", 24, "争议领袖", "会把声音拉满", 72, 92, 76, 86, 80, 38],
  ["jks", "自由人", 23, "冷面杀手", "不说废话", 82, 84, 84, 90, 82, 27],
  ["Jimpphat", "步枪", 18, "18岁冠军脸", "很稳", 80, 76, 82, 82, 78, 30],
  ["EliGE", "步枪", 23, "北美荣光", "压枪很硬", 84, 76, 82, 88, 80, 27],
];

function eliteTax(price) {
  if (price >= 36) return 8 + (price - 36) * 3;
  if (price >= 30) return 4 + (price - 30) * 1.5;
  return 0;
}

const marketPlayers = rawPlayers.map(([name, role, price, tag, voice, aim, sense, mental, teamwork, clutch, tilt]) => {
  const rating = Math.round((aim + sense + mental + teamwork + clutch) / 5);
  return {
    name,
    role,
    basePrice: price,
    price: Math.round(price + eliteTax(price)),
    tag,
    voice,
    aim,
    sense,
    mental,
    teamwork,
    clutch,
    tilt,
    fatigue: 18,
    rating,
    photo: hltvSilhouette,
    hltv: `https://www.hltv.org/player/${hltvIds[name] || ""}`,
  };
});

const opponents = [
  { name: "Vitality", style: "纪律队", note: "稳定、纪律、明星不讲理", power: 88, star: "ZywOo", patterns: ["默认控图", "A区夹击", "慢速转点"], adaptSpeed: 3, tells: ["apEX开始反复叫暂停前压", "中路默认更慢", "ZywOo开始要第一身位"] },
  { name: "FaZe Clan", style: "慢打队", note: "宿命感很重，残局很硬", power: 84, star: "ropz", patterns: ["慢控两翼", "中期爆弹", "残局拉扯"], adaptSpeed: 4, tells: ["ropz开始单摸断后", "雨神前顶拿信息", "默认时间被压到最后二十秒"] },
  { name: "Falcons", style: "明星单核队", note: "资源向明星倾斜", power: 86, star: "NiKo", patterns: ["明星开路", "双人补枪", "强起找枪"], adaptSpeed: 3, tells: ["NiKo连续要第一枪位", "对手开始避开你的强点", "中路烟后有人反架"] },
  { name: "Spirit", style: "激进队", note: "对面也有一个不想等烟散的人", power: 85, star: "donk", patterns: ["开局前压", "反清边路", "快提包点"], adaptSpeed: 3, tells: ["donk的出生点开始被保护", "对手连续反清同一片区域", "节奏突然变慢"] },
  { name: "MOUZ", style: "体系队", note: "纸面不夸张，但很会让强队难受", power: 82, star: "xertioN", patterns: ["三人控图", "假打转点", "残局双架"], adaptSpeed: 4, tells: ["两颗闪光总在同一秒爆", "默认站位开始针对你的补防", "包点不再轻易露单人"] },
  { name: "G2", style: "心理战队", note: "暂停很慢，假动作很多", power: 84, star: "m0NESY", patterns: ["假打", "中路提速", "狙击找首杀"], adaptSpeed: 3, tells: ["m0NESY开始主动找镜头", "对手突然不交第一套道具", "回合前半段声音变少"] },
];

const weeklyDeck = [
  { id: "discipline", title: "强调纪律", text: "默认控图、补枪、听 IGL。暂停后更容易连续执行同一套结构。", effect: { tactics: 8, chemistry: 3, morale: -2 }, style: { discipline: 8 } },
  { id: "gamble", title: "放手赌点", text: "训练非常规站位。打穿对手，或者变成论坛素材。", effect: { tactics: -2, morale: 2 }, style: { gamble: 9 } },
  { id: "antiStar", title: "针对明星", text: "双架、反清、假信息，全部往对面明星脸上招呼。", effect: { tactics: 5, chemistry: -1 }, style: { antiStar: 9 } },
  { id: "speed", title: "直接提速", text: "不让对手舒服架默认。你们会更像刀，也更像赌徒。", effect: { morale: 4, tactics: -3 }, style: { speed: 9 } },
  { id: "calm", title: "安抚红温", text: "把红温留给准星，不留给语音。关键局心态更稳。", effect: { morale: 8, chemistry: 4 }, style: { calm: 9 } },
  { id: "info", title: "信息差三架位", text: "练三架、反摸和假脚步。对手会开始怀疑默认位置。", effect: { tactics: 7, chemistry: 2 }, style: { info: 8 } },
];

const baseInterventions = [
  { label: "叫暂停，强调纪律", style: { discipline: 8, calm: 2 }, effect: { tactics: 3, morale: 1 }, risk: "如果下一回合输，士气额外 -5。", backfire: { morale: -5 }, text: "暂停后，队伍连续三次补枪到位。对手第一次没有读到你的默认。" },
  { label: "直接提速", style: { speed: 9 }, effect: { morale: 2, tactics: -1 }, risk: "如果被接住，战术执行 -4。", backfire: { tactics: -4 }, text: "你让队伍把默认撕掉。下一回合，五个人像一把没上保险的刀。" },
  { label: "强起，资源给明星", style: { gamble: 8 }, effect: { morale: 1, chemistry: -4 }, risk: "如果失败，团队默契 -5，经济继续崩。", backfire: { chemistry: -5 }, text: "战术板合上，资源集中到第一枪位。队友都知道这一回合是在赌人。" },
  { label: "非常规赌点", style: { gamble: 10, info: 3 }, effect: { tactics: -1, morale: 2 }, risk: "如果赌错，士气 -4，对手适应 +1。", backfire: { morale: -4 }, text: "你赌了一个没人敢赌的位置。对手搜点慢了半秒，半秒就是枪线。" },
  { label: "针对对面明星", style: { antiStar: 10, discipline: 2 }, effect: { tactics: 2, morale: 1 }, risk: "如果明星仍然拿首杀，士气 -6。", backfire: { morale: -6 }, text: "两颗闪和一个人都丢给对面明星。围剿开始了。" },
  { label: "安抚红温选手", style: { calm: 10 }, effect: { morale: 4, chemistry: 3 }, risk: "如果下一回合仍然白给，暂停收益减半。", backfire: { morale: -3 }, text: "你没有骂 {hot}，只说：下一枪你来开，但报点要报。语音降温了，准星没降。" },
];

const scriptProfiles = {
  "开局暴打": { phases: [{ rounds: [1, 5], bias: 8, nodes: ["duel", "info"] }, { rounds: [6, 10], bias: 0, nodes: ["eco", "morale"] }, { rounds: [11, 24], bias: -4, nodes: ["clutch", "duel"] }], decisionRounds: [3, 7, 11] },
  "被碾压": { phases: [{ rounds: [1, 8], bias: -12, nodes: ["eco", "morale"] }, { rounds: [9, 12], bias: -3, nodes: ["info", "duel"] }, { rounds: [13, 24], bias: 4, nodes: ["clutch", "gamble"] }], decisionRounds: [2, 5, 9] },
  "经济崩盘": { phases: [{ rounds: [1, 6], bias: -6, nodes: ["eco"] }, { rounds: [7, 12], bias: -2, nodes: ["info", "eco"] }, { rounds: [13, 24], bias: 2, nodes: ["clutch", "morale"] }], decisionRounds: [3, 6, 10] },
  "加时鏖战": { phases: [{ rounds: [1, 8], bias: 0, nodes: ["duel", "info"] }, { rounds: [9, 16], bias: 0, nodes: ["eco", "morale"] }, { rounds: [17, 24], bias: 0, nodes: ["clutch"] }], decisionRounds: [4, 8, 12] },
  "赌点翻盘": { phases: [{ rounds: [1, 7], bias: -5, nodes: ["morale", "eco"] }, { rounds: [8, 13], bias: 3, nodes: ["gamble", "info"] }, { rounds: [14, 24], bias: 5, nodes: ["clutch", "gamble"] }], decisionRounds: [4, 8, 11] },
  "宿命局": { phases: [{ rounds: [1, 24], bias: 0, nodes: ["duel", "clutch", "info", "morale"] }], decisionRounds: [3, 8, 12] },
};

const nodes = {
  eco: ["经济局", "对手下回合大概率全甲步枪。"],
  clutch: ["关键残局", "语音里的重量像十个人。"],
  timeout: ["暂停窗口", "镜头切到教练席，所有人都在等你。"],
  morale: ["士气波动", "这一分会影响谁还愿意相信谁。"],
  gamble: ["赌点", "另一侧空得能听见风声。"],
  info: ["信息误判", "对手给了假脚步，你要判断是不是真信息。"],
  duel: ["明星对位", "对面明星开始要球，这回合像单挑。"],
};

function createInitialState() {
  return {
    phase: "setup",
    budget: START_BUDGET,
    pickedIds: [],
    week: 1,
    team: { morale: 55, tactics: 50, chemistry: 50 },
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
    const players = s.pickedIds.map((id) => ({ ...clone(marketPlayers.find((p) => p.name === id)), history: emptyHistory() }));
    if (!canStartRoster(players).ok) return {};
    return {
      phase: "week",
      players,
      weeklyActions: rollWeeklyActions(),
      logs: [{ week: 1, title: "建队完成", text: `你选下了 ${players.map((p) => p.name).join("、")}。这不是一神带四坑，而是一套能执行暂停的结构。` }],
      lastResult: "第 1 周：选择本周方向",
    };
  }),
  newSeason: () => set(createInitialState()),
  continueSeason: () => set((s) => ({
    phase: "week",
    week: 1,
    team: applyTeamEffect(s.team, { morale: 8, chemistry: 8, tactics: 4 }),
    players: s.players.map((p) => ({ ...p, fatigue: clamp(p.fatigue - 10), teamwork: clamp(p.teamwork + 2) })),
    weeklyActions: rollWeeklyActions(),
    currentMatch: null,
    pendingDecision: null,
    lastOpinion: null,
    logs: [{ week: 1, title: "继续磨合", text: "你没有拆队。队员理解这是信任，也知道下一次崩盘要自己扛。" }, ...s.logs].slice(0, 80),
    wins: 0,
    losses: 0,
    seasonEnded: false,
    lastResult: "新 5 周：继续磨合",
  })),
  addLog: (title, text) => set((s) => ({ logs: [{ week: s.week, title, text }, ...s.logs].slice(0, 80) })),
  startMatch: (action) => set((s) => startMatchState(s, action)),
  appendLine: (line) => set((s) => ({ currentMatch: { ...s.currentMatch, lines: [...s.currentMatch.lines, line] } })),
  updateMatch: (patch) => set((s) => ({ currentMatch: { ...s.currentMatch, ...patch } })),
  updateTeam: (team) => set({ team }),
  setDecision: (decision) => set({ pendingDecision: decision }),
  applyDecision: (option) => set((s) => applyDecisionState(s, option)),
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

function emptyHistory() {
  return { clutchWins: 0, clutchLosses: 0, hotStreaks: 0, tiltMoments: 0, kills: 0, deaths: 0 };
}

function rollWeeklyActions() {
  return shuffle(weeklyDeck).slice(0, 3);
}

function applyTeamEffect(team, effect) {
  return Object.fromEntries(Object.entries(team).map(([k, v]) => [k, clamp(v + (effect[k] || 0))]));
}

function mergeStyle(base = {}, add = {}) {
  const next = { ...base };
  Object.entries(add).forEach(([k, v]) => (next[k] = (next[k] || 0) + v));
  return next;
}

function avg(players, keys) {
  if (!players.length) return 0;
  return players.reduce((sum, p) => sum + keys.reduce((s, k) => s + (p[k] || 0), 0) / keys.length, 0) / players.length;
}

function rosterRating(players) {
  return Math.round(avg(players, ["aim", "sense", "mental", "teamwork", "clutch"]));
}

function balanceScore(players) {
  if (!players.length) return 0;
  const roles = new Set(players.map((p) => p.role));
  const hasIglOrSupport = players.some((p) => ["IGL", "辅助"].includes(p.role));
  const hasAwper = players.some((p) => p.role === "狙击");
  const hasEntry = players.some((p) => p.role === "突破");
  const lowFloorPenalty = Math.max(0, 72 - Math.min(...players.map((p) => p.rating))) * 2;
  return clamp(roles.size * 16 + (hasIglOrSupport ? 18 : 0) + (hasAwper ? 14 : 0) + (hasEntry ? 12 : 0) - lowFloorPenalty);
}

function canStartRoster(players) {
  if (players.length !== 5) return { ok: false, reason: "需要选满 5 人" };
  const rating = rosterRating(players);
  const balance = balanceScore(players);
  const lowCount = players.filter((p) => p.rating < MIN_AVG_RATING).length;
  if (rating < MIN_AVG_RATING) return { ok: false, reason: `最低平均 rating ${MIN_AVG_RATING}，当前 ${rating}` };
  if (lowCount > 2) return { ok: false, reason: `低于 ${MIN_AVG_RATING} rating 的选手最多 2 人，当前 ${lowCount} 人` };
  if (balance < MIN_BALANCE_SCORE) return { ok: false, reason: `阵容结构不足，当前平衡 ${balance}` };
  return { ok: true, reason: "结构完整，可以开赛" };
}

function startMatchState(s, action) {
  const opponent = s.week === 5 ? opponents[0] : pick(opponents);
  const script = s.week === 5 ? "宿命局" : pick(Object.keys(scriptProfiles));
  return {
    phase: "match",
    team: applyTeamEffect(s.team, action.effect),
    currentMatch: {
      opponent,
      script,
      map: pick(["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust2"]),
      round: 0,
      us: 0,
      them: 0,
      economyUs: 50,
      economyThem: 50,
      coach: { ...action.style },
      timeouts: 3,
      adjustCount: 0,
      usedDecisionRounds: [],
      pendingConsequences: [],
      opponentState: { pattern: 0, adaptedTo: [], roundsSinceAdapt: 0, recent: [] },
      playerState: initPlayerState(s.players),
      lines: [{ tone: "event", text: `赛事导播切入 ${opponent.name}。本图 ${script}，本周方向是「${action.title}」。` }],
    },
    lastResult: `${opponent.name} / ${script}`,
  };
}

function initPlayerState(players) {
  return players.map((p, index) => ({
    name: p.name,
    role: p.role,
    side: index % 2 === 0 ? "CT" : "T",
    hp: 100,
    alive: true,
    weapon: pick(weaponByRole[p.role] || ["AK-47", "M4A1-S"]),
    armor: true,
    helmet: p.role !== "辅助" || Math.random() > 0.35,
    kills: 0,
    deaths: 0,
  }));
}

function resetRoundPlayerState(playerState, economy) {
  return playerState.map((p) => ({
    ...p,
    side: p.side === "CT" ? "T" : "CT",
    hp: 100,
    alive: true,
    weapon: economy < 35 ? pick(["Deagle", "Tec-9", "Five-SeveN", "MP9"]) : pick(weaponByRole[p.role] || ["AK-47"]),
    armor: economy >= 30 || Math.random() > 0.35,
    helmet: economy >= 45 || Math.random() > 0.5,
  }));
}

function teamPower(state) {
  const structural = balanceScore(state.players) * 0.08;
  return avg(state.players, ["aim", "sense", "mental", "teamwork", "clutch"]) * 0.64 + state.team.morale * 0.12 + state.team.tactics * 0.14 + state.team.chemistry * 0.12 + structural;
}

function getCurrentPhase(m) {
  return scriptProfiles[m.script].phases.find((p) => m.round + 1 >= p.rounds[0] && m.round + 1 <= p.rounds[1]) || scriptProfiles[m.script].phases.at(-1);
}

function nodeForRound(m) {
  if (m.round === 0) return "timeout";
  if (Math.max(m.us, m.them) >= 11) return "clutch";
  if (m.economyUs < 35 || m.economyThem < 35) return "eco";
  const phase = getCurrentPhase(m);
  if (phase?.nodes?.length) return pick(phase.nodes);
  if (Math.abs(m.us - m.them) >= 5) return m.us < m.them ? "morale" : "info";
  return pick(["duel", "gamble", "info", "eco", "morale"]);
}

function tacticBonus(node, coach, opponent, team) {
  let b = 0;
  if (node === "eco") b += (coach.economy || 0) - 2 + (team.tactics - 50) * 0.04;
  if (node === "gamble") b += (coach.gamble || 0) - (opponent.style === "纪律队" ? 3 : 0);
  if (node === "info") b += (coach.info || 0) + (coach.discipline || 0) * 0.35 + (team.tactics - 50) * 0.08;
  if (node === "duel") b += (coach.antiStar || 0) - (opponent.style === "明星单核队" ? 4 : 0);
  if (node === "morale") b += (coach.calm || 0) + (team.morale - 50) * 0.12;
  if (node === "clutch") b += (team.chemistry - 50) * 0.1 + (team.morale - 50) * 0.1;
  if (node === "timeout") b += (coach.discipline || 0) + (coach.calm || 0) * 0.4;
  if (coach.speed && opponent.style !== "激进队") b += node === "info" ? -2 : coach.speed * 0.45;
  return b;
}

function winProbability(state, node) {
  const m = state.currentMatch;
  const phaseBias = getCurrentPhase(m)?.bias || 0;
  const base = 50 + (teamPower(state) - m.opponent.power) * 0.72;
  const economy = (m.economyUs - m.economyThem) * 0.12;
  const pressure = Math.max(m.us, m.them) >= 10 ? (state.team.morale - 50) * 0.16 + avg(state.players, ["clutch"]) * 0.04 - 3 : 0;
  const trade = node === "duel" || node === "clutch" ? (state.team.chemistry - 50) * 0.08 : 0;
  const tactics = tacticBonus(node, m.coach, m.opponent, state.team);
  return clamp(base + economy + phaseBias + tactics + pressure + trade - m.adjustCount * 2.4, 8, 92);
}

function shouldAskDecision(m) {
  if (m.usedDecisionRounds.includes(m.round)) return false;
  const profileRounds = scriptProfiles[m.script]?.decisionRounds || [];
  return profileRounds.includes(m.round) || (m.them - m.us >= 3 && m.round > 3) || Math.max(m.us, m.them) === 11;
}

function makeDecisionPrompt(m) {
  if (m.them - m.us >= 3) return `连续丢分。${getOpponentTell(m)}你要安抚、变速，还是把比赛交给明星？`;
  if (m.adjustCount >= 2) return `对手已经读到你的习惯。${getOpponentTell(m)}继续默认会被吃，换一个高风险 call。`;
  if (Math.max(m.us, m.them) >= 11) return "赛点边缘。每一个赌点都可能变成封面，也可能变成会议材料。";
  return `局势节点到了。${tacticalRead(m)}`;
}

function dynamicInterventions(m) {
  const pool = [...baseInterventions];
  if (m.them - m.us >= 3) {
    pool.unshift(
      { label: "暂停训话，先止血", style: { calm: 9, discipline: 4 }, effect: { morale: 6, chemistry: 2 }, risk: "如果下一回合输，红温概率增加。", backfire: { morale: -4 }, text: "你把耳机放下，只讲下一分怎么拿。呼吸慢了下来。" },
      { label: "让明星自由发挥", style: { speed: 4, gamble: 7 }, effect: { morale: 3, chemistry: -3 }, risk: "失败会伤害团队默契。", backfire: { chemistry: -5 }, text: "战术板合上：这一回合，谁敢开枪谁说了算。" },
    );
  }
  if (m.adjustCount >= 2) {
    pool.unshift({ label: "假转点骗调整", style: { info: 10, discipline: 3 }, effect: { tactics: 3 }, risk: "如果被反读，战术执行 -5。", backfire: { tactics: -5 }, text: "对手开始针对你的转点，你给他们一个假答案。" });
  }
  if (m.economyUs < 35) {
    pool.unshift({ label: "半甲 Tec-9 提速", style: { speed: 8, economy: -2 }, effect: { morale: 2 }, risk: "输掉后经济继续崩，士气 -4。", backfire: { morale: -4 }, text: "经济已经烂了，那就把节奏也打烂。" });
  }
  return shuffle(pool).slice(0, 3);
}

function applyDecisionState(s, option) {
  const timeoutCost = s.pendingDecision?.timeoutCost ? 1 : 0;
  const pending = option.backfire ? [{ condition: "nextRoundLoss", effect: option.backfire, label: option.risk }] : [];
  return {
    pendingDecision: null,
    team: applyTeamEffect(s.team, option.effect || {}),
    currentMatch: {
      ...s.currentMatch,
      coach: mergeStyle(s.currentMatch.coach, option.style),
      timeouts: s.currentMatch.timeouts - timeoutCost,
      pendingConsequences: [...s.currentMatch.pendingConsequences, ...pending],
      usedDecisionRounds: [...s.currentMatch.usedDecisionRounds, s.currentMatch.round],
      lines: [...s.currentMatch.lines, { tone: "event", text: `教练干预：${renderDecisionText(option.text, s)}` }],
    },
  };
}

function activePause() {
  const s = store.getState();
  const m = s.currentMatch;
  if (s.phase !== "match" || s.pendingDecision || !m || m.timeouts <= 0) return;
  store.getState().setDecision({
    prompt: `主动暂停。你还剩 ${m.timeouts} 次暂停。${tacticalRead(m)}`,
    options: dynamicInterventions(m),
    timeoutCost: true,
  });
}

function readGame() {
  const s = store.getState();
  const m = s.currentMatch;
  if (s.phase !== "match" || !m || s.pendingDecision) return;
  store.getState().appendLine({ tone: "event", text: `读盘：${tacticalRead(m)} ${getOpponentTell(m)}` });
}

function renderDecisionText(text, state) {
  const hot = [...state.players].sort((a, b) => b.tilt + b.fatigue - (a.tilt + a.fatigue))[0]?.name || "核心选手";
  return text.replaceAll("{hot}", hot);
}

function tacticalRead(m) {
  const recent = m.opponentState.recent.slice(-3).join("、") || "还没有足够样本";
  const eco = m.economyThem > 58 ? "对手下回合大概率长枪全甲。" : m.economyThem < 34 ? "对手可能强起或半甲提速。" : "对手经济还能打一套完整默认。";
  const adapt = `对手适应进度 ${Math.min(100, Math.round((m.opponentState.roundsSinceAdapt / m.opponent.adaptSpeed) * 100))}%。`;
  return `近三回合：${recent}。${eco} ${adapt}`;
}

function getOpponentTell(m) {
  if (m.opponentState.roundsSinceAdapt + 1 >= m.opponent.adaptSpeed) return `预警：${pick(m.opponent.tells)}。`;
  return `观察：${pick(m.opponent.patterns)}还在重复。`;
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
  const economyUs = clamp(m.economyUs + (won ? 12 : -14) + (node === "eco" ? 8 : 0));
  const economyThem = clamp(m.economyThem + (won ? -12 : 12));
  const adjustTriggered = !won && ["info", "gamble", "duel"].includes(node);
  const adjustCount = m.adjustCount + (adjustTriggered ? 1 : 0);
  const opponentState = updateOpponentState(m, node, adjustTriggered);
  const playerState = updatePlayerState(state, won, node, economyUs);
  const consequence = resolveConsequences(m.pendingConsequences, won);
  const nextTeam = consequence.effect ? applyTeamEffect(state.team, consequence.effect) : state.team;
  store.getState().appendLine(makeRoundLine({ ...state, team: nextTeam }, { node, prob, won, us, them, round, adjustCount, consequence }));
  store.getState().updateMatch({ round, us, them, economyUs, economyThem, adjustCount, opponentState, playerState, pendingConsequences: consequence.remaining });
  if (consequence.effect) store.getState().updateTeam(nextTeam);
  if (us >= WIN_SCORE || them >= WIN_SCORE) finishRoundMatch(us, them);
}

function resolveConsequences(pending, won) {
  const hit = pending.filter((c) => c.condition === "nextRoundLoss" && !won);
  const remaining = pending.filter((c) => !(c.condition === "nextRoundLoss"));
  const effect = hit.length ? hit.reduce((acc, c) => {
    Object.entries(c.effect).forEach(([k, v]) => (acc[k] = (acc[k] || 0) + v));
    return acc;
  }, {}) : null;
  return { effect, remaining, text: hit.length ? `上回合的赌注开始反噬：${hit.map((c) => c.label).join(" ")}` : "" };
}

function updateOpponentState(m, node, adjusted) {
  const pattern = pick(m.opponent.patterns);
  const roundsSinceAdapt = adjusted ? 0 : m.opponentState.roundsSinceAdapt + 1;
  return {
    pattern: (m.opponentState.pattern + 1) % m.opponent.patterns.length,
    adaptedTo: adjusted ? [...m.opponentState.adaptedTo, node].slice(-4) : m.opponentState.adaptedTo,
    roundsSinceAdapt,
    recent: [...m.opponentState.recent, pattern].slice(-5),
  };
}

function updatePlayerState(state, won, node, economy) {
  const m = state.currentMatch;
  const next = resetRoundPlayerState(m.playerState, economy);
  const hero = pickWeighted(state.players, won);
  return next.map((p) => {
    const isHero = p.name === hero.name;
    const damage = won ? (isHero ? Math.random() * 48 : Math.random() * 88) : (isHero ? Math.random() * 70 : 35 + Math.random() * 90);
    const alive = won ? damage < 94 : damage < 55 && Math.random() > 0.35;
    return {
      ...p,
      hp: alive ? clamp(100 - damage, 1, 100) : 0,
      alive,
      kills: p.kills + (isHero && won ? pick([2, 2, 3]) : won && Math.random() > 0.68 ? 1 : 0),
      deaths: p.deaths + (alive ? 0 : 1),
      armor: p.armor && damage < 70,
      helmet: p.helmet && damage < 55,
    };
  });
}

function finishRoundMatch(us, them) {
  const fresh = { ...store.getState(), currentMatch: { ...store.getState().currentMatch, us, them } };
  const wonMatch = us > them;
  const moment = makeMoment(fresh, wonMatch);
  store.getState().addLog(wonMatch ? "比赛胜利" : "比赛失利", `${us}:${them}。${moment}`);
  store.getState().finishMatch(wonMatch, makeOpinion(fresh, wonMatch), moment);
}

function pickWeighted(players, won) {
  const total = players.reduce((sum, p) => sum + (won ? p.aim + p.clutch + p.teamwork * 0.4 : p.tilt + p.fatigue + 30), 0);
  let roll = Math.random() * total;
  for (const p of players) {
    roll -= won ? p.aim + p.clutch + p.teamwork * 0.4 : p.tilt + p.fatigue + 30;
    if (roll <= 0) return p;
  }
  return players[0];
}

function makeRoundLine(state, ctx) {
  const [title, detail] = nodes[ctx.node];
  const p = pickWeighted(state.players, ctx.won);
  const action = ctx.won ? winAction(p, ctx.node, state.currentMatch.opponent.star) : loseAction(p, state.currentMatch.opponent.star, ctx.node);
  const intel = intelLine(state.currentMatch, ctx.node, ctx.won);
  const cast = castLine(ctx, p);
  const adjust = ctx.adjustCount >= 2 && !ctx.won ? "<br><b>预警：</b>对手已经开始根据你的转点节奏提前站位。" : "";
  const consequence = ctx.consequence.text ? `<br><b>${ctx.consequence.text}</b>` : "";
  return { tone: ctx.won ? "good" : "bad", text: `<small>R${ctx.round} / ${ctx.us}:${ctx.them} / ${title} / 参考胜率 ${ctx.prob.toFixed(0)}%</small>${detail}<br>${action}<br>${intel}${adjust}${consequence}<br><span class="caster">${cast}</span>` };
}

function winAction(p, node, star) {
  const map = {
    eco: [`${p.name} 捡枪双杀。对手经济也崩了，下回合可能强起。`, `${p.name} 用 Tec-9 把包点撕开。${star} 没保住枪。`],
    clutch: [`${p.name} 没急。等对手转身才开枪。`, `${p.name} 这次残局拿下了，前两次失误终于被洗掉。`],
    timeout: [`暂停后队伍变了。${p.name} 第一枪打开默认。`, `战术刚讲完就兑现。${p.name} 把对手的提前站位打穿。`],
    morale: [`${p.name} 把不该赢的回合拖回来。语音里第一次有人笑。`, `${p.name} 抬了一手士气，连败的声音停住了。`],
    gamble: [`赌点生效。${p.name} 蹲在非常规位，像蹲到了对手剧本。`, `${p.name} 从烟后钻出来。对手搜点路线被你猜中。`],
    info: [`三架位打成了。${p.name} 没看到人，但看到了意图。`, `假打被读到了。${p.name} 提前转点补上最后一枪。`],
    duel: [`${p.name} 对上 ${star} 没退。第一枪准得像提前知道镜头会切。`, `${p.name} 赢下明星对位。这个回合会进集锦。`],
  };
  return pick(map[node]);
}

function loseAction(p, star, node) {
  const map = {
    eco: [`${p.name} 强起没有声音。钱没了，回合也没了。`, `经济局没翻。对手保下三把长枪。`],
    clutch: [`${p.name} 最后一枪空了。${star} 没给第二次机会。`, `${p.name} 读对了位置，但没稳住手。`],
    timeout: [`暂停刚结束就白给。战术板还热着，比分已经凉了。`, `对手像听见了暂停内容，第一波就反架成功。`],
    morale: [`${p.name} 没补上那枪，语音突然安静。`, `连败开始咬人。有人还在讲上一回合。`],
    gamble: [`赌点赌错了。另一侧像开了门，对手排队进包点。`, `非常规位被预瞄。对手已经在读你的风险偏好。`],
    info: [`假脚步骗到了你们，真正的进攻已经进点。`, `信息断了。补防到的时候包已经埋下。`],
    duel: [`${star} 开始收割。你的针对像写在纸上的勇敢。`, `${p.name} 第一枪没顶住，对面明星把局势接走。`],
  };
  return pick(map[node]);
}

function intelLine(m, node, won) {
  const eco = m.economyThem > 58 ? "对手下回合大概率全甲长枪。" : m.economyThem < 34 ? "对手经济低，可能强起或提速。" : "对手经济还能打一套完整默认。";
  const pattern = pick(m.opponent.patterns);
  const read = won ? `你们刚抓到「${pattern}」。` : `对手用「${pattern}」骗过了第一波判断。`;
  const nodeHint = node === "info" ? "他们开始测试你的补防速度。" : node === "eco" ? "经济会决定下回合节奏。" : "下一回合第一身位很关键。";
  return `<b>情报：</b>${eco} ${read}${nodeHint}`;
}

function castLine(ctx, p) {
  if (ctx.won && ctx.prob < 35) return "这分太硬。";
  if (!ctx.won && ctx.prob > 68) return "这都能丢。";
  if (ctx.node === "clutch") return "心跳局。";
  return ctx.won ? pick([`${p.name} 有东西。`, "暂停有味道。", "读到了。", "这分提气。"]) : pick(["被反读了。", "还没崩。", "要复盘。", "节奏断了。"]);
}

function makeOpinion(state, won) {
  const m = state.currentMatch;
  const headline = won ? pick(["这暂停值一个 Major 冠军。", "教练今天真有东西。", "这队终于像一支队了。"]) : pick(["暂停叫了，但没叫到点上。", "这场输在中期读盘。", "明星没救回结构问题。"]);
  const ratings = state.players.map((p) => ({ name: p.name, score: clamp((won ? 7.2 : 5.4) + (p.clutch - 70) / 20 + Math.random() * 1.8, 1, 10).toFixed(1) }));
  return { headline, body: `${m.opponent.name} / ${m.map}，最终 ${m.us}:${m.them}。争议点：对方调整为什么来得这么快，以及你的暂停到底救了哪几个回合。`, ratings };
}

function makeMoment(state, won) {
  const m = state.currentMatch;
  if (m.script === "宿命局") return won ? "宿命局：最后一张图，你用暂停拆掉了对手默认。" : "宿命局：离 13 分只差一口气，最后没人敢呼吸。";
  if (won && m.them >= 11) return "绝杀：低胜率回合被你赌成了封面。";
  if (!won && m.us >= 11) return "崩盘：离胜利只差一分，语音却先碎了。";
  return won ? "翻盘：暂停真的改了走向。" : "被拆解：纸面优势被一回合一回合拿走。";
}

function render() {
  const s = store.getState();
  $("setupView").classList.toggle("hidden", s.phase !== "setup");
  $("gameView").classList.toggle("hidden", s.phase === "setup");
  $("gameView").classList.toggle("match-focus", s.phase === "match");
  $("saveStatus").textContent = `已自动存档 / ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
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
  const selectedPlayers = s.pickedIds.map((id) => marketPlayers.find((p) => p.name === id));
  const gate = canStartRoster(selectedPlayers);
  $("budgetText").textContent = `预算 $${s.budget}`;
  $("pickedText").textContent = `已选 ${s.pickedIds.length} / 5`;
  $("rosterGate").textContent = gate.reason;
  $("rosterGate").className = gate.ok ? "gate ok" : "gate";
  $("startSeasonBtn").disabled = !gate.ok;
  $("market").innerHTML = marketPlayers.map((p) => {
    const selected = s.pickedIds.includes(p.name);
    const disabled = !selected && (s.pickedIds.length >= 5 || s.budget < p.price);
    return `<button class="player-card ${selected ? "selected" : ""}" ${disabled ? "disabled" : ""} data-pick="${p.name}" type="button">
      <div class="portrait"><img src="${p.photo}" alt="${p.name}" loading="lazy" onerror="this.classList.add('broken')" /><span>${p.name.slice(0, 2)}</span></div>
      <div class="player-card-body">
        <h3><span>${p.name}</span><span>$${p.price}</span></h3>
        <p>${p.role} / ${p.tag} / ${p.voice}</p>
        <div class="mini"><span>rating ${p.rating}</span><span>HLTV profile</span>${playerStatDefs.map(([l, k]) => `<span>${l}${p[k]}</span>`).join("")}</div>
      </div>
    </button>`;
  }).join("");
  document.querySelectorAll("[data-pick]").forEach((btn) => btn.addEventListener("click", () => store.getState().togglePick(btn.dataset.pick)));
}

function renderTeam(s) {
  $("seasonLine").textContent = `第 ${s.week} 周 / ${SEASON_WEEKS} 周`;
  $("recordLine").textContent = `${s.wins}W-${s.losses}L`;
  $("lastResult").textContent = s.lastResult;
  $("weekTitle").textContent = s.phase === "match" ? "实时赛事 Feed" : s.phase === "post" ? "赛后舆论" : s.phase === "ended" ? "赛季结束" : "选择本周行动";
  $("phaseLabel").textContent = s.phase === "match" ? "LIVE MAJOR FEED" : "TEAM ROOM";
  $("teamStats").innerHTML = teamStatDefs.map(([label, key]) => `<div class="stat-row" title="${statTooltips[key]}"><div class="stat-top"><span>${label}</span><b>${s.team[key]}</b></div><div class="bar"><span style="width:${s.team[key]}%"></span></div></div>`).join("");
  $("roster").innerHTML = s.phase === "match" && s.currentMatch ? renderSpectatorRoster(s.currentMatch.playerState) : s.players.map((p) => `<div class="player"><strong><span>${p.name}</span><span>${p.role}</span></strong><p>${p.tag} / ${p.voice}</p><div class="mini">${playerStatDefs.map(([l, k]) => `<span>${l}${p[k]}</span>`).join("")}</div></div>`).join("");
}

function renderSpectatorRoster(players) {
  return players.map((p, i) => `<div class="spectator ${p.side.toLowerCase()} ${p.alive ? "" : "dead"}">
    <span class="num">${i + 1}</span>
    <strong><span>${p.side}</span> ${p.name}</strong>
    <span class="hp">HP ${p.hp}</span>
    <span>${p.weapon}</span>
    <span>${p.kills}/${p.deaths}</span>
    <span>${p.armor ? "甲" : "无甲"} ${p.helmet ? "头" : "无头"}</span>
  </div>`).join("");
}

function renderActions(s) {
  $("actions").classList.toggle("hidden", s.phase !== "week");
  $("actions").innerHTML = s.weeklyActions.map((a) => `<button class="action-card" data-action="${a.id}" type="button"><h3>${a.title}</h3><p>${a.text}</p><span class="tag">影响真实回合逻辑</span></button>`).join("");
  document.querySelectorAll("[data-action]").forEach((btn) => btn.addEventListener("click", () => store.getState().startMatch(s.weeklyActions.find((a) => a.id === btn.dataset.action))));
}

function renderDecision(s) {
  $("decisionBox").classList.toggle("hidden", !s.pendingDecision);
  if (!s.pendingDecision) return;
  $("decisionText").textContent = s.pendingDecision.prompt;
  $("decisionOptions").innerHTML = s.pendingDecision.options.map((o, i) => `<button class="decision-option" data-decision="${i}" type="button"><strong>${o.label}</strong><small>${o.risk || "没有免费答案。"}</small></button>`).join("");
  document.querySelectorAll("[data-decision]").forEach((btn) => btn.addEventListener("click", () => store.getState().applyDecision(s.pendingDecision.options[Number(btn.dataset.decision)])));
}

function renderMatch(s) {
  const m = s.currentMatch;
  $("matchCard").classList.toggle("hidden", s.phase !== "match" || !m);
  $("activePauseBtn").disabled = s.phase !== "match" || !m || !!s.pendingDecision || m.timeouts <= 0;
  $("readGameBtn").disabled = s.phase !== "match" || !m || !!s.pendingDecision;
  $("activePauseBtn").textContent = m ? `暂停 x${m.timeouts}` : "暂停 x3";
  if (!m) return;
  $("matchMap").textContent = m.map;
  $("matchOpponent").textContent = m.opponent.name;
  $("matchScore").textContent = `${m.us} : ${m.them}`;
  $("matchMeta").innerHTML = [`剧本 ${m.script}`, `对手 ${m.opponent.style}`, `我方经济 ${m.economyUs}`, `对方经济 ${m.economyThem}`, `调整 ${m.adjustCount}`].map((x) => `<span class="tag">${x}</span>`).join("");
  $("matchFeed").innerHTML = m.lines.slice(-8).map((line) => `<div class="round-line ${line.tone === "bad" ? "bad" : line.tone === "event" ? "event" : ""}">${line.text}</div>`).join("");
  $("matchFeed").scrollTop = $("matchFeed").scrollHeight;
  $("nextRoundBtn").textContent = `R${m.round + 1} / 继续`;
}

function renderOpinion(s) {
  $("opinionBox").classList.toggle("hidden", s.phase !== "post");
  if (!s.lastOpinion) return;
  $("forumCard").innerHTML = `<h3>HLTV 热帖 / ${s.lastOpinion.headline}</h3><p>${s.lastOpinion.body}</p><div class="rating-grid">${s.lastOpinion.ratings.map((r) => `<div class="rating"><span>${r.name}</span><strong>${r.score}</strong></div>`).join("")}</div>`;
}

function renderEnd(s) {
  $("seasonEnd").classList.toggle("hidden", s.phase !== "ended");
  if (s.phase !== "ended") return;
  $("endingTitle").textContent = s.wins >= 4 ? "那个被记住的赛季" : s.wins >= 2 ? "有名场面的危险项目" : "流量很高的事故现场";
  $("endingBody").textContent = `5 周结束，战绩 ${s.wins}W-${s.losses}L。这个赛季留下的镜头：${s.bestMoment}`;
  $("records").innerHTML = [["最终战绩", `${s.wins}W-${s.losses}L`], ["赛季记忆", s.bestMoment], ["士气", s.team.morale], ["战术执行", s.team.tactics], ["团队默契", s.team.chemistry]].map(([a, b]) => `<div class="record"><span>${a}</span><strong>${b}</strong></div>`).join("");
}

function renderLog(s) {
  $("log").innerHTML = s.logs.map((l) => `<article class="log-item"><strong>W${l.week} / ${l.title}</strong><p>${l.text}</p></article>`).join("");
}

$("startSeasonBtn").addEventListener("click", () => store.getState().startSeason());
$("newSeasonBtn").addEventListener("click", () => { if (confirm("确定变阵重组？当前存档会被覆盖。")) store.getState().newSeason(); });
$("restartBtn").addEventListener("click", () => store.getState().newSeason());
$("continueBtn").addEventListener("click", () => store.getState().continueSeason());
$("activePauseBtn").addEventListener("click", activePause);
$("readGameBtn").addEventListener("click", readGame);
$("nextRoundBtn").addEventListener("click", playNextRound);
$("nextWeekBtn").addEventListener("click", () => store.getState().nextWeek());

render();
