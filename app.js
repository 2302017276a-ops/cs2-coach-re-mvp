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

const SAVE_KEY = "cs2-coach-season-v9-major-broadcast";
const APP_VERSION = "v0.2.4-economy-state";
const WIN_SCORE = 13;
const SEASON_WEEKS = 5;
const START_BUDGET = 128;
const MIN_INTERNAL_RATING = 74;
const MIN_AVG_HLTV = 1.0;
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

const economyStates = {
  eco: { label: "ECO", value: 24, win: -13, utility: 1, armor: 0.22, helmet: 0.12, kit: 0.1, volatility: 2 },
  force: { label: "FORCE BUY", value: 38, win: -5, utility: 2, armor: 0.58, helmet: 0.32, kit: 0.22, volatility: 8 },
  broken: { label: "BROKEN", value: 16, win: -18, utility: 0, armor: 0.08, helmet: 0.04, kit: 0.04, volatility: 4 },
  fullbuy: { label: "FULL BUY", value: 68, win: 5, utility: 3, armor: 0.98, helmet: 0.92, kit: 0.55, volatility: 0 },
  lastbuy: { label: "LAST BUY", value: 46, win: -3, utility: 2, armor: 0.78, helmet: 0.52, kit: 0.32, volatility: 5 },
};

const weaponPoolByEconomyState = {
  eco: ["Deagle", "Tec-9", "Five-SeveN", "MP9"],
  broken: ["Deagle", "Tec-9", "Five-SeveN"],
  force: ["Tec-9", "Deagle", "Five-SeveN", "MP9", "XM1014", "MAG-7", "AWP"],
  lastbuy: ["AK-47", "M4A1-S", "M4A4", "FAMAS", "Galil", "AWP", "Deagle", "MP9"],
  fullbuy: [],
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

const playerMeta = {
  ZywOo: { hltvRating: 1.39, photo: "https://img-cdn.hltv.org/playerbodyshot/blnoWFtH8GUJZjhr8H0P4u.png?ixlib=java-2.1.0&s=dc0fe6bd817ef852f59185ccf6b6c868&w=400" },
  donk: { hltvRating: 1.39, photo: "https://img-cdn.hltv.org/playerbodyshot/C4b0sMnty05S40UmXhLRD4.png?ixlib=java-2.1.0&s=8d846371bff4a867c0fcc3e038e02b1f&w=400" },
  ropz: { hltvRating: 1.15 },
  m0NESY: { hltvRating: 1.32, photo: "https://img-cdn.hltv.org/playerbodyshot/e20I1I0Ld0bWn_VI31pf08.png?ixlib=java-2.1.0&s=6f89be52bc56efdd00b207268a1f7cfe&w=400" },
  sh1ro: { hltvRating: 1.13, photo: "https://img-cdn.hltv.org/playerbodyshot/Grz5vLIlrpeI7IQmm8d-jH.png?ixlib=java-2.1.0&s=3cfc5c3d0dbe422578931aabe14faa3c&w=400" },
  NiKo: { hltvRating: 1.11, photo: "https://img-cdn.hltv.org/playerbodyshot/ZrAcgiRTFgDyDj4k04-xAh.png?ixlib=java-2.1.0&s=afb5419d8de8399ef582f5446702a278&w=400" },
  "910": { hltvRating: 1.08 },
  s1mple: { hltvRating: 1.11 },
  device: { hltvRating: 1.13 },
  Twistzz: { hltvRating: 1.08 },
  KSCERATO: { hltvRating: 1.17 },
  Spinx: { hltvRating: 1.08 },
  frozen: { hltvRating: 1.12 },
  flameZ: { hltvRating: 1.05 },
  molodoy: { hltvRating: 1.07 },
  mezii: { hltvRating: 1.02 },
  Senzu: { hltvRating: 1.08 },
  XANTARES: { hltvRating: 1.14 },
  YEKINDAR: { hltvRating: 1.0 },
  xertioN: { hltvRating: 1.08 },
  torzsi: { hltvRating: 1.04 },
  iM: { hltvRating: 1.04 },
  b1t: { hltvRating: 1.09 },
  HeavyGod: { hltvRating: 1.05 },
  kyousuke: { hltvRating: 1.07 },
  w0nderful: { hltvRating: 1.06 },
  Wicadia: { hltvRating: 1.01 },
  yuurih: { hltvRating: 1.06 },
  Makazze: { hltvRating: 0.98 },
  MATYS: { hltvRating: 1.01 },
  tN1R: { hltvRating: 1.04 },
  latto: { hltvRating: 0.99 },
  "huNter-": { hltvRating: 1.03 },
  broky: { hltvRating: 1.08 },
  rain: { hltvRating: 1.01 },
  Magisk: { hltvRating: 1.02 },
  cadiaN: { hltvRating: 0.98 },
  jks: { hltvRating: 1.03 },
  Jimpphat: { hltvRating: 1.09 },
  EliGE: { hltvRating: 1.12 },
};

const narrative = {
  heroLines: [
    "明星能赢残局，结构才能赢 Major。",
    "别只买枪男，你还需要能接残局的人。",
    "一支队伍的上限，不只看谁最强。",
    "你选的不只是五个人。",
    "好的阵容，能撑到暂停之后。",
    "Major 不靠一个人赢。",
    "残局能救一分，结构才能救一场。",
  ],
  firstActionHint: "把鼠标放在「士气」「战术执行」「团队默契」上。先看影响，再选本周方向。",
  benchNotes: [
    "火力够了，但残局太薄。",
    "枪法很凶，问题是谁来接第二枪？",
    "这阵容能打快，但很怕经济断档。",
    "双狙上限很高，但容错很低。",
    "有明星，但没人托底。",
    "默认能力很强，但逆风容易红温。",
    "纪律性不错，就是缺个敢操作的人。",
    "这队伍能咬住比分，但缺终结比赛的人。",
    "前期压制力很强，但后劲不足。",
    "道具协同很好，就是缺残局经验。",
  ],
  broadcastShots: [
    "导播给到了 {player}。",
    "全场镜头都在看这把残局。",
    "暂停回来，现场已经开始喊了。",
    "镜头扫过选手席，没有人说话。",
    "导播切到了对面明星位。",
    "耳机摘下来的一瞬间，所有人都知道这分重要。",
    "现场开始躁动了。",
    "导播镜头一直没离开那把大狙。",
  ],
  economyLines: {
    eco: ["ECO。下一回合才是真枪。", "这分能捡一把就是赚。", "现场知道这分很薄。"],
    force: ["FORCE BUY。半甲、沙鹰、赌点。", "强起了。现场开始躁动。", "无甲大狙也敢架。"],
    broken: ["BROKEN。钱断了，语音也短了。", "经济碎了，只能先撑住。", "这分像是在等下一个回合。"],
    fullbuy: ["FULL BUY。道具齐，默认能打。", "长枪全甲，慢控开始。", "这一分可以打完整结构。"],
    lastbuy: ["LAST BUY。这波输了就断。", "最后一套长枪，没人想先开口。", "所有资源都压在这一分。"],
  },
  decisionPrompts: {
    losing: [
      "连续丢分。预警：{tell}。你要安抚、变速，还是把比赛交给明星？",
      "比分被拉开。{tell}。语音要先降温，节奏要先变。",
      "对手开始连拿关键枪。{tell}。现在需要一个明确 call。",
    ],
    adapted: [
      "对手已经读到你的习惯。{tell}。继续默认会被吃，换一个高风险 call。",
      "默认被针对了。{tell}。你需要制造一次错位。",
    ],
    matchPoint: [
      "赛点边缘。每一个赌点都可能变成封面，也可能变成会议材料。",
      "全场镜头都在看这把。现在不是教程，是选择。",
    ],
    neutral: [
      "局势节点到了。{read}",
      "这一回合会改变半场节奏。{read}",
    ],
  },
  interventionResults: {
    discipline: ["暂停后，补枪终于到位。默认重新站住了。", "队伍没有提速，只是把每一步走准。"],
    speed: ["节奏被拧快。对手的第一套道具慢了半秒。", "五个人直接压上去，现场声音先起来了。"],
    star: ["资源全部给到明星位。成败都在第一枪。", "战术板合上，镜头也知道该看谁。"],
    gamble: ["非常规位压住了第一波搜点。", "赌点成立之前，没人知道另一边已经空了。"],
    antiStar: ["两颗闪都给到对面明星。围剿开始。", "对面明星被迫换路线，默认被打乱。"],
    calm: ["语音降温了，准星没降。", "没人再讲上一回合。下一枪重新开始。"],
    info: ["假转点给出去，对手吃了第一个假答案。", "信息差打出来了，补防提前半拍。"],
    fail: ["条件没撑住。这个 call 只执行了一半。", "队伍犹豫了，风险没有换到收益。"],
  },
  roundWinLines: {
    eco: ["{player} 捡枪双杀。对手经济也断了。", "{player} 用小枪把包点撕开。"],
    clutch: ["{player} 没急。等对手转身才开枪。", "{player} 这次残局拿下了。"],
    timeout: ["暂停回来，{player} 第一枪打开默认。", "刚讲完就兑现，{player} 把提前站位打穿。"],
    morale: ["{player} 把不该赢的回合拖回来。", "{player} 抬了一手士气，连败声停住了。"],
    gamble: ["赌点生效。{player} 蹲到了对手剧本。", "{player} 从烟后钻出来，搜点路线被猜中。"],
    info: ["三架位打成了。{player} 没看到人，但看到了意图。", "假打被读到，{player} 提前转点补上最后一枪。"],
    duel: ["{player} 对上 {star} 没退。", "{player} 赢下明星对位。这个回合会进集锦。"],
  },
  roundLoseLines: {
    eco: ["{player} 强起没有声音。钱没了，回合也没了。", "经济局没翻。对手保下三把长枪。"],
    clutch: ["{player} 最后一枪空了。{star} 没给第二次机会。", "{player} 读对位置，但没稳住手。"],
    timeout: ["暂停刚结束就白给。比分先凉了一格。", "对手第一波反架成功。"],
    morale: ["{player} 没补上那枪，语音突然安静。", "连败开始咬人。有人还在讲上一回合。"],
    gamble: ["赌点赌错。另一侧像开了门。", "非常规位被预瞄，对手在读你的风险偏好。"],
    info: ["假脚步骗到了你们，真正的进攻已经进点。", "信息断了。补防到的时候包已经埋下。"],
    duel: ["{star} 开始收割。", "{player} 第一枪没顶住，对面明星把局势接走。"],
  },
  mapTactics: {
    Mirage: ["32夹B", "VIP烟默认", "拱门提速", "rush A 小", "中路控图", "假B转A"],
    Inferno: ["香蕉道前压", "二楼爆弹", "链接回防", "A1反清", "提速B"],
    Nuke: ["外场一线烟", "铁板夹击", "黄房提速", "K1断后", "A点爆弹"],
    Ancient: ["中路夹B", "甜甜圈反清", "红房提速", "A小默认", "B坡控图"],
    Anubis: ["中路夹A", "B长反清", "运河提速", "A大默认", "假A转B"],
    Dust2: ["A小夹A", "B洞反清", "中门前压", "长门提速", "假B转A"],
  },
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

function eliteTax(price, hltvRating = 1) {
  let tax = 0;
  if (price >= 36) tax += 8 + (price - 36) * 3;
  else if (price >= 30) tax += 4 + (price - 30) * 1.5;
  if (hltvRating >= 1.25) tax += Math.round((hltvRating - 1.24) * 80);
  if (hltvRating >= 1.35) tax += 4;
  return tax;
}

function fallbackHltvRating(aim, sense, mental, teamwork, clutch) {
  return Number((0.82 + (aim * 0.32 + sense * 0.18 + mental * 0.16 + teamwork * 0.14 + clutch * 0.2) / 500).toFixed(2));
}

function photoFor(name) {
  return playerMeta[name]?.photo || "";
}

function hltvRatingFor(name, aim, sense, mental, teamwork, clutch) {
  return playerMeta[name]?.hltvRating || fallbackHltvRating(aim, sense, mental, teamwork, clutch);
}

function hltvUrlFor(name) {
  return hltvIds[name] ? `https://www.hltv.org/player/${hltvIds[name]}` : "";
}

function formatHltvRating(value) {
  return Number(value).toFixed(2);
}

function renderTemplate(text, values = {}) {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function eliteLabel(p) {
  if (p.hltvRating >= 1.3) return "SUPERSTAR TAX";
  if (p.hltvRating >= 1.15) return "STAR";
  return "";
}

const marketPlayers = rawPlayers.map(([name, role, price, tag, voice, aim, sense, mental, teamwork, clutch, tilt]) => {
  const rating = Math.round((aim + sense + mental + teamwork + clutch) / 5);
  const hltvRating = hltvRatingFor(name, aim, sense, mental, teamwork, clutch);
  return {
    name,
    role,
    basePrice: price,
    price: Math.round(price + eliteTax(price, hltvRating)),
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
    hltvRating,
    photo: photoFor(name),
    photoCredit: hltvUrlFor(name),
    hltv: hltvUrlFor(name),
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
  { id: "discipline", title: "强调纪律", text: "默认、补枪、听 IGL。暂停收益更稳定。", effect: { tactics: 8, chemistry: 3, morale: -2 }, style: { discipline: 8 }, tags: ["default", "trade"], contextRules: ["lowThrowRate"] },
  { id: "gamble", title: "放手赌点", text: "练非常规站位。打穿对手，或被写进复盘。", effect: { tactics: -2, morale: 2 }, style: { gamble: 9 }, tags: ["risk", "stack"], contextRules: ["antiDefault"] },
  { id: "antiStar", title: "针对明星", text: "双架、反清、假信息。全给对面明星。", effect: { tactics: 5, chemistry: -1 }, style: { antiStar: 9 }, tags: ["anti-star"], contextRules: ["starHeavy"] },
  { id: "speed", title: "直接提速", text: "撕掉默认。不让对手舒服架枪。", effect: { morale: 4, tactics: -3 }, style: { speed: 9 }, tags: ["pace"], contextRules: ["slowOpponent"] },
  { id: "calm", title: "安抚红温", text: "把红温留给准星，不留给语音。", effect: { morale: 8, chemistry: 4 }, style: { calm: 9 }, tags: ["morale"], contextRules: ["losingStreak"] },
  { id: "info", title: "信息差三架位", text: "三架、反摸、假脚步。让默认开始摇晃。", effect: { tactics: 7, chemistry: 2 }, style: { info: 8 }, tags: ["info", "fake"], contextRules: ["adaptation"] },
];

const baseInterventions = [
  { label: "安抚，先止血", category: "calm", style: { calm: 10, discipline: 2 }, effect: { morale: 5, chemistry: 2 }, risk: "若下一回合仍输，士气 -4。", backfire: { morale: -4 }, text: "{calm}" },
  { label: "变速，直接提", category: "speed", style: { speed: 9 }, effect: { morale: 2, tactics: -1 }, risk: "战术执行低于 58 时可能失败。", requires: { tactics: 58 }, failChance: 0.45, failEffect: { tactics: -4, morale: -1 }, backfire: { tactics: -4 }, text: "{speed}" },
  { label: "资源交给明星", category: "star", style: { gamble: 8 }, effect: { morale: 2, chemistry: -3 }, risk: "团队默契低于 55 时可能反噬。", requires: { chemistry: 55 }, failChance: 0.5, failEffect: { chemistry: -5 }, backfire: { chemistry: -5 }, text: "{star}" },
  { label: "非常规赌点", category: "gamble", style: { gamble: 10, info: 3 }, effect: { tactics: -1, morale: 2 }, risk: "战术执行低于 60 时可能赌错。", requires: { tactics: 60 }, failChance: 0.45, failEffect: { morale: -4 }, backfire: { morale: -4 }, text: "{gamble}" },
  { label: "围剿对面明星", category: "antiStar", style: { antiStar: 10, discipline: 2 }, effect: { tactics: 2, morale: 1 }, risk: "若明星仍拿首杀，士气 -6。", backfire: { morale: -6 }, text: "{antiStar}" },
  { label: "假转点骗调整", category: "info", style: { info: 10, discipline: 3 }, effect: { tactics: 3 }, risk: "团队默契低于 56 时可能断层。", requires: { chemistry: 56 }, failChance: 0.42, failEffect: { tactics: -5 }, backfire: { tactics: -5 }, text: "{info}" },
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
  timeout: ["暂停窗口", "暂停回来，现场已经开始喊了。"],
  morale: ["士气波动", "这一分会影响谁还愿意相信谁。"],
  gamble: ["赌点", "另一侧空得能听见风声。"],
  info: ["信息误判", "对手给了假脚步，你要判断是不是真信息。"],
  duel: ["明星对位", "对面明星开始要球，这回合像单挑。"],
};

function createInitialState() {
  return {
    phase: "setup",
    appVersion: APP_VERSION,
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
    hasSeenActionHint: false,
    lastResult: "等待建队",
  };
}

function normalizeLoadedState(saved) {
  const initial = createInitialState();
  if (saved?.appVersion !== APP_VERSION) return initial;
  const next = { ...initial, ...saved, pendingDecision: null };
  next.pickedIds = (next.pickedIds || []).filter((id) => marketPlayers.some((p) => p.name === id));
  next.budget = Number.isFinite(next.budget) ? next.budget : START_BUDGET;
  next.team = { ...initial.team, ...(next.team || {}) };
  next.weeklyActions = (next.weeklyActions || []).map((action) => {
    const fresh = weeklyDeck.find((a) => a.id === action?.id);
    return fresh ? { ...fresh, ...action, tags: action.tags || fresh.tags } : action;
  }).filter((action) => action?.id && Array.isArray(action.tags));
  if (next.phase === "week" && next.weeklyActions.length === 0) next.weeklyActions = rollWeeklyActions();
  if (next.phase !== "setup") {
    next.players = (next.players || [])
      .map((p) => ({ ...marketPlayers.find((m) => m.name === p?.name), ...p }))
      .filter((p) => p.name);
  }
  if (next.phase !== "setup" && next.players.length === 0) return initial;
  return next;
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? normalizeLoadedState(JSON.parse(raw)) : createInitialState();
  } catch {
    return createInitialState();
  }
}

const store = createStore((set) => ({
  ...loadState(),
  togglePick: (name) => set((s) => {
    const player = marketPlayers.find((p) => p.name === name);
    if (!player) return {};
    const selected = s.pickedIds.includes(name);
    if (selected) return { pickedIds: s.pickedIds.filter((id) => id !== name), budget: s.budget + player.price };
    if (s.pickedIds.length >= 5 || s.budget < player.price) return {};
    return { pickedIds: [...s.pickedIds, name], budget: s.budget - player.price };
  }),
  startSeason: () => set((s) => {
    const players = s.pickedIds
      .map((id) => marketPlayers.find((p) => p.name === id))
      .filter(Boolean)
      .map((p) => ({ ...clone(p), history: emptyHistory() }));
    if (!canStartRoster(players).ok) return {};
    return {
      phase: "week",
      players,
      weeklyActions: rollWeeklyActions(),
      logs: [{ week: 1, title: "建队完成", text: pick(narrative.benchNotes) }],
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
    logs: [{ week: 1, title: "继续磨合", text: pick(narrative.benchNotes) }, ...s.logs].slice(0, 80),
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
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, appVersion: APP_VERSION, pendingDecision: null }));
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
  players = players.filter(Boolean);
  if (!players.length) return 0;
  const roles = new Set(players.map((p) => p.role));
  const hasIglOrSupport = players.some((p) => ["IGL", "辅助"].includes(p.role));
  const hasAwper = players.some((p) => p.role === "狙击");
  const hasEntry = players.some((p) => p.role === "突破");
  const lowFloorPenalty = Math.max(0, 72 - Math.min(...players.map((p) => p.rating))) * 2;
  return clamp(roles.size * 16 + (hasIglOrSupport ? 18 : 0) + (hasAwper ? 14 : 0) + (hasEntry ? 12 : 0) - lowFloorPenalty);
}

function canStartRoster(players) {
  players = players.filter(Boolean);
  if (players.length !== 5) return { ok: false, reason: "需要选满 5 人" };
  const rating = rosterRating(players);
  const hltvAvg = players.reduce((sum, p) => sum + p.hltvRating, 0) / players.length;
  const balance = balanceScore(players);
  const lowCount = players.filter((p) => p.rating < MIN_INTERNAL_RATING || p.hltvRating < 0.98).length;
  if (hltvAvg < MIN_AVG_HLTV) return { ok: false, reason: `最低平均 HLTV rating ${MIN_AVG_HLTV.toFixed(2)}，当前 ${hltvAvg.toFixed(2)}` };
  if (rating < MIN_INTERNAL_RATING) return { ok: false, reason: `最低结构评分 ${MIN_INTERNAL_RATING}，当前 ${rating}` };
  if (lowCount > 2) return { ok: false, reason: `低评分选手最多 2 人，当前 ${lowCount} 人` };
  if (balance < MIN_BALANCE_SCORE) return { ok: false, reason: `阵容结构不足，当前平衡 ${balance}` };
  return { ok: true, reason: `结构完整 / 平均 rating ${hltvAvg.toFixed(2)}` };
}

function economyLabel(state) {
  return economyStates[state]?.label || "FULL BUY";
}

function initialEconomyState() {
  return pick(["fullbuy", "fullbuy", "fullbuy", "force", "force", "broken", "lastbuy"]);
}

function economyValueForState(state) {
  const base = economyStates[state]?.value ?? economyStates.fullbuy.value;
  return clamp(base + Math.round(Math.random() * 8 - 4));
}

function deriveEconomyState(score, economy, previousState, won, ctx = {}) {
  const pressure = Math.max(score, ctx.opponentScore || 0) >= 10;
  if (won) {
    if (previousState === "broken" && economy < 50) return "force";
    if (previousState === "eco" && economy < 48) return Math.random() > 0.45 ? "force" : "fullbuy";
    if (economy >= 48) return "fullbuy";
    return "force";
  }
  if (previousState === "lastbuy") return economy < 34 ? "broken" : "force";
  if (pressure && economy < 58) return "lastbuy";
  if (economy < 22) return "broken";
  if (economy < 34) return "eco";
  if (economy < 50) return "force";
  return Math.random() > 0.62 ? "force" : "fullbuy";
}

function economyModifier(usState, themState) {
  return (economyStates[usState]?.win || 0) - (economyStates[themState]?.win || 0);
}

function weaponForEconomy(role, economyState) {
  if (economyState === "fullbuy") return pick(weaponByRole[role] || ["AK-47", "M4A1-S"]);
  const pool = [...(weaponPoolByEconomyState[economyState] || weaponPoolByEconomyState.force)];
  if (economyState === "lastbuy" && role === "狙击") pool.push("AWP", "SSG 08");
  if (economyState === "force" && role === "狙击") pool.push("AWP", "SSG 08");
  if (economyState === "force" && role === "突破") pool.push("Tec-9", "XM1014");
  if (economyState === "broken" && role === "辅助") pool.push("MP9");
  return pick(pool);
}

function startMatchState(s, action) {
  if (!action) return {};
  const opponent = s.week === 5 ? opponents[0] : pick(opponents);
  const script = s.week === 5 ? "宿命局" : pick(Object.keys(scriptProfiles));
  const startingSide = Math.random() > 0.5 ? "CT" : "T";
  const economyStateUs = initialEconomyState();
  const economyStateThem = initialEconomyState();
  const economyUs = economyValueForState(economyStateUs);
  const economyThem = economyValueForState(economyStateThem);
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
      economyUs,
      economyThem,
      economyStateUs,
      economyStateThem,
      coach: { ...action.style },
      timeouts: 3,
      adjustCount: 0,
      usedDecisionRounds: [],
      pendingConsequences: [],
      opponentState: { pattern: 0, adaptedTo: [], roundsSinceAdapt: 0, recent: [] },
      startingSide,
      playerState: initPlayerState(s.players, startingSide, economyStateUs),
      lines: [{ tone: "event", text: `赛事导播切入 ${opponent.name}。${economyLabel(economyStateUs)} 开局。赛前方向：「${action.title}」。` }],
    },
    lastResult: `${opponent.name} / ${script}`,
  };
}

function initPlayerState(players, side = "CT", economyState = "fullbuy") {
  return players.map((p, index) => ({
    name: p.name,
    role: p.role,
    side,
    hp: 100,
    alive: true,
    weapon: weaponForEconomy(p.role, economyState),
    armor: Math.random() < (economyStates[economyState]?.armor ?? 0.98),
    helmet: Math.random() < (economyStates[economyState]?.helmet ?? 0.9),
    kit: side === "CT" && Math.random() < (economyStates[economyState]?.kit ?? 0.5),
    utility: makeUtility(p.role, side, economyState),
    kills: 0,
    deaths: 0,
  }));
}

function sideForRound(m, nextRound) {
  const start = m.startingSide || "CT";
  if (nextRound < 13) return start;
  return start === "CT" ? "T" : "CT";
}

function makeUtility(role, side, economyState = "fullbuy") {
  const count = economyStates[economyState]?.utility ?? 3;
  const fire = side === "CT" ? "incendiary" : "molotov";
  const weighted = role === "辅助" || role === "IGL"
    ? ["smoke", "flash", "flash", fire, "decoy"]
    : role === "突破"
      ? ["flash", fire, "smoke", "decoy"]
      : ["smoke", "flash", fire, "decoy"];
  const utility = [];
  for (let i = 0; i < count; i += 1) {
    if (Math.random() > (economyState === "eco" || economyState === "broken" ? 0.45 : 0.16)) utility.push(pick(weighted));
  }
  return utility.slice(0, 4);
}

function resetRoundPlayerState(playerState, economyState, side) {
  const cfg = economyStates[economyState] || economyStates.fullbuy;
  return playerState.map((p) => ({
    ...p,
    side,
    hp: 100,
    alive: true,
    weapon: weaponForEconomy(p.role, economyState),
    armor: Math.random() < cfg.armor,
    helmet: Math.random() < cfg.helmet,
    kit: side === "CT" && Math.random() < cfg.kit,
    utility: makeUtility(p.role, side, economyState),
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
  if (m.economyStateUs === "lastbuy") return pick(["clutch", "morale", "info"]);
  if (["eco", "broken"].includes(m.economyStateUs)) return pick(["eco", "eco", "morale"]);
  if (m.economyStateUs === "force") return pick(["gamble", "eco", "duel", "morale"]);
  if (m.economyStateUs === "fullbuy") return pick(["info", "info", "duel", "gamble"]);
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
  const economyState = economyModifier(m.economyStateUs || "fullbuy", m.economyStateThem || "fullbuy");
  const forceSwing = m.economyStateUs === "force" ? Math.round(Math.random() * 8 - 3) : 0;
  const pressure = Math.max(m.us, m.them) >= 10 ? (state.team.morale - 50) * 0.16 + avg(state.players, ["clutch"]) * 0.04 - 3 : 0;
  const trade = node === "duel" || node === "clutch" ? (state.team.chemistry - 50) * 0.08 : 0;
  const tactics = tacticBonus(node, m.coach, m.opponent, state.team);
  return clamp(base + economy + economyState + forceSwing + phaseBias + tactics + pressure + trade - m.adjustCount * 2.4, 8, 92);
}

function shouldAskDecision(m) {
  if (m.usedDecisionRounds.includes(m.round)) return false;
  const profileRounds = scriptProfiles[m.script]?.decisionRounds || [];
  return profileRounds.includes(m.round) || (m.them - m.us >= 3 && m.round > 3) || Math.max(m.us, m.them) === 11;
}

function makeDecisionPrompt(m) {
  const tell = getOpponentTell(m).replace(/^(预警|观察)：/, "").replace(/。$/, "");
  if (m.them - m.us >= 3) return renderTemplate(pick(narrative.decisionPrompts.losing), { tell });
  if (m.adjustCount >= 2) return renderTemplate(pick(narrative.decisionPrompts.adapted), { tell });
  if (Math.max(m.us, m.them) >= 11) return pick(narrative.decisionPrompts.matchPoint);
  return renderTemplate(pick(narrative.decisionPrompts.neutral), { read: tacticalRead(m) });
}

function dynamicInterventions(m) {
  const pool = [...baseInterventions];
  const priority = [];
  if (m.them - m.us >= 3) {
    priority.push(
      { label: "安抚语音", category: "calm", style: { calm: 9, discipline: 4 }, effect: { morale: 6, chemistry: 2 }, risk: "若下一回合仍输，红温概率增加。", backfire: { morale: -4 }, text: "{calm}" },
      { label: "交给明星", category: "star", style: { speed: 4, gamble: 7 }, effect: { morale: 3, chemistry: -3 }, risk: "团队默契低于 55 时容易失败。", requires: { chemistry: 55 }, failChance: 0.48, failEffect: { chemistry: -5 }, backfire: { chemistry: -5 }, text: "{star}" },
    );
  }
  if (m.adjustCount >= 2) {
    priority.push({ label: "假转点骗调整", category: "info", style: { info: 10, discipline: 3 }, effect: { tactics: 3 }, risk: "团队默契低于 56 时可能失败。", requires: { chemistry: 56 }, failChance: 0.42, failEffect: { tactics: -5 }, backfire: { tactics: -5 }, text: "{info}" });
  }
  if (m.economyStateUs === "force") {
    priority.push({ label: "强起赌点", category: "gamble", style: { speed: 5, gamble: 9, economy: -2 }, effect: { morale: 2 }, risk: "输掉后大概率 BROKEN。", backfire: { morale: -4 }, text: "{gamble}" });
  }
  if (m.economyStateUs === "eco" || m.economyStateUs === "broken") {
    priority.push({ label: "ECO 保下回合", category: "calm", style: { calm: 7, economy: 4 }, effect: { tactics: 1, morale: -1 }, risk: "这分胜率很低，但下回合更完整。", backfire: null, text: "下一回合才是真枪。" });
  }
  if (m.economyStateUs === "lastbuy") {
    priority.push({ label: "LAST BUY 慢控", category: "discipline", style: { discipline: 7, calm: 3 }, effect: { tactics: 2 }, risk: "战术执行低于 60 时会断档。", requires: { tactics: 60 }, failChance: 0.38, failEffect: { tactics: -4, morale: -2 }, backfire: { morale: -5 }, text: "{discipline}" });
  }
  return [...priority, ...shuffle(pool)].slice(0, 3);
}

function applyDecisionState(s, option) {
  const timeoutCost = s.pendingDecision?.timeoutCost ? 1 : 0;
  const conditionalFailed = decisionFailed(s.team, option);
  const effect = conditionalFailed ? option.failEffect || {} : option.effect || {};
  const pending = !conditionalFailed && option.backfire ? [{ condition: "nextRoundLoss", effect: option.backfire, label: option.risk }] : [];
  const category = conditionalFailed ? "fail" : option.category;
  const resultText = renderDecisionText(pick(narrative.interventionResults[category] || narrative.interventionResults.discipline), s);
  return {
    pendingDecision: null,
    team: applyTeamEffect(s.team, effect),
    currentMatch: {
      ...s.currentMatch,
      coach: mergeStyle(s.currentMatch.coach, option.style),
      timeouts: s.currentMatch.timeouts - timeoutCost,
      pendingConsequences: [...s.currentMatch.pendingConsequences, ...pending],
      usedDecisionRounds: [...s.currentMatch.usedDecisionRounds, s.currentMatch.round],
      lines: [...s.currentMatch.lines, { tone: conditionalFailed ? "bad" : "event", text: `干涉：${resultText}` }],
    },
  };
}

function decisionFailed(team, option) {
  if (!option.requires) return false;
  const missing = Object.entries(option.requires).some(([key, value]) => (team[key] || 0) < value);
  return missing && Math.random() < (option.failChance || 0.4);
}

function activePause() {
  const s = store.getState();
  const m = s.currentMatch;
  if (s.phase !== "match" || s.pendingDecision || !m || m.timeouts <= 0) return;
  store.getState().setDecision({
    prompt: `暂停窗口。还剩 ${m.timeouts} 次。${tacticalRead(m)}`,
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
  const usEco = `${economyLabel(m.economyStateUs)}：${pick(narrative.economyLines[m.economyStateUs] || narrative.economyLines.fullbuy)}`;
  const themEco = `对手 ${economyLabel(m.economyStateThem)}。`;
  const adapt = `对手适应进度 ${Math.min(100, Math.round((m.opponentState.roundsSinceAdapt / m.opponent.adaptSpeed) * 100))}%。`;
  return `近三回合：${recent}。${usEco} ${themEco}${adapt}`;
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
  const economyStateUs = deriveEconomyState(us, economyUs, m.economyStateUs, won, { opponentScore: them });
  const economyStateThem = deriveEconomyState(them, economyThem, m.economyStateThem, !won, { opponentScore: us });
  const adjustTriggered = !won && ["info", "gamble", "duel"].includes(node);
  const adjustCount = m.adjustCount + (adjustTriggered ? 1 : 0);
  const opponentState = updateOpponentState(m, node, adjustTriggered);
  const playerState = updatePlayerState(state, won, node, economyStateUs, sideForRound(m, round + 1));
  const consequence = resolveConsequences(m.pendingConsequences, won);
  const nextTeam = consequence.effect ? applyTeamEffect(state.team, consequence.effect) : state.team;
  store.getState().appendLine(makeRoundLine({ ...state, team: nextTeam }, { node, prob, won, us, them, round, adjustCount, consequence }));
  store.getState().updateMatch({ round, us, them, economyUs, economyThem, economyStateUs, economyStateThem, adjustCount, opponentState, playerState, pendingConsequences: consequence.remaining });
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

function updatePlayerState(state, won, node, economyState, side) {
  const m = state.currentMatch;
  const next = resetRoundPlayerState(m.playerState, economyState, side);
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
  const shot = renderTemplate(pick(narrative.broadcastShots), { player: p.name });
  const economyLine = `<b>${economyLabel(state.currentMatch.economyStateUs)}：</b>${pick(narrative.economyLines[state.currentMatch.economyStateUs] || narrative.economyLines.fullbuy)}`;
  const adjust = ctx.adjustCount >= 2 && !ctx.won ? "<br><b>预警：</b>对手已经开始根据你的转点节奏提前站位。" : "";
  const consequence = ctx.consequence.text ? `<br><b>${ctx.consequence.text}</b>` : "";
  return { tone: ctx.won ? "good" : "bad", text: `<small>R${ctx.round} / ${ctx.us}:${ctx.them} / ${title} / ${economyLabel(state.currentMatch.economyStateUs)} / 参考胜率 ${ctx.prob.toFixed(0)}%</small>${shot}<br>${economyLine}<br>${detail}<br>${action}<br>${intel}${adjust}${consequence}<br><span class="caster">${cast}</span>` };
}

function winAction(p, node, star) {
  return renderTemplate(pick(narrative.roundWinLines[node]), { player: p.name, star });
}

function loseAction(p, star, node) {
  return renderTemplate(pick(narrative.roundLoseLines[node]), { player: p.name, star });
}

function intelLine(m, node, won) {
  const eco = `我方 ${economyLabel(m.economyStateUs)}，对手 ${economyLabel(m.economyStateThem)}。`;
  const pattern = pick(narrative.mapTactics[m.map] || m.opponent.patterns);
  const read = won ? `你们刚抓到「${pattern}」。` : `对手直接「${pattern}」。`;
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
  const headline = won ? pick(["结构撑到了最后。", "暂停回来，比赛变了。", "这队终于像一支队了。"]) : pick(["火力够了，但残局太薄。", "中期读盘被拆。", "有明星，但没人托底。"]);
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
  const pickedIds = (s.pickedIds || []).filter((id) => marketPlayers.some((p) => p.name === id));
  const selectedPlayers = pickedIds.map((id) => marketPlayers.find((p) => p.name === id));
  const gate = canStartRoster(selectedPlayers);
  $("budgetText").textContent = `预算 $${s.budget}`;
  $("pickedText").textContent = `已选 ${pickedIds.length} / 5`;
  $("rosterGate").textContent = gate.reason;
  $("rosterGate").className = gate.ok ? "gate ok" : "gate";
  $("startSeasonBtn").disabled = !gate.ok;
  $("market").innerHTML = marketPlayers.map((p) => {
    const selected = pickedIds.includes(p.name);
    const disabled = !selected && (pickedIds.length >= 5 || s.budget < p.price);
    const img = p.photo ? `<img src="${p.photo}" alt="${p.name}" loading="lazy" onerror="this.classList.add('broken')" />` : "";
    return `<button class="player-card ${selected ? "selected" : ""}" ${disabled ? "disabled" : ""} data-pick="${p.name}" type="button">
      <div class="portrait">${img}<span>${p.name.slice(0, 2)}</span></div>
      <div class="player-card-body">
        <h3><span>${p.name}</span><span>$${p.price}</span></h3>
        <p>${p.role} / ${p.tag} / ${p.voice}</p>
        <div class="mini"><span>HLTV ${formatHltvRating(p.hltvRating)}</span>${eliteLabel(p) ? `<span>${eliteLabel(p)}</span>` : ""}${playerStatDefs.map(([l, k]) => `<span>${l}${p[k]}</span>`).join("")}</div>
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

function hudIcon(type, label, active = true) {
  const cls = active ? "hud-icon" : "hud-icon off";
  const body = {
    rifle: '<path d="M3 11h10l2-2h5v3h-4l-2 2H8l-1 3H4l1-3H3z" />',
    awp: '<path d="M2 10h13l2-2h3v2h-3l-2 2H9l-2 3H4l2-3H2z" /><circle cx="13" cy="8" r="2" />',
    pistol: '<path d="M5 9h10l2 2v2h-5l-1 4H8l1-4H5z" />',
    smg: '<path d="M4 9h11l3 2v2h-5l-1 3H8l1-3H4z" />',
    shotgun: '<path d="M3 10h13l4 2v2h-8l-2 3H6l2-3H3z" /><path d="M13 10l2-2h3" />',
    armor: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />',
    helmet: '<path d="M4 13a8 8 0 0 1 16 0v4H4z" /><path d="M5 13h14" />',
    kit: '<path d="M7 7h10v12H7z" /><path d="M10 7V5h4v2M9 13h6M12 10v6" />',
    smoke: '<circle cx="9" cy="13" r="3" /><path d="M12 10c1-3 5-2 5-6M8 10C7 7 3 8 4 4" />',
    flash: '<path d="M12 3l2 6h6l-5 4 2 7-5-4-5 4 2-7-5-4h6z" />',
    molotov: '<path d="M10 8h4l1 10H9z" /><path d="M12 8c-2-2 1-3 0-5 4 3 3 5 0 5z" />',
    decoy: '<path d="M8 6h8v12H8z" /><path d="M10 9h4M10 12h4M10 15h2" />',
  }[type] || '<circle cx="12" cy="12" r="6" />';
  return `<span class="${cls}" title="${label}" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg></span>`;
}

function weaponIcon(weapon) {
  if (weapon === "AWP" || weapon === "SSG 08") return hudIcon("awp", weapon);
  if (["Deagle", "Tec-9", "Five-SeveN"].includes(weapon)) return hudIcon("pistol", weapon);
  if (["MP9", "UMP-45", "MAC-10"].includes(weapon)) return hudIcon("smg", weapon);
  if (["XM1014", "MAG-7"].includes(weapon)) return hudIcon("shotgun", weapon);
  return hudIcon("rifle", weapon);
}

function utilityIcons(utility = []) {
  const types = ["molotov", "smoke", "flash", "decoy"];
  const labels = { molotov: "燃烧瓶/燃烧弹", smoke: "烟雾弹", flash: "闪光弹", decoy: "诱饵弹" };
  return types.map((type) => {
    const hasFire = type === "molotov" && (utility.includes("molotov") || utility.includes("incendiary"));
    return hudIcon(type, labels[type], hasFire || utility.includes(type));
  }).join("");
}

function renderSpectatorRoster(players) {
  return players.map((p, i) => `<div class="spectator ${p.side.toLowerCase()} ${p.alive ? "" : "dead"}">
    <span class="num">${i + 1}</span>
    <strong><span>${p.side}</span> ${p.name}</strong>
    <span class="hp">HP ${p.hp}</span>
    <span class="kd">${p.kills}/${p.deaths}</span>
    <span class="weapon-slot">${weaponIcon(p.weapon)}</span>
    <span class="armor-slot">${hudIcon("armor", "防弹衣", p.armor)}${hudIcon("helmet", "头盔", p.helmet)}${hudIcon("kit", "拆弹器", p.kit)}</span>
    <span class="utility-slot">${utilityIcons(p.utility)}</span>
  </div>`).join("");
}

function renderActions(s) {
  $("actions").classList.toggle("hidden", s.phase !== "week");
  const hint = s.week === 1 && s.wins === 0 && s.losses === 0 ? `<div class="action-hint">${narrative.firstActionHint}</div>` : "";
  const actions = (s.weeklyActions || []).map((action) => {
    const fresh = weeklyDeck.find((a) => a.id === action?.id);
    return fresh ? { ...fresh, ...action, tags: action.tags || fresh.tags } : action;
  }).filter((action) => action?.id);
  $("actions").innerHTML = `${hint}${actions.map((a) => `<button class="action-card" data-action="${a.id}" type="button"><h3>${a.title}</h3><p>${a.text}</p><span class="tag">${(a.tags || []).join(" / ")}</span></button>`).join("")}`;
  document.querySelectorAll("[data-action]").forEach((btn) => btn.addEventListener("click", () => store.getState().startMatch(actions.find((a) => a.id === btn.dataset.action))));
}

function renderDecision(s) {
  $("decisionBox").classList.toggle("hidden", !s.pendingDecision);
  if (!s.pendingDecision) return;
  $("decisionText").textContent = s.pendingDecision.prompt;
  $("decisionOptions").innerHTML = s.pendingDecision.options.map((o, i) => `<button class="decision-option" data-decision="${i}" type="button"><strong>${o.label}</strong><small>${o.risk || "没有免费答案。"}</small></button>`).join("");
  document.querySelectorAll("[data-decision]").forEach((btn) => btn.addEventListener("click", () => store.getState().applyDecision(s.pendingDecision.options[Number(btn.dataset.decision)])));
}

function renderEconomyTag(label, state) {
  return `<span class="tag econ-tag econ-${state}">${label} ${economyLabel(state)}</span>`;
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
  $("matchMeta").innerHTML = [
    `<span class="tag">R${m.round + 1} ${sideForRound(m, m.round + 1)}</span>`,
    renderEconomyTag("我方", m.economyStateUs || "fullbuy"),
    renderEconomyTag("对手", m.economyStateThem || "fullbuy"),
    `<span class="tag">剧本 ${m.script}</span>`,
    `<span class="tag">调整 ${m.adjustCount}</span>`,
  ].join("");
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

function on(id, event, handler) {
  const node = $(id);
  if (node) node.addEventListener(event, handler);
}

on("startSeasonBtn", "click", () => store.getState().startSeason());
on("newSeasonBtn", "click", () => { if (confirm("确定变阵重组？当前存档会被覆盖。")) store.getState().newSeason(); });
on("restartBtn", "click", () => store.getState().newSeason());
on("continueBtn", "click", () => store.getState().continueSeason());
on("activePauseBtn", "click", activePause);
on("readGameBtn", "click", readGame);
on("nextRoundBtn", "click", playNextRound);
on("nextWeekBtn", "click", () => store.getState().nextWeek());
on("infoBtn", "click", () => $("infoModal")?.classList.remove("hidden"));
on("closeInfoBtn", "click", () => $("infoModal")?.classList.add("hidden"));
on("infoModal", "click", (event) => {
  if (event.target.id === "infoModal") $("infoModal")?.classList.add("hidden");
});

render();
