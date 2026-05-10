const stats = [
  ["火力", "fire"],
  ["战术纪律", "tactics"],
  ["团队默契", "chemistry"],
  ["队伍心态", "mental"],
  ["明星压制力", "star"],
  ["指挥权威", "igl"],
  ["商业热度", "heat"],
  ["管理稳定", "stability"],
];

const starters = [
  {
    title: "🔥 donk 的经纪人来电",
    body: "donk 想跳槽。他只要求一件事：队伍必须围绕他的第一枪运转。代价是你要卖掉原来的突破核心。",
    team: "Flashpoint X",
    logo: "FX",
    roster: [
      ["donk", "红温巨星 / 突破"],
      ["chopper", "老派 IGL"],
      ["frozen", "稳定步枪"],
      ["flameZ", "牺牲位"],
      ["molodoy", "体系新星"],
    ],
    mod: { fire: 12, tactics: -4, chemistry: -7, mental: -5, star: 15, igl: -6, heat: 13, stability: -8 },
  },
  {
    title: "😶 NiKo 的最后一舞",
    body: "老板签下 NiKo，因为他说这次真的不一样。粉丝已经在剪集锦，黑粉也已经准备好截图。",
    team: "Last Dance Club",
    logo: "LD",
    roster: [
      ["NiKo", "巨星步枪 / 关键局谜题"],
      ["karrigan", "控场 IGL"],
      ["ropz", "自由人"],
      ["Twistzz", "北美枪男"],
      ["broky", "松弛狙击"],
    ],
    mod: { fire: 8, tactics: 7, chemistry: 2, mental: -6, star: 11, igl: 8, heat: 16, stability: -3 },
  },
  {
    title: "📋 青训体系赌局",
    body: "没有超巨，没有大合同，只有五个愿意听你复盘到凌晨的年轻人。赢了叫体系，输了叫没钱。",
    team: "Academy Protocol",
    logo: "AP",
    roster: [
      ["nilo", "青训步枪"],
      ["Jimpphat", "冷静小孩"],
      ["siuhy", "年轻 IGL"],
      ["torzsi", "体系狙"],
      ["xertioN", "高压突破"],
    ],
    mod: { fire: -3, tactics: 12, chemistry: 11, mental: 7, star: -5, igl: 7, heat: -4, stability: 10 },
  },
];

const maps = ["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust2"];

const events = [
  "🔥 突破手开始红温，但鼠标也开始冒火。",
  "😶 关键局没人说话，只有键盘声越来越重。",
  "📱 社区已经把你的暂停截图做成表情包。",
  "🎧 IGL 要求慢控，巨星已经走到中路了。",
  "💰 老板问：这把赢了是不是就不用买人？",
  "🧊 残局选手突然冷得像服务器房。",
  "📋 对手把你的默认研究透了，连假打都不吃。",
  "🤝 辅助位闪光全白对面，也全白了自己人。",
  "⭐ 明星选手要资源，老核心要尊重。",
  "🧨 强起局买了四把沙鹰，语音里没人承认是谁先提的。",
  "🏆 Major 梦从一个 eco 翻盘开始，也可能在一个烟雾缝结束。",
  "🪑 替补在身后看得很认真，主力突然坐直了。",
  "📈 赞助商喜欢流量，但不喜欢 3-13。",
  "🧠 心态教练发来消息：少施压。你看了眼比分，没回。",
  "🎯 狙击手说他有 timing，下一秒 timing 有了他。",
  "🧯 队伍语音升温，耳机里像开了第二个 Inferno。",
  "🚪 自由人绕后成功，但包点已经没人活着了。",
  "📉 HLTV 评分还没出来，弹幕评分已经归零。",
  "🔁 对手叫暂停后连追三分，你开始怀疑他们也有教练。",
  "✨ 一个年轻人赢下残局，然后第一次敢在语音里说：听我的。",
];

const roundTemplates = [
  ["开局试探", "{map} 的第一波默认很慢。{p1} 卡着烟边等了七秒，{p2} 在语音里提醒别急，但 {p3} 已经把准星放到了爆头线。"],
  ["第一枪", "{p1} 抢下首杀，镜头还没切过去，右上角又跳出一行。对手暂停了一秒，像是在确认这不是热身。"],
  ["明星镜头", "{p2} 没等闪光爆开就拉了出去。这个动作在复盘里会被骂，但在集锦里会被放慢三遍。"],
  ["被针对", "对手开始把道具砸向 {p1} 的位置。{p1} 没死，但也没法舒服地开枪。你的战术本子突然变厚了。"],
  ["经济波动", "队伍买得很别扭，两把 AK、一把加利尔、一把英雄 M4，还有一个人说“我能起狙”。没人接话。"],
  ["半场前", "{p3} 赢下一个 1v2，最后一枪打完他没有喊。语音安静得反而像赢了什么大的。"],
  ["换边", "换边之后，{p4} 第一时间问：我们还按原来的打吗？{p2} 说都行，但语气听起来不是都行。"],
  ["对手变阵", "对手开始前压。你的默认被切成三段，{p5} 的补枪晚了半秒，半秒在 CS2 里够写一篇悼词。"],
  ["队内分歧", "{p1} 想提速，{p2} 想控图，{p3} 说先别吵。倒计时还剩 38 秒，包还在家里。"],
  ["压力局", "观众的声音像从显示器后面钻出来。{p4} 盯着小地图，突然说：我可以一个人去卖。"],
  ["赛点边缘", "比分咬住了。{p5} 的手感在回暖，{p1} 的情绪也在回暖，区别是前者让你安心，后者让你想叫暂停。"],
  ["终局镜头", "最后一个回合，所有人都知道这波会被截图。{p2} 喊了最终 call，{p1} 没说话，但他第一个冲了出去。"],
];

const choices = [
  {
    at: 5,
    prompt: "比分开始摇晃。你要叫第一个暂停吗？",
    options: [
      ["叫暂停，重新强调纪律", { tactics: 7, igl: 6, star: -3, heat: -1 }, "📋 暂停叫得很稳，选手终于开始听完整句话。"],
      ["不叫，让他们自己打出手感", { fire: 6, star: 5, mental: -4, igl: -5 }, "🔥 你把方向盘交给了枪法，副作用是没人知道刹车在哪。"],
      ["施压巨星：现在就站出来", { star: 9, heat: 6, chemistry: -5, mental: -4 }, "⭐ 他听见了，也记住了。下一枪很重，更衣室也更重。"],
      ["安抚全队：别急，按训练来", { chemistry: 6, mental: 5, fire: -2 }, "🤝 语音降温了，至少大家又开始报点。"],
    ],
  },
  {
    at: 10,
    prompt: "赛点味道出来了。你最后一次介入怎么选？",
    options: [
      ["全队慢控，打纪律", { tactics: 8, igl: 5, heat: -2 }, "📋 这不是最帅的打法，但它让每个人都知道下一秒该站哪。"],
      ["放开巨星单摸", { star: 10, fire: 5, chemistry: -6, stability: -3 }, "🔥 你把战术板合上了。现在比赛属于准星和脾气。"],
      ["强起赌博，抢节奏", { fire: 7, heat: 8, mental: -5 }, "🧨 这个决定像短视频标题：要么封神，要么被喷到明天。"],
      ["保枪等下一分", { mental: 5, stability: 5, heat: -5, star: -4 }, "🧊 你选择活到下一回合。弹幕不喜欢，但银行账户喜欢。"],
    ],
  },
];

let state;
let autoTimer = null;

const $ = (id) => document.getElementById(id);
const clamp = (n) => Math.max(0, Math.min(100, n));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function newState(starter) {
  return {
    team: starter.team,
    logo: starter.logo,
    roster: starter.roster,
    map: pick(maps),
    round: 0,
    scoreUs: 0,
    scoreThem: 0,
    timeLeft: 120,
    usedChoices: new Set(),
    stats: {
      fire: 55,
      tactics: 55,
      chemistry: 55,
      mental: 55,
      star: 55,
      igl: 55,
      heat: 45,
      stability: 55,
    },
    log: [],
  };
}

function applyMod(mod) {
  Object.entries(mod).forEach(([key, value]) => {
    state.stats[key] = clamp(state.stats[key] + value);
  });
}

function renderStarters() {
  $("starterEvents").innerHTML = starters
    .map(
      (starter, index) => `
        <button class="starter-card" type="button" data-starter="${index}">
          <h3>${starter.title}</h3>
          <p>${starter.body}</p>
          <div class="starter-impact">
            ${Object.entries(starter.mod)
              .slice(0, 4)
              .map(([key, value]) => `<span class="pill">${stats.find((s) => s[1] === key)[0]} ${value > 0 ? "+" : ""}${value}</span>`)
              .join("")}
          </div>
        </button>
      `
    )
    .join("");

  document.querySelectorAll("[data-starter]").forEach((button) => {
    button.addEventListener("click", () => startGame(starters[Number(button.dataset.starter)]));
  });
}

function startGame(starter) {
  state = newState(starter);
  applyMod(starter.mod);
  $("setupView").classList.add("hidden");
  $("gameView").classList.remove("hidden");
  $("teamName").textContent = state.team;
  $("teamLogo").textContent = state.logo;
  $("mapName").textContent = state.map;
  $("feed").innerHTML = "";
  $("shareCard").classList.add("hidden");
  $("nextBtn").disabled = false;
  renderAll();
  addEntry("赛前", starter.body, [`地图：${state.map}`, "BO1", "12 镜头速通"]);
}

function renderAll() {
  $("scoreText").textContent = `${state.scoreUs} : ${state.scoreThem}`;
  $("roundText").textContent = `镜头 ${state.round} / 12`;
  $("clockText").textContent = `摸鱼倒计时 ${String(Math.floor(state.timeLeft / 60)).padStart(2, "0")}:${String(state.timeLeft % 60).padStart(2, "0")}`;
  $("teamMood").textContent = moodText();
  renderStats();
  renderRoster();
  renderTicker();
}

function moodText() {
  const m = state.stats.mental;
  if (m > 72) return "更衣室温度：能开香槟";
  if (m > 54) return "更衣室温度：正常";
  if (m > 36) return "更衣室温度：耳机有点烫";
  return "更衣室温度：已经有人不说话";
}

function renderStats() {
  $("statList").innerHTML = stats
    .map(([label, key]) => `
      <div class="stat-row">
        <div class="stat-top"><span>${label}</span><b>${state.stats[key]}</b></div>
        <div class="bar"><span style="width:${state.stats[key]}%"></span></div>
      </div>
    `)
    .join("");
}

function renderRoster() {
  $("roster").innerHTML = state.roster
    .map(([name, role]) => `
      <div class="player">
        <strong><span>${name}</span><span>${role.split(" / ")[0]}</span></strong>
        <p>${role}</p>
      </div>
    `)
    .join("");
}

function renderTicker() {
  $("ticker").innerHTML = events
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)
    .map((event) => `<div class="ticker-item">${event}</div>`)
    .join("");
}

function addEntry(title, body, deltas = []) {
  const node = document.createElement("article");
  node.className = "entry";
  node.innerHTML = `
    <h3><span>${title}</span><small>${state.map}</small></h3>
    <p>${body}</p>
    <div class="delta">${deltas.map((d) => `<span>${d}</span>`).join("")}</div>
  `;
  $("feed").appendChild(node);
  $("feed").scrollTop = $("feed").scrollHeight;
}

function fillTemplate(template) {
  const names = state.roster.map((p) => p[0]);
  return template
    .replaceAll("{map}", state.map)
    .replaceAll("{p1}", names[0])
    .replaceAll("{p2}", names[1])
    .replaceAll("{p3}", names[2])
    .replaceAll("{p4}", names[3])
    .replaceAll("{p5}", names[4]);
}

function playRound() {
  if (!state || state.round >= 12) return;

  const pendingChoice = choices.find((choice) => choice.at === state.round && !state.usedChoices.has(choice.at));
  if (pendingChoice) {
    showChoice(pendingChoice);
    return;
  }

  state.round += 1;
  state.timeLeft = Math.max(0, state.timeLeft - Math.floor(8 + Math.random() * 8));

  const power =
    state.stats.fire * 0.26 +
    state.stats.tactics * 0.2 +
    state.stats.chemistry * 0.14 +
    state.stats.mental * 0.16 +
    state.stats.star * 0.18 +
    state.stats.igl * 0.06;
  const winChance = clamp(power + (Math.random() * 24 - 12)) / 100;
  const won = Math.random() < winChance;
  if (won) state.scoreUs += Math.random() < 0.12 ? 2 : 1;
  else state.scoreThem += Math.random() < 0.1 ? 2 : 1;

  const [title, template] = roundTemplates[state.round - 1];
  const event = Math.random() < 0.48 ? pick(events) : "";
  const body = `${fillTemplate(template)}${event ? `<br><br>${event}` : ""}`;
  const delta = won ? ["本段赢下", "心态 +2", "热度 +1"] : ["本段丢掉", "心态 -2", "弹幕升温"];

  applyMod(won ? { mental: 2, heat: 1 } : { mental: -2, heat: 2 });
  addEntry(`第 ${state.round} 镜头｜${title}`, body, delta);
  renderAll();

  if (state.round >= 12) finishMatch();
}

function showChoice(choice) {
  $("choiceBox").classList.remove("hidden");
  $("choicePrompt").textContent = choice.prompt;
  $("choiceButtons").innerHTML = choice.options
    .map((option, index) => `<button class="choice" type="button" data-choice="${index}">${option[0]}</button>`)
    .join("");
  $("nextBtn").disabled = true;

  document.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = choice.options[Number(button.dataset.choice)];
      state.usedChoices.add(choice.at);
      applyMod(selected[1]);
      $("choiceBox").classList.add("hidden");
      $("nextBtn").disabled = false;
      addEntry("教练决策", selected[2], Object.entries(selected[1]).map(([key, value]) => `${stats.find((s) => s[1] === key)[0]} ${value > 0 ? "+" : ""}${value}`));
      renderAll();
      setTimeout(playRound, 280);
    });
  });
}

function finishMatch() {
  if (state.scoreUs === state.scoreThem) {
    state.scoreUs += state.stats.mental + Math.random() * 30 > 62 ? 1 : 0;
    state.scoreThem += state.scoreUs === state.scoreThem ? 1 : 0;
  }

  const won = state.scoreUs > state.scoreThem;
  const hotPlayer = pick(state.roster)[0];
  const titles = won
    ? [
        `${hotPlayer} 杀完了，教练活下来了`,
        `这暂停像天才，也像赌徒`,
        `赢了比赛，但更衣室还有余温`,
      ]
    : [
        `${hotPlayer} 没背锅，但弹幕不在乎`,
        `你的战术板被做成了表情包`,
        `输了比赛，也输掉了老板的微笑`,
      ];

  $("nextBtn").disabled = true;
  $("shareCard").classList.remove("hidden");
  $("shareTitle").textContent = pick(titles);
  $("shareBody").innerHTML = `
    最终比分 ${state.scoreUs}:${state.scoreThem}。${won ? "队伍赢下了这场短局，商业热度开始上涨。" : "队伍没能收住局面，但故事性很满。"}
    本场关键词：${state.stats.heat > 65 ? "热搜体质" : "低调复盘"}、${state.stats.mental < 45 ? "红温边缘" : "心态尚可"}、${state.stats.igl < 45 ? "指挥权威受损" : "暂停有效"}。
  `;
  renderAll();
  stopAuto();
}

function stopAuto() {
  clearInterval(autoTimer);
  autoTimer = null;
  $("autoBtn").textContent = "自动播放";
}

$("nextBtn").addEventListener("click", playRound);
$("autoBtn").addEventListener("click", () => {
  if (autoTimer) {
    stopAuto();
    return;
  }
  $("autoBtn").textContent = "暂停自动";
  autoTimer = setInterval(() => {
    if (!$("choiceBox").classList.contains("hidden")) return;
    playRound();
  }, 1450);
});
$("resetBtn").addEventListener("click", () => {
  stopAuto();
  $("gameView").classList.add("hidden");
  $("setupView").classList.remove("hidden");
});

renderStarters();
