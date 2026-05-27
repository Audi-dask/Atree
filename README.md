# Atree — AI 协作开发规范

> 让 AI 参与开发有迹可循、有规可依。

---

## 理念

现有的 AI 编码工具足够强，但缺一个「记忆载体」。

每次打开新对话，AI 不知道项目结构、不知道历史决策、不知道你刚才验收了什么。你花大量时间在重复解释背景，而不是推进需求。上下文窗口越撑越大，最终爆掉。

Atree 的设计思路很简单：

- **tree.md** — 给 AI 一张项目地图，让它每次开口前先知道自己在哪
- **看板** — 给需求一个生命周期，AI 认领、开发、交付、归档，全程有状态
- **Agent.md** — 给 AI 一套行为约束，让它的每一步都可预期、可审计

不依赖任何云服务，不绑定任何 AI 平台，本地跑，纯文件驱动。

---

## 项目结构

```
/
├── Agent.md                  # AI 行为规范（每次开发前必读）
├── tree.md                   # 项目文件语义树（AI 导航地图）
├── tree-update-rules.md      # 文件树维护规则
├── README.md
└── ai-kanban/                # 本地看板服务
    ├── server.js
    ├── package.json
    ├── data/
    │   └── kanban.json       # 看板数据持久化
    └── public/
        └── index.html
```

---

## 快速开始

### 1. 启动看板

```bash
cd ai-kanban
npm install
npm start
# 访问 http://localhost:3333
```

### 2. 配置 AI IDE

在你的 AI IDE（Cursor / TRAE / Windsurf 等）中，将 `Agent.md` 加入全局规则或项目规则：

**Cursor**
将 `Agent.md` 内容复制到 `.cursorrules` 或 `Settings → Rules for AI`

**TRAE / Windsurf**
在项目根目录的 rules 配置中引用 `Agent.md`

核心目的只有一个：**保证 AI 每次响应前都读过这个文件**。

### 3. 初始化你的 tree.md

参考 `tree-update-rules.md` 的格式，把你项目的核心文件填进去：

```markdown
# AI 项目熟悉指引

## P0
- your/entry/main.go  # 职责描述；关键技术点；对外暴露的核心能力
- your/config/config.go  # 职责描述；关键技术点；对外暴露的核心能力
```

P0 填 5-10 个最核心的文件就够了，不要贪多。

---

## 日常使用流程

```
你在看板写需求（标题 + 描述 + 验收标准）
        ↓
把需求 ID 告诉 AI，让它去看板读取
        ↓
AI 读 Agent.md → 读 tree.md P0 → 读需求块 + 评论
        ↓
AI 开发，状态自动流转到 in-progress
        ↓
AI 完成，状态改为 testing，评论区写交付说明
        ↓
你验收通过，状态改为 done
        ↓
AI 更新 tree.md 涉及文件条目
```

### 两类卡片

| 类型 | 适用场景 | 看板位置 |
|------|----------|----------|
| **需求 REQ** | 功能需求、页面、接口开发 | Requirements Tab |
| **系统 SYS** | 架构决策、依赖冲突、配置异常 | System / P0 Tab |

遇到系统级问题，不要挂在需求卡下，单独开 SYS 卡，优先级默认 P0。

---

## 注意事项

**关于 Agent.md**
这是整个系统的核心约束文件。AI 不会自动遵守，需要你在 IDE 中确保它被每次读取。规则写得越具体，AI 跑偏的概率越低。

**关于 tree.md**
不要把所有文件都加进去，只加 AI 需要知道的。P0 控制在 10 个以内，P1 控制在 20 个以内。条目越精准，上下文消耗越少。每次需求验收后记得检查是否需要更新。

**关于看板数据**
数据存在 `ai-kanban/data/kanban.json`，纯本地文件。如果团队协作使用，建议把 `kanban.json` 加入 git 追踪，用 commit 记录状态变更历史。

**关于 AI 的回复位置**
按 Agent.md 的约定，AI 的分析和结论应该写入需求块的评论区，而不是直接在对话里回复。这样做的好处是需求的决策过程可追溯，换一个对话窗口上下文也不会丢失。

---

## 实践背景

这套方法来自 [nextmeta](https://gitee.com/nextmeta) 项目的实际开发经验。

引入 tree.md 之前，AI 对话的上下文经常在复杂需求下爆满。引入之后，上下文使用率稳定在 20-30%，且 AI 对项目结构的理解准确率显著提升。

---

## License

MIT
