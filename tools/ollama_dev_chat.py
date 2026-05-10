import argparse
import json
import sys
from pathlib import Path

from openai import OpenAI


DEFAULT_BASE_URL = "http://100.105.49.103:11434/v1"
DEFAULT_API_KEY = "ollama"
DEFAULT_MODEL = "qwen3:8b"
DEFAULT_MEMORY_FILE = ".ollama-dev-memory.json"
MAX_FILE_CHARS = 12000
MAX_CONTEXT_CHARS = 42000
RECENT_MESSAGE_LIMIT = 24

DEFAULT_SYSTEM_PROMPT = """你是一个帮助用户完成软件开发的 AI 助手。
请结合历史上下文、项目文件上下文和用户当前请求回答。
回答要具体、可执行，必要时给出代码或命令。
如果项目文件上下文不足，请明确说明还需要哪些文件。"""


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def load_state(memory_file: Path) -> dict:
    if memory_file.exists():
        return json.loads(memory_file.read_text(encoding="utf-8"))

    return {
        "system_prompt": DEFAULT_SYSTEM_PROMPT,
        "messages": [],
        "project_files": [],
    }


def save_state(memory_file: Path, state: dict) -> None:
    memory_file.write_text(
        json.dumps(state, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def reset_state() -> dict:
    return {
        "system_prompt": DEFAULT_SYSTEM_PROMPT,
        "messages": [],
        "project_files": [],
    }


def is_probably_text(path: Path) -> bool:
    try:
        chunk = path.read_bytes()[:2048]
    except OSError:
        return False
    return b"\x00" not in chunk


def read_project_file(path: Path, root: Path) -> str:
    try:
        rel = path.relative_to(root)
    except ValueError:
        rel = path

    if not path.exists():
        return f"\n--- FILE: {rel} ---\n[文件不存在]\n"
    if path.is_dir():
        return f"\n--- FILE: {rel} ---\n[这是目录，不是文件]\n"
    if not is_probably_text(path):
        return f"\n--- FILE: {rel} ---\n[跳过二进制文件]\n"

    text = path.read_text(encoding="utf-8", errors="replace")
    if len(text) > MAX_FILE_CHARS:
        text = text[:MAX_FILE_CHARS] + "\n...[文件过长，已截断]..."

    return f"\n--- FILE: {rel} ---\n{text}\n"


def build_project_context(file_paths: list[str], root: Path) -> str:
    if not file_paths:
        return ""

    parts = []
    total = 0
    for raw in file_paths:
        path = (root / raw).resolve()
        content = read_project_file(path, root)
        if total + len(content) > MAX_CONTEXT_CHARS:
            parts.append("\n[项目文件上下文过长，后续文件已省略]\n")
            break
        parts.append(content)
        total += len(content)

    return "\n".join(parts)


def build_messages(state: dict, root: Path, user_input: str) -> list[dict]:
    project_context = build_project_context(state["project_files"], root)
    system_content = state["system_prompt"]

    if project_context:
        system_content += "\n\n以下是当前项目文件上下文：\n" + project_context

    messages = [{"role": "system", "content": system_content}]
    messages.extend(state["messages"][-RECENT_MESSAGE_LIMIT:])
    messages.append({"role": "user", "content": user_input})
    return messages


def add_files(state: dict, patterns: list[str], root: Path) -> None:
    added = []
    for pattern in patterns:
        matches = list(root.glob(pattern))
        if not matches:
            path = (root / pattern).resolve()
            if path.exists() and path.is_file():
                matches = [path]

        for match in matches:
            path = match.resolve()
            if not path.is_file():
                continue
            try:
                rel = str(path.relative_to(root))
            except ValueError:
                rel = str(path)
            if rel not in state["project_files"]:
                state["project_files"].append(rel)
                added.append(rel)

    if added:
        print("已加入上下文：")
        for item in added:
            print("  -", item)
    else:
        print("没有加入新文件。请检查路径或通配符。")


def print_help() -> None:
    print(
        """
可用命令：
  /help                    显示帮助
  /files                   查看已加入上下文的项目文件
  /add app.js styles.css   把文件加入上下文
  /add **/*.py             支持通配符
  /remove app.js           从上下文移除文件
  /clear                   清空历史消息和文件上下文
  /exit                    保存并退出

普通输入会发送给 qwen3:8b，并自动保存对话历史。
""".strip()
    )


def handle_command(command: str, state: dict, memory_file: Path, root: Path) -> bool:
    parts = command.strip().split()
    name = parts[0].lower()
    args = parts[1:]

    if name in {"/exit", "/quit", "/q"}:
        save_state(memory_file, state)
        print("已保存会话。")
        return False

    if name == "/help":
        print_help()
    elif name == "/files":
        if not state["project_files"]:
            print("当前没有项目文件上下文。")
        else:
            print("当前项目文件上下文：")
            for item in state["project_files"]:
                print("  -", item)
    elif name == "/add":
        if not args:
            print("用法：/add app.js styles.css 或 /add **/*.py")
        else:
            add_files(state, args, root)
            save_state(memory_file, state)
    elif name == "/remove":
        removed = []
        for item in args:
            if item in state["project_files"]:
                state["project_files"].remove(item)
                removed.append(item)
        print("已移除：" + ", ".join(removed) if removed else "没有匹配到要移除的文件。")
        save_state(memory_file, state)
    elif name == "/clear":
        state.clear()
        state.update(reset_state())
        save_state(memory_file, state)
        print("记忆已清空。")
    else:
        print("未知命令。输入 /help 查看可用命令。")

    return True


def chat(args: argparse.Namespace) -> None:
    root = Path(args.root).resolve()
    memory_file = (root / args.memory).resolve()
    state = load_state(memory_file)

    client = OpenAI(
        base_url=args.base_url,
        api_key=args.api_key,
        timeout=args.timeout,
    )

    print("Ollama 开发助手已启动。输入 /help 查看命令，/exit 退出。")
    print(f"模型：{args.model}")
    print(f"Base URL：{args.base_url}")
    print(f"记忆文件：{memory_file}")

    while True:
        try:
            user_input = input("\n我：").strip()
        except (EOFError, KeyboardInterrupt):
            save_state(memory_file, state)
            print("\n已保存会话。")
            break

        if not user_input:
            continue

        if user_input.startswith("/"):
            if not handle_command(user_input, state, memory_file, root):
                break
            continue

        request_messages = build_messages(state, root, user_input)
        try:
            resp = client.chat.completions.create(
                model=args.model,
                messages=request_messages,
                stream=False,
            )
        except Exception as exc:
            print(f"调用失败：{type(exc).__name__}: {exc}")
            continue

        answer = resp.choices[0].message.content or ""
        print("\nAI：")
        print(answer)

        state["messages"].append({"role": "user", "content": user_input})
        state["messages"].append({"role": "assistant", "content": answer})
        save_state(memory_file, state)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="OpenAI-compatible Ollama dev chat with local JSON memory.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--api-key", default=DEFAULT_API_KEY)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--memory", default=DEFAULT_MEMORY_FILE)
    parser.add_argument("--root", default=".")
    parser.add_argument("--timeout", type=float, default=90.0)
    return parser.parse_args()


if __name__ == "__main__":
    chat(parse_args())
