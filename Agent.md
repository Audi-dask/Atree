# Atree — AI 协作开发规范

> 让 AI 参与开发有迹可循、有规可依。

---

## 理念

现有的 AI 编码工具足够强，但缺一个「记忆载体」。

每次打开新对话，AI 不知道项目结构、不知道历史决策、不知道你刚才验收了什么。你花大量时间在重复解释背景，而不是推进需求。上下文窗口越撑越大，最终爆掉。

Atree 的设计思路很简单：

- **tree.md** — 给 AI 一张项目地图，让它每次开口前先知道自己在哪。引入前上下文经常爆满，引入后稳定在 20-30%
- **看板** — 给需求一个生命周期，人在页面操作，AI 通过 API 认领、推进、交付，全程状态可追溯
- **Agent.md** — 给 AI 一套行为约束，让它的每一步都可预期、可审计

分工很清晰：**人负责提需求和验收，AI 负责开发和状态推进。**

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

将 `Agent.md` 加入你的 AI IDE 全局规则，确保 AI 每次响应前都读过它：

**Cursor**
```
Settings → Rules for AI → 粘贴 Agent.md 内容
# 或在项目根目录创建 .cursorrules 文件
```

**TRAE**
```
在项目 rules.md 中 @引用 Agent.md
```

**Windsurf**
```
.windsurfrules 文件中引用 Agent.md 内容
```

**Claude Code / 其他支持 system prompt 的工具**
```
将 Agent.md 内容作为 system prompt 注入
```

### 3. 初始化 tree.md

参考 `tree-update-rules.md` 的格式，把项目核心文件填进去：

```markdown
# AI 项目熟悉指引

## P0
- your/entry/main.go     # 职责描述；关键技术点；对外暴露的核心能力
- your/config/config.go  # 职责描述；关键技术点；全局配置访问点
```

P0 填 5-10 个最核心的文件，不要贪多。

---

## 日常使用流程

### 人的操作
1. 打开 http://localhost:3333
2. 新建需求卡片，填写标题、描述、验收标准
3. 把卡片 ID（如 `REQ-003`）告诉 AI
4. 等 AI 推进到 `testing` 状态后，在页面验收
5. 验收通过点 `Done`，然后告知 AI 去更新 tree.md

### AI 的操作（全部通过 API）

```
收到需求 ID
  → GET /api/kanban          读取数据，定位卡片
  → PATCH /:id               状态改为 in-progress
  → 开发过程中               POST /:id/comment 写进展/问题
  → 开发完成                 PATCH /:id 状态改为 testing
  → POST /:id/comment        写交付说明
  ↓
等待人在页面验收（AI 不操作 done）
  → 人告知验收通过
  → AI 更新 tree.md + 写更新记录到评论区
```

### 看板 API 一览

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/api/kanban` | 读取全部数据 |
| POST | `/api/kanban` | 新建卡片 |
| PATCH | `/api/kanban/:id` | 更新状态/字段 |
| POST | `/api/kanban/:id/comment` | 写评论 |
| DELETE | `/api/kanban/:id` | 删除卡片 |

---

## 注意事项

**看板必须先启动**
AI 的前置检查第一步就是调用 `GET /api/kanban`，服务没跑起来 AI 无法开始工作。建议开发时保持看板常驻后台。

**AI 禁止直接编辑 kanban.json**
所有操作必须走 API，直接改文件会绕过服务端逻辑（如自动生成 ID、completedAt 时间戳等）。

**done 状态只有人能触发**
验收权归人，AI 只能推进到 `testing`，不能自己把需求标记为完成。

**tree.md 要保持精简**
P0 控制在 10 个以内，P1 控制在 20 个以内。条目越精准，AI 消耗的上下文越少，回答越准确。每次需求验收后检查是否需要更新。

**评论区是唯一的沟通记录**
AI 的分析、进展、决策全部写评论区，不在对话窗口直接回复。这样换一个对话窗口，历史上下文不会丢失，需求的决策过程完整可追溯。

**团队协作**
`kanban.json` 建议加入 git 追踪，用 commit 记录状态变更历史。`tree.md` 同理，每次更新都应该有对应的 commit message。

---

## 实践背景

这套方法来自 [nextmeta](https://gitee.com/nextmeta) 项目的实际开发经验。

引入 tree.md 之前，AI 对话的上下文在复杂需求下经常爆满。引入之后，上下文使用率稳定在 20-30%，AI 对项目结构的理解准确率显著提升，不再需要每次重新解释背景。

---

## License

MIT
