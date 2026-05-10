import { createStore } from "https://esm.sh/zustand@5.0.8/vanilla";

const SAVE_KEY = "cs2-coach-season-v3";
const SEASON_WEEKS = 5;
const WIN_SCORE = 13;

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
  {
    name: "donk",
    role: "突破手",
    trait: "红温巨星",
    voice: "不想等烟散的人",
    aim: 98,
    sense: 80,
    mental: 66,
    teamwork: 58,
    market: 96,
    fatigue: 24,
    ego: 92,
    loyalty: 48,
    clutch: 78,
    tilt: 72,
  },
  {
    name: "siuhy",
    role: "IGL",
    trait: "年轻指挥",
    voice: "会把沉默也当信息",
    aim: 76,
    sense: 90,
    mental: 84,
    teamwork: 90,
    market: 70,
    fatigue: 18,
    ego: 54,
    loyalty: 82,
    clutch: 74,
    tilt: 35,
  },
  {
    name: "ropz",
    role: "自由人",
    trait: "冷静背影",
    voice: "从不解释自己的绕后",
    aim: 88,
    sense: 96,
    mental: 90,
    teamwork: 78,
    market: 78,
    fatigue: 16,
    ego: 50,
    loyalty: 72,
    clutch: 88,
    tilt: 18,
  },
  {
    name: "flameZ",
    role: "辅助位",
    trait: "更衣室胶水",
    voice: "数据不好看，但所有人都欠他一颗闪",
    aim: 80,
    sense: 78,
    mental: 84,
    teamwork: 94,
    market: 64,
    fatigue: 20,
    ego: 38,
    loyalty: 90,
    clutch: 70,
    tilt: 28,
  },
  {
    name: "m0NESY",
    role: "狙击手",
    trait: "镜头制造机",
    voice: "一笑就有人要进集锦",
    aim: 96,
    sense: 86,
    mental: 76,
    teamwork: 66,
    market: 98,
    fatigue: 22,
    ego: 76,
    loyalty: 62,
    clutch: 92,
    tilt: 44,
  },
];

const actions = [
  {
    id: "train",
    title: "📋 封闭战术周",
    text: "把手机收走，复盘到凌晨。战术会变厚，但更衣室会变窄。",
    effect: { tactics: 10, chemistry: 2, morale: -5, fame: -1 },
    fatigue: 9,
  },
  {
    id: "star",
    title: "🔥 围绕巨星打",
    text: "给 donk 和 m0NESY 资源。赢了叫爆种，输了叫队友没游戏体验。",
    effect: { fame: 5, fans: 5, tactics: -2, chemistry: -5 },
    fatigue: 6,
  },
  {
    id: "talk",
    title: "🧠 更衣室会议",
    text: "让所有人把话说出来。说出来未必解决，但不说一定会坏。",
    effect: { morale: 8, chemistry: 7, tactics: -1 },
    fatigue: -3,
  },
  {
    id: "media",
    title: "📱 直播营业",
    text: "粉丝会来，梗图也会来。流量不是胜利，但会让失败更响。",
    effect: { fame: 8, fans: 7, money: 3, morale: -2 },
    fatigue: 5,
  },
  {
    id: "rookie",
    title: "✨ 试训天才新人",
    text: "把二队小孩叫上来打一晚。主力会坐直，替补会发光。",
    effect: { fame: 2, morale: 1, chemistry: -2 },
    fatigue: 3,
  },
  {
    id: "sponsor",
    title: "💰 向赞助商低头",
    text: "钱到账，但你要拍广告。职业电竞有时像五个人带着鼠标上班。",
    effect: { money: 12, fame: 4, morale: -5, fans: -2 },
    fatigue: 3,
  },
];

const storyChains = [
  {
    id: "traitor",
    title: "那个叛徒",
    weight: (s) => 12 + Math.max(0, 58 - s.team.chemistry) + s.players.find((p) => p.name === "donk").ego / 8,
    beats: [
      {
        title: "🎧 语音里少了一个人",
        text: "训练赛最后三回合，donk 没再回应 siuhy 的 call。他不是没听见，他只是选择用静音回答。",
        effect: { chemistry: -7, morale: -4, fame: 3 },
        player: { name: "donk", mental: -4, fatigue: 4 },
        scar: "donk 第一次公开顶掉了 IGL 的 call",
      },
      {
        title: "🕶 经纪人的消息",
        text: "你收到一条匿名截图：有人在和别队经理聊合同。截图被裁掉了头像，但那句“我想打更自由的 CS”太像 donk。",
        effect: { chemistry: -8, morale: -6, fame: 8, fans: -4 },
        player: { name: "donk", loyalty: -10, ego: 4 },
        scar: "更衣室第一次怀疑队里有叛徒",
      },
      {
        title: "🔪 背刺发生在赛前",
        text: "赛前 40 分钟，donk 迟到。不是堵车，他刚从另一家俱乐部的会议室出来。全队看着他坐下，没人问。",
        effect: { chemistry: -12, morale: -10, fame: 12, tactics: -4 },
        player: { name: "donk", aim: 4, teamwork: -8, loyalty: -14 },
        scar: "那个叛徒的名字已经不需要系统提示",
      },
      {
        title: "🧯 反叛者的三杀",
        text: "最荒诞的是，他背刺了队伍，也背刺了对手。赛点局 donk 不听 call 干拉三杀，赢完只说：看吧。",
        effect: { fame: 15, fans: 9, chemistry: -6, morale: 2 },
        player: { name: "donk", aim: 5, mental: -3, ego: 8 },
        scar: "那个叛徒亲手救了一场他差点毁掉的比赛",
      },
    ],
  },
  {
    id: "rookie",
    title: "那个天才新人",
    weight: (s) => 10 + s.week * 4 + Math.max(0, 58 - s.team.money) / 2,
    beats: [
      {
        title: "✨ 二队小孩打出 31 杀",
        text: "训练赛录像里，一个叫 Nova 的新人连续三回合首杀。主力席先是笑，后来没人笑了。",
        effect: { fame: 4, fans: 4, morale: 3 },
        scar: "那个天才新人第一次出现在你的笔记里",
      },
      {
        title: "🪑 替补席开始发烫",
        text: "Nova 坐在 flameZ 后面看复盘，没说一句话。但每当暂停画面停在包点失误，他都会低头记一笔。",
        effect: { chemistry: -3, tactics: 4, fame: 2 },
        player: { name: "flameZ", mental: -3, teamwork: 2 },
        scar: "主力第一次感觉自己的椅子不是固定资产",
      },
      {
        title: "🌟 新人临时登场",
        text: "flameZ 手腕不舒服，你让 Nova 打一张图。他第一回合白给，第二回合四杀。观众还没记住 ID，弹幕已经开始喊太子。",
        effect: { fame: 10, fans: 12, morale: 6, chemistry: -5 },
        player: { name: "flameZ", fatigue: -8, mental: -4 },
        scar: "那个天才新人一晚上改变了首发名单的重量",
      },
      {
        title: "👑 新人不再低头",
        text: "赛后采访，Nova 说：我不是来学习的。镜头切到主力席，flameZ 在鼓掌，donk 没有。",
        effect: { fame: 12, fans: 8, chemistry: -7, morale: 2 },
        scar: "那个天才新人让所有人重新定义了未来",
      },
    ],
  },
  {
    id: "choke",
    title: "那次崩盘",
    weight: (s) => 10 + Math.max(0, 52 - s.team.morale) + avgFatigue(s.players) / 3,
    beats: [
      {
        title: "😶 领先后的安静",
        text: "你们训练赛 11:4 领先，语音里却没有人敢开玩笑。不是稳，是所有人都想起上一场怎么没的。",
        effect: { morale: -5, tactics: 2, chemistry: -2 },
        scar: "队伍开始害怕领先",
      },
      {
        title: "📉 暂停没有声音",
        text: "暂停 30 秒，siuhy 讲了 22 秒。剩下 8 秒没人回应。你第一次觉得沉默比吵架更像崩盘。",
        effect: { morale: -8, chemistry: -6, tactics: -3 },
        player: { name: "siuhy", mental: -5 },
        scar: "那个暂停后来被粉丝反复截图",
      },
      {
        title: "💥 四个赛点，一个没拿",
        text: "12:8，12:9，12:10，12:11。每丢一分，选手的肩膀就低一点。到 12:12 时，你甚至不确定他们还想不想赢。",
        effect: { morale: -14, fans: -8, fame: 10, chemistry: -8 },
        scar: "那次崩盘让比分板成了恐怖片",
      },
      {
        title: "🕳 输掉以后没人摘耳机",
        text: "失败画面弹出来，全队坐了很久。donk 没红温，m0NESY 没笑，siuhy 看着小地图像在找一个不存在的回合。",
        effect: { morale: -12, fans: -7, fame: 8 },
        scar: "那次崩盘之后，队伍不再相信安全比分",
      },
    ],
  },
  {
    id: "comeback",
    title: "那次翻盘",
    weight: (s) => 9 + s.team.fans / 10 + Math.max(0, 60 - s.team.morale) / 2,
    beats: [
      {
        title: "🧊 0:6 后的第一句人话",
        text: "比分 0:6，flameZ 说：先拿一分。很普通的一句话，却像有人把队伍从水里拽了一下。",
        effect: { morale: 6, chemistry: 5, fans: 2 },
        player: { name: "flameZ", mental: 4, teamwork: 3 },
        scar: "翻盘不是从爆头开始，是从有人还相信开始",
      },
      {
        title: "🔁 eco 翻了",
        text: "四把手枪，一颗半甲。m0NESY 捡到 AWP 后没有退，他往前走了一步。那一步后来被剪成了慢动作。",
        effect: { morale: 10, fame: 8, fans: 8 },
        player: { name: "m0NESY", clutch: 4, mental: 3 },
        scar: "那次翻盘有了第一个镜头",
      },
      {
        title: "🔥 donk 把比分打回来了",
        text: "他红温了，但这次没人拦。donk 连续三个回合第一时间进点，像是在用每个击杀给之前的沉默道歉。",
        effect: { morale: 9, fame: 10, fans: 9, chemistry: 2 },
        player: { name: "donk", aim: 4, mental: 2, fatigue: 5 },
        scar: "那次翻盘的中段属于 donk 的怒火",
      },
      {
        title: "🏆 12:12，最后一分",
        text: "最后一回合没人喊。五个人像终于想起自己是同一队。包爆炸时，flameZ 第一个站起来抱住 siuhy。",
        effect: { morale: 14, chemistry: 14, fame: 12, fans: 12 },
        scar: "那次翻盘让这支队伍第一次像队伍",
      },
    ],
  },
  {
    id: "final",
    title: "那个总决赛",
    weight: (s) => (s.week >= 4 ? 36 : 2) + s.wins * 5 + s.team.fame / 6,
    beats: [
      {
        title: "🏟 总决赛前夜",
        text: "酒店走廊很安静。你路过训练室，看见五个人都还在。没有人要求他们留下，但也没有人先走。",
        effect: { morale: 6, chemistry: 6, fame: 5 },
        scar: "那个总决赛从一个没人先走的夜晚开始",
      },
      {
        title: "📱 全网都在等你们输",
        text: "热搜标题已经写好了：黑马到此为止。你关掉手机，发现队员也都关了。第一次，外面的声音进不来。",
        effect: { morale: 7, fans: 6, tactics: 3 },
        scar: "那个总决赛把噪音挡在了门外",
      },
      {
        title: "🧨 对手先到赛点",
        text: "9:12。镜头扫过你的脸，解说已经在总结你们的赛季。siuhy 说：还没结束。donk 回了一句：那就快点。",
        effect: { fame: 8, morale: 4, chemistry: 5 },
        player: { name: "siuhy", mental: 4 },
        scar: "那个总决赛在 9:12 时才真正开始",
      },
      {
        title: "👑 绝杀以后没人说话",
        text: "最后一枪是 ropz 打的。他从背后摸到警家，等了 11 秒。枪响、拆包失败、冠军画面弹出。全队沉默了一秒，然后世界爆炸。",
        effect: { fame: 18, fans: 18, morale: 16, chemistry: 12, money: 10 },
        player: { name: "ropz", clutch: 5, market: 4 },
        scar: "那个总决赛有了最后一枪",
      },
    ],
  },
  {
    id: "betrayed_by_system",
    title: "那个被牺牲的人",
    weight: (s) => 11 + Math.max(0, 62 - s.team.chemistry) / 2,
    beats: [
      {
        title: "🤝 flameZ 又一次垫后",
        text: "他给队友丢闪、帮队友补烟、替队友死。赛后 Rating 0.86，评论区说他隐身。",
        effect: { tactics: 4, chemistry: 3, morale: -2 },
        player: { name: "flameZ", mental: -4, teamwork: 3 },
        scar: "那个被牺牲的人第一次没有被看见",
      },
      {
        title: "📋 复盘里没人提他",
        text: "你表扬了 donk 的突破，夸了 m0NESY 的残局。flameZ 点了点头，把录像往前倒了 6 秒：这里是我给的闪。",
        effect: { chemistry: -5, morale: -4, tactics: 3 },
        player: { name: "flameZ", loyalty: -8, mental: -4 },
        scar: "那个被牺牲的人开始记账",
      },
      {
        title: "🚪 他主动要求替补",
        text: "flameZ 说自己需要休息。你知道那不是疲劳，是一个人终于不想再替所有人解释失败。",
        effect: { chemistry: -9, morale: -7, tactics: -4 },
        player: { name: "flameZ", fatigue: -10, loyalty: -12 },
        scar: "那个被牺牲的人把门轻轻关上",
      },
      {
        title: "🟢 他还是回来了",
        text: "赛点局，道具全乱。flameZ 从替补席站起来说：我知道怎么补。没人鼓掌，但所有人都让开了位置。",
        effect: { chemistry: 12, morale: 10, tactics: 8, fans: 5 },
        player: { name: "flameZ", mental: 6, loyalty: 8, teamwork: 5 },
        scar: "那个被牺牲的人最后救了体系",
      },
    ],
  },
  {
    id: "awp_miracle",
    title: "那把神狙",
    weight: (s) => 10 + s.players.find((p) => p.name === "m0NESY").clutch / 10,
    beats: [
      {
        title: "🎯 m0NESY 说他能起狙",
        text: "经济只够半甲短枪，但 m0NESY 看着你：给我 AWP。你知道这是请求，也像命令。",
        effect: { money: -3, morale: 2, fame: 3 },
        player: { name: "m0NESY", fatigue: 3, ego: 3 },
        scar: "那把神狙从一次不合理的购买开始",
      },
      {
        title: "🧊 第一枪穿烟",
        text: "烟还没散，右上角先亮。对手暂停，解说沉默，m0NESY 只是换了个角度。",
        effect: { morale: 7, fame: 8, fans: 7 },
        player: { name: "m0NESY", aim: 3, clutch: 3 },
        scar: "那把神狙让对手先叫了暂停",
      },
      {
        title: "💀 他不退",
        text: "队友喊保枪，m0NESY 没动。他知道自己只有一次机会，也知道全场都在等他犯错。",
        effect: { fame: 10, morale: -1, fans: 8 },
        player: { name: "m0NESY", mental: 4, fatigue: 5 },
        scar: "那把神狙最危险的一秒是他决定不退",
      },
      {
        title: "📸 四杀定格",
        text: "最后一枪甩出去，镜头卡在他的笑上。那不是轻松，是一个年轻人知道自己刚偷走了一场比赛。",
        effect: { fame: 15, fans: 12, morale: 9 },
        player: { name: "m0NESY", clutch: 5, market: 5 },
        scar: "那把神狙变成了封面",
      },
    ],
  },
  {
    id: "silent_ropz",
    title: "那个沉默的人",
    weight: (s) => 9 + Math.max(0, 65 - s.players.find((p) => p.name === "ropz").fatigue),
    beats: [
      {
        title: "🕳 ropz 没说话",
        text: "复盘吵了 12 分钟，ropz 一句话没说。他只是把鼠标垫往右挪了一点，像在给自己留绕后的空间。",
        effect: { chemistry: -2, tactics: 3 },
        player: { name: "ropz", sense: 2 },
        scar: "那个沉默的人开始自己找答案",
      },
      {
        title: "🚪 他又绕后了",
        text: "所有人都在 B 点交火，ropz 从 A2 摸到警家。没有人指挥他这么做，也没有人能阻止他这么做。",
        effect: { tactics: 4, fame: 4, morale: 3 },
        player: { name: "ropz", clutch: 3, fatigue: 3 },
        scar: "那个沉默的人第一次改写回合",
      },
      {
        title: "🧠 他看穿了对手",
        text: "ropz 说了今晚第一句话：他们下一回合会假打 A。结果对手真的假打 A。语音里没人惊讶，只有服气。",
        effect: { tactics: 8, chemistry: 6, morale: 4 },
        player: { name: "ropz", sense: 4, mental: 2 },
        scar: "那个沉默的人让队伍学会相信安静",
      },
      {
        title: "🔚 最后一秒背身",
        text: "残局 1v1，ropz 等到最后一秒才开枪。不是运气，是他把对手的恐惧也算进了时间。",
        effect: { fame: 10, fans: 8, morale: 7 },
        player: { name: "ropz", clutch: 5, market: 2 },
        scar: "那个沉默的人用一枪结束争论",
      },
    ],
  },
];

const dramaLines = {
  opening: [
    "第一回合还没结束，语音里已经能听出谁今天不想输。",
    "手枪局打得像试探，也像互相确认：今晚到底谁会先崩。",
    "开局两边都很谨慎，只有 donk 的脚步声不像谨慎。",
  ],
  comeback: [
    "比分落后到弹幕开始劝你关网页，但队伍突然拿下一个干净回合。",
    "flameZ 的闪白了三个人，也白回了队伍一点点信心。",
    "m0NESY 捡起 AWP 时，全队都短暂安静。那种安静叫机会。",
  ],
  collapse: [
    "领先优势开始漏水。不是某一个人犯错，是每个人都慢了半拍。",
    "你们又丢了一个人数优势局，镜头切到教练席，刚好拍到你闭眼。",
    "siuhy 的 call 没错，但执行像被拆成了五份，各走各的。",
  ],
  betrayal: [
    "donk 没听 call，直接干拉。杀了一个，送了自己，也送了语音里的火药味。",
    "有人在残局里没有补枪。不是来不及，是犹豫了。那一秒比死亡更刺眼。",
    "队伍站位像训练过，选择却像互相赌气。",
  ],
  clutch: [
    "ropz 从背后摸到位，等了整整 9 秒。观众不知道他在等什么，对手知道得太晚。",
    "m0NESY 第一枪空了，第二枪没有。年轻人的心跳有时比老将还冷。",
    "donk 红温到不报点，但右上角替他说了话。",
  ],
  normal: [
    "默认控图拿到信息，siuhy 的声音终于稳了一点。",
    "对手交出第一套爆弹，你们没有全退。这个回合至少还有骨头。",
    "经济局买得很丑，但 CS 里很多奇迹本来就不体面。",
  ],
};

const decisions = [
  {
    prompt: "关键暂停：队伍落后，donk 已经开始顶 call。你怎么处理？",
    options: [
      {
        label: "压住 donk，保住体系",
        effect: { tactics: 7, chemistry: 4, morale: -3 },
        player: { name: "donk", mental: -4, loyalty: -4 },
        text: "你把战术板拍在桌上：先听 call。donk 没回嘴，但他笑了一下。那不是开心。",
        tension: -4,
      },
      {
        label: "放开 donk，让他杀",
        effect: { fame: 6, fans: 5, tactics: -5, chemistry: -6 },
        player: { name: "donk", aim: 4, ego: 5, fatigue: 5 },
        text: "你说：给他第一枪。siuhy 看了你一眼，像是把某个东西从心里划掉了。",
        tension: 6,
      },
      {
        label: "让 flameZ 当场调和",
        effect: { chemistry: 7, morale: 5, tactics: 1 },
        player: { name: "flameZ", mental: 3, fatigue: 3 },
        text: "flameZ 没讲大道理，只说：这回合我先死，你们补我。语音终于有人回了一个好。",
        tension: -2,
      },
    ],
  },
  {
    prompt: "赛点边缘：对手先到 12 分，经济很差。你要怎么赌？",
    options: [
      {
        label: "强起，赌名场面",
        effect: { fame: 8, fans: 7, morale: -4, money: -3 },
        text: "你把下周预算也押进这一回合。弹幕会喜欢这个决定，除非它失败。",
        tension: 8,
      },
      {
        label: "保守 eco，赌最终局",
        effect: { tactics: 5, morale: 3, fans: -3 },
        text: "你选择忍一回合。没人爱看忍耐，但冠军经常从难看的决定里长出来。",
        tension: -3,
      },
      {
        label: "临时换点，打没人敢打的 B",
        effect: { tactics: -3, chemistry: 5, fame: 4 },
        text: "你画了一条很野的箭头。siuhy 盯了两秒，说：可以，但别后悔。",
        tension: 4,
      },
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialState() {
  return {
    week: 1,
    team: {
      money: 65,
      morale: 56,
      fame: 42,
      tactics: 50,
      chemistry: 50,
      fans: 46,
    },
    players: clone(basePlayers),
    logs: [
      {
        week: 1,
        title: "赛季开始",
        text: "这不是 20 周长跑了。现在只有 5 周，每一场都像短刀。你要的不是稳定，是让朋友截图时能说：我这队真有事。",
      },
    ],
    chainProgress: {},
    activeChainId: null,
    currentMatch: null,
    wins: 0,
    losses: 0,
    bestStreak: 0,
    currentStreak: 0,
    tiltCount: 0,
    famousMoments: [],
    scars: [],
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

const store = createStore((set) => ({
  ...loadSavedState(),
  startNewSeason: () => set(createInitialState()),
  clearLog: () => set({ logs: [] }),
  setBusy: (busy) => set({ busy }),
  addLog: (title, text) =>
    set((s) => ({
      logs: [{ week: s.week, title, text }, ...s.logs].slice(0, 80),
    })),
  addScar: (scar) =>
    set((s) => ({
      scars: scar ? [scar, ...s.scars].slice(0, 10) : s.scars,
    })),
  applyTeamEffect: (effect = {}) =>
    set((s) => ({
      team: Object.fromEntries(
        Object.entries(s.team).map(([key, value]) => [
          key,
          key === "money" ? clamp(value + (effect[key] || 0), 0, 999) : clamp(value + (effect[key] || 0)),
        ])
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
  advanceChain: (chainId) =>
    set((s) => ({
      activeChainId: chainId,
      chainProgress: { ...s.chainProgress, [chainId]: (s.chainProgress[chainId] || 0) + 1 },
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
  setTension: (amount) =>
    set((s) => ({
      currentMatch: { ...s.currentMatch, tension: (s.currentMatch?.tension || 0) + amount },
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
  addMoment: (moment) => set((s) => ({ famousMoments: [moment, ...s.famousMoments].slice(0, 10) })),
}));

store.subscribe((state) => {
  const toSave = { ...state, busy: false, currentMatch: null, savedAt: Date.now() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  render();
});

function pickStoryBeat(state) {
  const candidates = storyChains.map((chain) => {
    const index = state.chainProgress[chain.id] || 0;
    const available = index < chain.beats.length;
    const continuity = state.activeChainId === chain.id ? 24 : 0;
    const finaleBoost = state.week >= 4 && chain.id === "final" ? 30 : 0;
    return {
      chain,
      index,
      weight: available ? Math.max(1, chain.weight(state) + continuity + finaleBoost) : 0,
    };
  });
  const pool = candidates.filter((item) => item.weight > 0);
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return { chain: item.chain, beat: item.chain.beats[item.index] };
  }
  return { chain: pool[0].chain, beat: pool[0].chain.beats[pool[0].index] };
}

function teamPower(state) {
  const playerPower =
    state.players.reduce((sum, p) => {
      const fatiguePenalty = p.fatigue * 0.34;
      const personalityBonus = p.clutch * 0.08 + p.loyalty * 0.04 - p.tilt * 0.04;
      return sum + p.aim * 0.28 + p.sense * 0.2 + p.mental * 0.18 + p.teamwork * 0.16 + personalityBonus - fatiguePenalty;
    }, 0) / state.players.length;

  return playerPower * 0.6 + state.team.tactics * 0.15 + state.team.morale * 0.12 + state.team.chemistry * 0.1 + state.team.fans * 0.03;
}

function applyEffectBundle(bundle = {}) {
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

  await sleep(400);
  const { chain, beat } = pickStoryBeat(store.getState());
  applyEffectBundle(beat);
  store.getState().advanceChain(chain.id);
  store.getState().addScar(beat.scar);
  if (chain.id === "traitor" || beat.title.includes("红温")) store.getState().markTilt();
  store.getState().addLog(`${chain.title}｜${beat.title}`, beat.text);

  await sleep(650);
  await simulateMatch(chain, beat);
}

async function simulateMatch(chain, beat) {
  const state = store.getState();
  const opponent = state.week === SEASON_WEEKS ? "Vitality 总决赛阵容" : pick(["FaZe Clan", "Falcons", "MOUZ", "NAVI", "Spirit", "G2", "FURIA"]);
  const map = pick(["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust2"]);
  store.getState().setCurrentMatch({
    opponent,
    map,
    us: 0,
    them: 0,
    tension: chain.id === "final" ? 8 : 0,
    lines: [],
  });

  store.getState().appendMatchLine({
    tone: "event",
    text: `本周对手：${opponent}，地图：${map}。赛前故事是「${chain.title}」。${beat.scar || "这场比赛会留下痕迹。"}`,
  });

  let us = 0;
  let them = 0;
  let round = 0;
  let askedFirst = false;
  let askedSecond = false;
  let leadMemory = "";

  while (us < WIN_SCORE && them < WIN_SCORE) {
    round += 1;
    await sleep(430);
    const latest = store.getState();
    const match = latest.currentMatch;
    const scorePressure = Math.abs(us - them);
    const comebackBoost = them - us >= 5 ? 9 : them - us >= 3 ? 5 : 0;
    const chokePenalty = us - them >= 5 && latest.team.morale < 58 ? -8 : 0;
    const finalPressure = Math.max(us, them) >= 10 ? (latest.team.morale + avgClutch(latest.players) - 120) / 5 : 0;
    const dramaSwing = (Math.random() * 28 - 14) + (match.tension || 0);
    const power = teamPower(latest) + comebackBoost + chokePenalty + finalPressure + dramaSwing;
    const wonRound = power > 58 + Math.random() * 14;

    if (wonRound) us += 1;
    else them += 1;

    store.getState().updateScore(us, them);
    const player = pickWeightedPlayer(latest.players, wonRound);
    const line = buildRoundLine({ round, us, them, player, wonRound, chainId: chain.id, scorePressure });
    store.getState().appendMatchLine({ tone: wonRound ? "good" : "bad", text: line });

    if (!leadMemory && them - us >= 5) {
      leadMemory = "翻盘伏笔";
      store.getState().appendMatchLine({
        tone: "event",
        text: "比分已经被拉开。弹幕开始劝退，但镜头扫到 flameZ，他还在给每个人报经济。",
      });
    }

    if (!askedFirst && (round >= 8 || Math.abs(us - them) >= 4)) {
      askedFirst = true;
      await askAndApplyDecision(0);
    }

    if (!askedSecond && (us >= 10 || them >= 10)) {
      askedSecond = true;
      await askAndApplyDecision(1);
    }

    if (round > 30) {
      if (us === them) us += 1;
      break;
    }
  }

  const won = us > them;
  const result = won ? `第 ${state.week} 周胜利 ${us}:${them}` : `第 ${state.week} 周失利 ${us}:${them}`;
  const moment = buildMoment({ won, us, them, chain, comeback: leadMemory, state: store.getState() });

  store.getState().appendMatchLine({
    tone: won ? "good" : "bad",
    text: won
      ? `终局：${us}:${them}。${moment} 这不是普通胜利，这是朋友会截图发群的那种。`
      : `终局：${us}:${them}。${moment} 这不是普通失败，这是会被队粉记一整个赛季的伤口。`,
  });

  store.getState().addMoment(moment);
  store.getState().addScar(moment);
  store.getState().addLog(won ? "比赛胜利" : "比赛失利", `${result}。赛后记忆：${moment}`);
  store.getState().applyTeamEffect(
    won ? { money: 4, morale: 8, fame: 7, fans: 6, chemistry: 4 } : { morale: -8, fame: 5, fans: -5, chemistry: -5 }
  );
  store.getState().applyFatigueAll(7);
  await sleep(650);
  store.getState().finishWeek(won, result);
}

function avgClutch(players) {
  return players.reduce((sum, p) => sum + p.clutch, 0) / players.length;
}

function pickWeightedPlayer(players, wonRound) {
  const total = players.reduce((sum, p) => sum + (wonRound ? p.aim + p.clutch : p.tilt + p.fatigue + 20), 0);
  let roll = Math.random() * total;
  for (const player of players) {
    roll -= wonRound ? player.aim + player.clutch : player.tilt + player.fatigue + 20;
    if (roll <= 0) return player;
  }
  return players[0];
}

function buildRoundLine({ round, us, them, player, wonRound, chainId }) {
  let bucket = "normal";
  if (them - us >= 4) bucket = "comeback";
  if (us - them >= 4 && !wonRound) bucket = "collapse";
  if (chainId === "traitor" && Math.random() < 0.5) bucket = "betrayal";
  if (Math.max(us, them) >= 10) bucket = "clutch";
  if (round <= 2) bucket = "opening";

  const base = pick(dramaLines[bucket]).replaceAll("{p}", player.name);
  const personal = personalityLine(player, wonRound, us, them);
  return `R${round}｜${us}:${them}｜${base} ${personal}`;
}

function personalityLine(player, wonRound, us, them) {
  if (player.name === "donk" && !wonRound) return "donk 摘下耳机又戴回去，这个动作比骂人更吓人。";
  if (player.name === "donk" && wonRound) return "donk 没报点，但右上角替他发言了。";
  if (player.name === "siuhy" && !wonRound) return "siuhy 的 call 没变，声音却比上一回合低了一点。";
  if (player.name === "ropz" && wonRound) return "ropz 最后才开枪，像是故意等所有人看懂。";
  if (player.name === "flameZ" && wonRound) return "flameZ 的闪光没有出现在数据栏，但出现在每个队友的击杀里。";
  if (player.name === "m0NESY" && Math.max(us, them) >= 10) return "m0NESY 笑了一下，年轻人最危险的表情出现了。";
  return wonRound ? `${player.name} 这一分打得像在替未来争位置。` : `${player.name} 这一分白给得太安静，安静到像背锅预告。`;
}

async function askAndApplyDecision(index) {
  const decision = decisions[index];
  const choice = await askDecision(decision);
  applyEffectBundle(choice);
  store.getState().setTension(choice.tension || 0);
  store.getState().appendMatchLine({ tone: "event", text: `教练决策：${choice.text}` });
  await sleep(300);
}

function buildMoment({ won, us, them, chain, comeback, state }) {
  if (chain.id === "final" && won) return "那个总决赛：ropz 最后一秒绕后，冠军画面迟到了一秒才爆炸";
  if (chain.id === "traitor") return won ? "那个叛徒：donk 不听 call，但亲手把比赛杀回来了" : "那个叛徒：队伍输掉的不只是比分，还有互相信任";
  if (chain.id === "rookie") return won ? "那个天才新人：替补席改变了首发的命运" : "那个天才新人：还没上场，主力已经开始害怕";
  if (comeback && won) return `那次翻盘：从 ${them - 5}:${them} 的废墟里打到 ${us}:${them}`;
  if (!won && us >= 11) return "那次崩盘：离 13 分只差一口气，最后却没人敢呼吸";
  if (won && them >= 11) return "那次绝杀：所有人都以为要没了，最后一枪把网页救活";
  if (!won && state.team.chemistry < 38) return "那次背刺：输给对手之前，队伍先输给了自己";
  return won ? "那次爆种：五个人像突然想起自己为什么坐在这里" : "那次失控：比分结束了，但语音里的问题没有";
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
          <p>${player.trait} · ${player.voice}</p>
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
  const rating =
    state.wins >= 5 ? "那个不败赛季" : state.wins >= 4 ? "那个总决赛项目" : state.wins >= 2 ? "有名场面的危险队" : "流量很高的事故现场";
  $("endingTitle").textContent = rating;
  $("endingBody").textContent = `5 周结束，战绩 ${state.wins}W-${state.losses}L。这个赛季留下的不是数字，而是这些名字：那个总决赛、那个叛徒、那个天才新人、那次翻盘。`;
  $("records").innerHTML = [
    ["最终战绩", `${state.wins}W-${state.losses}L`],
    ["最长连胜", `${state.bestStreak}`],
    ["红温计数", `${state.tiltCount}`],
    ["最终名气", `${state.team.fame}`],
    ["粉丝支持", `${state.team.fans}`],
    ["赛季伤疤", state.scars[0] || state.famousMoments[0] || "暂无"],
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
