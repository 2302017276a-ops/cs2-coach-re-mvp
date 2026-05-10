# Donk 又红温了？

![Version](https://img.shields.io/badge/version-v0.1.0-65f0a2)

当前版本：`v0.1.0`

一个纯前端的 CS2 电竞战队文字模拟器 MVP。

## 怎么运行

直接双击 `index.html` 即可体验。

也可以用任意静态服务器运行，例如 VS Code 的 Live Server。

## 一键上传 v0.1 到 GitHub

仓库里有一个双击脚本：

```text
一键上传v0.1到GitHub.bat
```

它会自动执行：

```text
git init
git branch -M main
git remote add/set-url origin https://github.com/2302017276a-ops/cs2-coach-re-mvp.git
git add ...
git commit -m "backup v0.1.0 MVP"
git push -u origin main
```

如果电脑没有安装 Git，脚本会提示你先安装 Git for Windows：

```text
https://git-scm.com/download/win
```

安装完成后，重新双击 `一键上传v0.1到GitHub.bat`。

## 当前功能

- 一个赛季 20 周
- 每周选择一个行动
- 随机触发电竞圈事件
- 自动更新战队属性和选手状态
- 12 段文字直播跑完一场比赛
- 比赛关键节点由玩家决策
- 赛季结束后生成结局、评价和纪录
- 使用 Zustand vanilla 管理游戏状态
- 使用 LocalStorage 自动存档，刷新网页后继续游戏
- 无后端，可直接部署到 GitHub Pages

## 核心循环

```text
选择本周行动
触发随机事件
更新队伍属性
进行文字直播比赛
关键节点教练决策
显示比赛结果
进入下一周
```

## 队伍属性

```text
资金
士气
名气
战术熟练度
团队默契
粉丝支持
```

## 选手属性

```text
枪法
意识
心态
团队性
商业价值
疲劳
```

## 后续方向

- 接入 AI 生成更丰富的比赛文本
- 接入真实选手池 JSON
- 增加转会、替补和战术地图池
- 增加赛季分享图
- 增加更多“红温/软脚/爆种”名场面事件

## 本地 Ollama 开发助手

仓库里附带了一个 OpenAI 兼容接口调用脚本：

```bash
python tools/ollama_dev_chat.py
```

默认配置：

```text
base_url = http://100.105.49.103:11434/v1
api_key = ollama
model = qwen3:8b
```

常用命令：

```text
/add app.js styles.css      把项目文件加入上下文
/files                      查看当前上下文文件
/remove app.js              移除上下文文件
/clear                      清空历史记忆和上下文
/exit                       保存并退出
```

对话历史会保存到 `.ollama-dev-memory.json`，下次启动会自动继续上次会话。
