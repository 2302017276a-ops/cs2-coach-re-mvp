import { createStore } from "https://esm.sh/zustand@5.0.8/vanilla";

const SAVE_KEY = "cs2-coach-season-v2";
const SEASON_WEEKS = 20;

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

const basePlayers = [
  { name: "donk", role: "突破手", trait: "红温巨星", aim: 98, sense: 80, mental: 68, teamwork: 62, market: 94, fatigue: 20 },
  { name: "siuhy", role: "IGL", trait: "年轻指挥", aim: 76, sense: 88, mental: 82, teamwork: 86, market: 68, fatigue: 18 },
  { name: "ropz", role: "自由人", trait: "冷静大脑", aim: 88, sense: 95, mental: 88, teamwork: 82, market: 78, fatigue: 16 },
  { name: "flameZ", role: "辅助位", trait: "牺牲型拼图", aim: 80, sense: 78, mental: 82, teamwork: 92, market: 64, fatigue: 18 },
  { name: "m0NESY", role: "狙击手", trait: "镜头制造机", aim: 96, sense: 86, mental: 78, teamwork: 68, market: 96, fatigue: 22 },
];

const actions = [
  {
    id: "train",
    title: "📋 高强度战术训练",
    text: "练地图池、默认控图和暂停后的执行。选手会累，但战术会更像一支队伍。",
    effect: { tactics: 9, chemistry: 3, morale: -2 },
    fatigue: 8,
  },
  {
    id: "rest",
    title: "🧊 放假半天",
    text: "减少疲劳，保护心态。代价是这周看起来没什么进步，老板会皱眉。",
    effect: { morale: 8, chemistry: 3, fame: -1 },
    fatigue: -12,
  },
  {
    id: "media",
    title: "📱 直播营业",
    text: "提高名气和粉丝支持，但直播间总有机会制造新素材。",
    effect: { fame: 8, fans: 9, money: 3, tactics: -2 },
    fatigue: 4,
  },
  {
    id: "psych",
    title: "🧠 心态会议",
    text: "教练组单独约谈核心选手，试图让红温变成输出，而不是爆炸。",
    effect: { morale: 6, chemistry: 4, tactics: 1 },
    fatigue: -4,
  },
  {
    id: "scrim",
    title: "🔥 约顶级队训练赛",
    text: "赢了自信爆棚，输了全队沉默。无论如何，比赛内容会很真实。",
    effect: { tactics: 5, fame: 2, morale: -3 },
    fatigue: 10,
  },
  {
    id: "sponsor",
    title: "💰 安抚赞助商",
    text: "拿钱、拍照、说漂亮话。战队不是只靠爆头活着，有时还靠 PPT。",
    effect: { money: 10, fame: 4, morale: -3, fans: -1 },
    fatigue: 3,
  },
];

const randomEvents = [
  {
    id: "donk_tilt",
    title: "🔥 donk 又红温了？",
    condition: (s) => avgFatigue(s.players) > 42 || s.team.morale < 48,
    weight: (s) => 8 + Math.max(0, 55 - s.team.morale) / 3 + avgFatigue(s.players) / 8,
    text: "训练室门没关严，外面的人都听见 donk 说：如果下一张图还让我等烟散，我不如去打死斗。",
    effect: { morale: -6, chemistry: -5, fame: 5, tactics: 2 },
    player: { name: "donk", mental: -5, fatigue: 6 },
  },
  {
    id: "stream_fail",
    title: "📱 直播事故",
    condition: (s) => s.team.fame > 38,
    weight: (s) => 9 + s.team.fame / 10,
    text: "队员直播时嘴快，把训练赛比分说漏了。弹幕笑疯了，对手分析师也笑疯了。",
    effect: { fame: 8, fans: 4, tactics: -7, morale: -3 },
  },
  {
    id: "strat_leak",
    title: "📋 战术泄露",
    condition: (s) => s.team.tactics > 50,
    weight: (s) => 7 + s.team.tactics / 14,
    text: "一张战术截图流到社区。好消息是大家夸你有东西，坏消息是对手也看见了。",
    effect: { tactics: -9, fame: 5, fans: 2 },
  },
  {
    id: "sponsor_pressure",
    title: "💰 赞助商施压",
    condition: (s) => s.team.money < 55 || s.team.fame > 60,
    weight: (s) => 10 + Math.max(0, 60 - s.team.money) / 5,
    text: "赞助商希望 m0NESY 多直播两小时。你说他要训练，赞助商说他们也要 KPI。",
    effect: { money: 8, morale: -5, fans: 3 },
    player: { name: "m0NESY", fatigue: 7, mental: -3 },
  },
  {
    id: "throw_mood",
    title: "🪑 选手摆烂",
    condition: (s) => s.team.morale < 45 || s.team.chemistry < 42,
    weight: (s) => 8 + Math.max(0, 50 - s.team.chemistry) / 3,
    text: "有人训练赛只报了三次信息，其中两次是“我白给了”。录像里看不出战术，只看得出不想上班。",
    effect: { morale: -7, chemistry: -6, tactics: -3 },
    fatigueAll: -3,
  },
  {
    id: "rookie_pop",
    title: "✨ 天才新人爆发",
    condition: (s) => s.week > 2,
    weight: (s) => 8 + s.team.chemistry / 18,
    text: "二队小孩训练赛打出 31 杀，主力席突然安静。你第一次认真思考：替补席是不是太短了？",
    effect: { fame: 5, fans: 7, morale: 4 },
    player: { name: "flameZ", aim: 3, mental: 3 },
  },
  {
    id: "niko_meme",
    title: "😶 社区开始复读 NiKo 梗",
    condition: (s) => s.losses > s.wins,
    weight: (s) => 7 + s.losses,
    text: "虽然 NiKo 不在你队里，但弹幕还是刷了。互联网的记忆不讲逻辑，只讲节目效果。",
    effect: { fame: 6, fans: -4, morale: -3 },
  },
  {
    id: "igl_authority",
    title: "🎧 IGL 权威回来了",
    condition: (s) => s.team.tactics > 58 && s.team.chemistry > 50,
    weight: (s) => 6 + s.team.tactics / 16,
    text: "siuhy 复盘时暂停了三次录像，没人打断。他说下一场这么打，所有人都点头。",
    effect: { tactics: 6, chemistry: 5, morale: 2 },
    player: { name: "siuhy", sense: 3, mental: 2 },
  },
  {
    id: "fans_back",
    title: "💚 粉丝逆风护队",
    condition: (s) => s.team.fans > 55 && s.team.morale < 55,
    weight: (s) => 8 + s.team.fans / 16,
    text: "输比赛后，评论区竟然没有爆炸。粉丝剪了一个《我们还会回来》的视频，全队都看完了。",
    effect: { morale: 8, chemistry: 3, fans: 2 },
  },
  {
    id: "money_alarm",
    title: "🏢 财务警报",
    condition: (s) => s.team.money < 35,
    weight: (s) => 18,
    text: "老板发来一句：如果下周还没有结果，我们就要讨论预算。没有标点，但很有杀伤力。",
    effect: { morale: -5, tactics: -2, money: -2 },
  },
];

const killLines = [
  "{p} 第一枪把对面定在烟边，镜头甚至没来得及切。",
  "{p} 残局 1v2，先骗拆再横拉，语音里有人小声说了句：卧槽。",
  "{p} 的补枪慢了半秒，半秒足够把回合送走。",
  "{p} 前压拿到信息，但撤退路线被燃烧弹切断。",
  "{p} 没等 call 就干拉出去。坏消息是不纪律，好消息是杀了两个。",
  "{p} 空了一枪，弹幕已经开始提前打分。",
];

const tacticLines = [
  "默认控图很干净，像训练室里排练过二十遍。",
  "B 点爆弹晚了 1 秒，所有人都知道这 1 秒是谁的问题。",
  "对手赌对了你的提速 timing，战术本被翻到了同一页。",
  "暂停后的第一回合执行成功，教练席终于像有人在上班。",
  "队伍选择强起，四把短枪打出了五个人的心率。",
];

const mentalLines = [
  "donk 的语音音量上来了，准星也上来了。",
  "m0NESY 笑了一下，这通常意味着有人要进集锦。",
  "siuhy 连续说了三遍慢点，第三遍已经不太像请求。",
  "ropz 绕后成功，但包点已经没人能等他了。",
  "flameZ 又给队友丢出一颗好闪，数据表不会记得，队友会。",
];

const decisions = [
  {
    prompt: "关键节点：队伍连丢两段，donk 开始在语音里顶 call。你怎么处理？",
    options: [
      { label: "叫暂停，压住情绪", effect: { morale: 3, tactics: 5, chemistry: 2 }, player: { name: "donk", mental: -2 }, text: "你叫了暂停，第一句话不是战术，是让所有人把耳机音量调低。" },
      { label: "放权 donk，给他资源", effect: { fame: 4, fans: 3, chemistry: -4 }, player: { name: "donk", aim: 3, fatigue: 5 }, text: "你把第一枪交给 donk。战术变薄了，但空气变烫了。" },
      { label: "让 siuhy 继续 call", effect: { tactics: 6, chemistry: 4, morale: -2 }, player: { name: "siuhy", mental: 3 }, text: "你公开支持 IGL。有人沉默，但下一回合至少所有人走在同一张地图上。" },
    ],
  },
  {
    prompt: "赛点前：经济很差，但对手也开始发抖。你要赌吗？",
    options: [
      { label: "强起，抢节奏", effect: { fame: 5, fans: 4, morale: -3 }, text: "你选择把下周的血压也借到这一回合。弹幕喜欢，财务不一定。" },
      { label: "保守 eco，打最终局", effect: { tactics: 4, morale: 2, fans: -2 }, text: "你选择活到下一回合。它不酷，但它像一个成年人。" },
      { label: "临时换战术，打冷门点", effect: { tactics: -2, chemistry: 3, fame: 2 }, text: "你合上旧战术本，画了一个连你自己都觉得有点野的箭头。" },
    ],
  },
];

const $ = (id) => document.getElementById(id);
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function avgFatigue(players) {
  return players.reduce((sum, p) => sum + p.fatigue, 0) / players.length;
}

function createInitialState() {
  return {
    week: 1,
    team: {
      money: 65,
      morale: 58,
      fame: 42,
      tactics: 50,
      chemistry: 52,
      fans: 46,
    },
    players: structuredClone(basePlayers),
    logs: [
      {
        week: 1,
        title: "赛季开始",
        text: "老板只给了 20 周。你看着首发名单，心里很清楚：这个项目成败不取决于谁最会说话，取决于谁先红温。",
      },
    ],
    currentMatch: null,
    wins: 0,
    losses: 0,
    bestStreak: 0,
    currentStreak: 0,
    tiltCount: 0,
    famousMoments: [],
    seasonEnded: false,
    lastResult: "等待第一场比赛",
    busy: false,
    savedAt: Date.now(),
  };
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialState();
    const saved = JSON.parse(raw);
    return { ...createInitialState(), ...saved, busy: false, currentMatch: null };
  } catch {
    return createInitialState();
  }
}

const store = createStore((set, get) => ({
  ...loadSavedState(),
  startNewSeason: () => set(createInitialState()),
  clearLog: () => set({ logs: [] }),
  setBusy: (busy) => set({ busy }),
  addLog: (title, text) =>
    set((s) => ({
      logs: [{ week: s.week, title, text }, ...s.logs].slice(0, 80),
    })),
  applyTeamEffect: (effect = {}) =>
    set((s) => ({
      team: Object.fromEntries(
        Object.entries(s.team).map(([key, value]) => [key, key === "money" ? clamp(value + (effect[key] || 0), 0, 999) : clamp(value + (effect[key] || 0))])
      ),
    })),
  applyPlayerEffect: (effect = {}) =>
    set((s) => ({
      players: s.players.map((player) => {
        if (effect.name && effect.name !== player.name) return player;
        const next = { ...player };
        for (const [key, value] of Object.entries(effect)) {
          if (key !== "name" && key in next) next[key] = clamp(next[key] + value);
        }
        return next;
      }),
    })),
  applyFatigueAll: (amount) =>
    set((s) => ({
      players: s.players.map((player) => ({ ...player, fatigue: clamp(player.fatigue + amount) })),
    })),
  setCurrentMatch: (currentMatch) => set({ currentMatch }),
  appendMatchLine: (line) =>
    set((s) => ({
      currentMatch: {
        ...s.currentMatch,
        lines: [...s.currentMatch.lines, line],
      },
    })),
  updateScore: (us, them) =>
    set((s) => ({
      currentMatch: { ...s.currentMatch, us, them },
    })),
  finishWeek: (won, summary) =>
    set((s) => {
      const wins = s.wins + (won ? 1 : 0);
      const losses = s.losses + (won ? 0 : 1);
      const currentStreak = won ? s.currentStreak + 1 : 0;
      const nextWeek = s.week + 1;
      const seasonEnded = nextWeek > SEASON_WEEKS;
      return {
        wins,
        losses,
        currentStreak,
        bestStreak: Math.max(s.bestStreak, currentStreak),
        week: seasonEnded ? s.week : nextWeek,
        seasonEnded,
        currentMatch: null,
        lastResult: summary,
        busy: false,
      };
    }),
  markTilt: () => set((s) => ({ tiltCount: s.tiltCount + 1 })),
  addMoment: (moment) => set((s) => ({ famousMoments: [moment, ...s.famousMoments].slice(0, 8) })),
}));

store.subscribe((state) => {
  const toSave = { ...state, busy: false, currentMatch: null, savedAt: Date.now() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  render();
});

function weightedEvent(state) {
  const candidates = randomEvents
    .filter((event) => event.condition(state))
    .map((event) => ({ event, weight: Math.max(1, event.weight(state)) }));
  const pool = candidates.length ? candidates : randomEvents.map((event) => ({ event, weight: 1 }));
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item.event;
  }
  return pool[0].event;
}

function teamPower(state) {
  const playerPower =
    state.players.reduce((sum, p) => {
      const fatiguePenalty = p.fatigue * 0.32;
      return sum + p.aim * 0.3 + p.sense * 0.22 + p.mental * 0.18 + p.teamwork * 0.18 + p.market * 0.04 - fatiguePenalty;
    }, 0) / state.players.length;

  return (
    playerPower * 0.58 +
    state.team.tactics * 0.16 +
    state.team.morale * 0.12 +
    state.team.chemistry * 0.1 +
    state.team.fans * 0.04
  );
}

function applyEffectBundle(bundle) {
  const state = store.getState();
  state.applyTeamEffect(bundle.effect);
  if (bundle.player) state.applyPlayerEffect(bundle.player);
  if (bundle.fatigueAll) state.applyFatigueAll(bundle.fatigueAll);
}

async function runWeek(actionId) {
  const state = store.getState();
  if (state.busy || state.seasonEnded) return;
  const action = actions.find((item) => item.id === actionId);
  state.setBusy(true);
  state.applyTeamEffect(action.effect);
  state.applyFatigueAll(action.fatigue);
  state.addLog("本周行动", `${action.title}：${action.text}`);

  await sleep(450);
  const event = weightedEvent(store.getState());
  applyEffectBundle(event);
  if (event.id === "donk_tilt") store.getState().markTilt();
  store.getState().addLog(event.title, event.text);

  await sleep(650);
  await simulateMatch(event);
}

async function simulateMatch(event) {
  const state = store.getState();
  const opponent = pick(["FaZe Clan", "Falcons", "Vitality", "MOUZ", "NAVI", "Spirit", "G2", "FURIA"]);
  const map = pick(["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust2"]);
  store.getState().setCurrentMatch({
    opponent,
    map,
    us: 0,
    them: 0,
    lines: [],
  });

  const opening = `本周对手：${opponent}，地图：${map}。赛前事件是「${event.title}」，所以这场比赛从 BP 阶段就带着一点火药味。`;
  store.getState().appendMatchLine({ tone: "event", text: opening });

  let us = 0;
  let them = 0;
  const snapshots = 12;
  for (let i = 1; i <= snapshots; i++) {
    await sleep(520);
    const latest = store.getState();
    const power = teamPower(latest) + (Math.random() * 24 - 12);
    const wonSegment = power > 57 + Math.random() * 16;
    const swing = Math.random() < 0.18 ? 2 : 1;
    if (wonSegment) us += swing;
    else them += swing;
    store.getState().updateScore(us, them);

    const player = pick(latest.players);
    const line = buildRoundLine(i, player, wonSegment);
    store.getState().appendMatchLine({ tone: wonSegment ? "good" : "bad", text: line });

    if (i === 5 || i === 9) {
      const decision = decisions[i === 5 ? 0 : 1];
      const choice = await askDecision(decision);
      applyEffectBundle(choice);
      store.getState().appendMatchLine({ tone: "event", text: `教练决策：${choice.text}` });
      await sleep(350);
    }
  }

  if (us === them) {
    const overtimeRare = Math.random() < 0.08;
    if (overtimeRare) {
      store.getState().appendMatchLine({ tone: "event", text: "比分被拖进加时。全队看起来像刚被 Windows 更新强制重启。" });
      await sleep(520);
      const wonOT = teamPower(store.getState()) + Math.random() * 15 > 62;
      if (wonOT) us += 2;
      else them += 2;
    } else {
      if (teamPower(store.getState()) > 58) us += 1;
      else them += 1;
    }
  }

  const won = us > them;
  store.getState().updateScore(us, them);
  const result = won ? `第 ${state.week} 周胜利 ${us}:${them}` : `第 ${state.week} 周失利 ${us}:${them}`;
  const moment = won
    ? pick([`donk 红温但杀完了，${us}:${them}`, `暂停救了整场，${us}:${them}`, `m0NESY 把残局打成短视频，${us}:${them}`])
    : pick([`战术泄露后的第一场，${us}:${them}`, `语音爆炸，比分也爆炸，${us}:${them}`, `粉丝还在，比分没了，${us}:${them}`]);
  store.getState().addMoment(moment);
  store.getState().addLog(won ? "比赛胜利" : "比赛失利", `${result}。本场名场面：${moment}`);
  store.getState().applyTeamEffect(won ? { money: 4, morale: 7, fame: 5, fans: 5, chemistry: 3 } : { morale: -7, fame: 2, fans: -4, chemistry: -3 });
  store.getState().applyFatigueAll(6);
  await sleep(500);
  store.getState().finishWeek(won, result);
}

function buildRoundLine(index, player, won) {
  const phase = ["开局", "控图", "第一波接触", "经济局", "暂停后", "半场前", "换边", "对手变阵", "队内分歧", "压力局", "赛点前", "终局"][index - 1];
  const base = pick([pick(killLines), pick(tacticLines), pick(mentalLines)]).replace("{p}", player.name);
  const tail = won
    ? pick(["这一段你们拿下了，比分板终于肯讲点人情。", "队伍语音短暂变亮，像有人打开了窗。", "弹幕开始刷：教练刚才是不是会点东西？"])
    : pick(["这一段丢了，摄像头切到教练席时你刚好没表情。", "语音里没人吵，但这种安静通常更危险。", "对手没有打得多神，只是你们犯错很准时。"]);
  return `第 ${index} 镜头｜${phase}：${base} ${tail}`;
}

function askDecision(decision) {
  return new Promise((resolve) => {
    $("decisionBox").classList.remove("hidden");
    $("decisionText").textContent = decision.prompt;
    $("decisionOptions").innerHTML = decision.options
      .map((option, index) => `<button class="decision-option" type="button" data-decision="${index}">${option.label}</button>`)
      .join("");
    document.querySelectorAll("[data-decision]").forEach((button) => {
      button.addEventListener("click", () => {
        $("decisionBox").classList.add("hidden");
        resolve(decision.options[Number(button.dataset.decision)]);
      });
    });
  });
}

function render() {
  const state = store.getState();
  $("seasonLine").textContent = `第 ${state.week} 周 / ${SEASON_WEEKS} 周`;
  $("recordLine").textContent = `${state.wins}W-${state.losses}L`;
  $("lastResult").textContent = state.lastResult;
  $("saveStatus").textContent = `已自动存档 · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  $("weekTitle").textContent = state.seasonEnded ? "赛季结束" : state.busy ? "本周正在推进" : "选择本周行动";

  renderTeamStats(state);
  renderRoster(state);
  renderActions(state);
  renderLog(state);
  renderMatch(state);
  renderSeasonEnd(state);
}

function renderTeamStats(state) {
  $("teamStats").innerHTML = teamStatDefs
    .map(([label, key, prefix]) => {
      const value = state.team[key];
      const width = key === "money" ? Math.min(100, value) : value;
      return `
        <div class="stat-row">
          <div class="stat-top"><span>${label}</span><b>${prefix}${value}</b></div>
          <div class="bar"><span style="width:${width}%"></span></div>
        </div>
      `;
    })
    .join("");
}

function renderRoster(state) {
  $("roster").innerHTML = state.players
    .map(
      (player) => `
        <div class="player">
          <strong><span>${player.name}</span><span>${player.role}</span></strong>
          <p>${player.trait}</p>
          <div class="mini">
            ${playerStatDefs.map(([label, key]) => `<span>${label}${player[key]}</span>`).join("")}
          </div>
        </div>
      `
    )
    .join("");
}

function renderActions(state) {
  $("actions").innerHTML = actions
    .map(
      (action) => `
        <button class="action-card" type="button" data-action="${action.id}" ${state.busy || state.seasonEnded ? "disabled" : ""}>
          <h3>${action.title}</h3>
          <p>${action.text}</p>
          <span class="tag">疲劳 ${action.fatigue > 0 ? "+" : ""}${action.fatigue}</span>
        </button>
      `
    )
    .join("");

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => runWeek(button.dataset.action));
  });
}

function renderLog(state) {
  $("log").innerHTML = state.logs
    .map(
      (item) => `
        <article class="log-item">
          <strong>W${item.week} · ${item.title}</strong>
          <p>${item.text}</p>
        </article>
      `
    )
    .join("");
}

function renderMatch(state) {
  const match = state.currentMatch;
  $("matchCard").classList.toggle("hidden", !match);
  if (!match) return;
  $("matchName").textContent = `${match.map} vs ${match.opponent}`;
  $("matchScore").textContent = `${match.us} : ${match.them}`;
  $("matchFeed").innerHTML = match.lines
    .map((line) => `<div class="round-line ${line.tone === "bad" ? "bad" : line.tone === "event" ? "event" : ""}">${line.text}</div>`)
    .join("");
  $("matchFeed").scrollTop = $("matchFeed").scrollHeight;
}

function renderSeasonEnd(state) {
  $("seasonEnd").classList.toggle("hidden", !state.seasonEnded);
  if (!state.seasonEnded) return;
  const rating = state.wins >= 15 ? "传奇教练" : state.wins >= 11 ? "季后赛级项目" : state.wins >= 7 ? "有节目效果的中游队" : "流量很高的灾难片";
  $("endingTitle").textContent = rating;
  $("endingBody").textContent = `20 周结束，战绩 ${state.wins}W-${state.losses}L。你的队伍证明了一件事：电竞管理不是让所有人冷静，而是在有人快爆炸时，判断他还能不能杀两个。`;
  $("records").innerHTML = [
    ["最终战绩", `${state.wins}W-${state.losses}L`],
    ["最长连胜", `${state.bestStreak}`],
    ["donk 红温次数", `${state.tiltCount}`],
    ["最终名气", `${state.team.fame}`],
    ["粉丝支持", `${state.team.fans}`],
    ["赛季名场面", state.famousMoments[0] || "暂无"],
  ]
    .map(([label, value]) => `<div class="record"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

$("newSeasonBtn").addEventListener("click", () => {
  if (confirm("确定开启新赛季？当前存档会被覆盖。")) store.getState().startNewSeason();
});
$("restartBtn").addEventListener("click", () => store.getState().startNewSeason());
$("clearLogBtn").addEventListener("click", () => store.getState().clearLog());

render();
