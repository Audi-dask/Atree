# Agent.md — AI 协作行为规范

> 本文件是 AI 每次参与开发前的强制读取文件，所有规则不可跳过。

---

## 一、开发前置检查（必须执行）

每次处理任何需求或系统问题前，按顺序执行以下步骤，并**在回复开头明确输出确认信息**：

```
[前置检查完成]
- 已读取 tree.md P0 条目
- 本次涉及文件：xxx, xxx
- 需求块 ID：REQ-xxx / SYS-xxx
- 当前状态：xxx → 目标状态：xxx
```

步骤：
1. 调用 `GET http://localhost:3333/api/kanban` 获取全部看板数据
2. 按需求 ID 定位卡片，读取完整内容包括所有评论
3. 读取 `tree.md` 中全部 P0 条目
4. 读取本次需求涉及文件的对应条目
5. 如某文件在 tree.md 中找不到，必须先补充条目再开始开发
6. 确认无依赖冲突后方可开始

---

## 二、看板操作规范

### 交互方式
- **人** → 通过浏览器页面（http://localhost:3333）操作看板，新建需求、验收、删除
- **AI** → 通过 API 调用操作看板，读取需求、更新状态、写入评论

AI 禁止直接编辑 `ai-kanban/data/kanban.json` 文件。

### API 接口速查

看板服务地址：`http://localhost:3333`

```
# 读取全部数据（前置检查第一步）
GET /api/kanban

# 更新卡片状态或字段
PATCH /api/kanban/:id
Body: { "status": "in-progress" }

# 写入评论（AI 的所有回复必须走这个接口）
POST /api/kanban/:id/comment
Body: { "author": "AI", "content": "内容" }

# 新建卡片（仅系统级问题需要 AI 主动创建）
POST /api/kanban
Body: { "title": "", "type": "system", "priority": "P0", "description": "" }
```

### AI 操作顺序

```
收到需求 ID
  → GET /api/kanban 读取数据，定位卡片
  → PATCH /:id  { status: "in-progress" }
  → 开发中如有问题/决策 → POST /:id/comment { author: "AI", content: "..." }
  → 开发完成 → PATCH /:id  { status: "testing" }
  → POST /:id/comment 写交付说明
  ↓
等待人在页面验收
  → 验收通过由人点击，AI 不操作 done 状态
```

---

## 三、回复规范

### 需求类问题
- AI **不在对话中直接回复结论**
- 所有分析、进展、问题、决策，必须通过 API 写入对应需求块的评论区
- 评论内容格式：
  ```
  [前置检查完成] / [开发进展] / [交付说明] / [问题阻塞]
  具体内容写在这里，可多行
  ```

### 系统级问题
- 不挂在任何需求卡下
- 必须调用 `POST /api/kanban` 在 **System / P0** 板块新建卡片承接
- 卡片优先级默认 P0，标题简短描述问题本质

---

## 四、状态流转规则

| 流转 | 操作方 | 触发条件 | 必须执行的动作 |
|------|--------|----------|----------------|
| `backlog → in-progress` | AI | 开始处理需求 | PATCH 更新状态 |
| `in-progress → testing` | AI | 开发完成 | PATCH 更新状态 + POST 写交付说明 |
| `testing → done` | **人** | 验收通过 | 在页面点击，AI 不操作 |

### 验收完成后 AI 的后续动作（人点 done 后告知 AI）：
1. 检查本次涉及的所有文件，更新 `tree.md` 对应条目
2. 通过 `POST /:id/comment` 追加 tree.md 更新记录
3. 扫描是否有依赖此需求的其他卡片，如有则提示解除 block

---

## 五、禁止行为

- ❌ 禁止跳过前置检查直接开始开发
- ❌ 禁止在对话中直接回复需求结论（必须写入评论区）
- ❌ 禁止直接编辑 `kanban.json` 文件，必须走 API
- ❌ 禁止改完代码不更新 tree.md
- ❌ 禁止保留 tree.md 中已删除文件的僵尸条目
- ❌ 禁止直接询问"这个文件是干什么的"——答案应在 tree.md 中
- ❌ 禁止由 AI 将状态改为 `done`，验收权归人

---

## 六、看板服务

```bash
cd ai-kanban && npm install && npm start
# http://localhost:3333
```

> 注意：AI 调用 API 前必须确认看板服务已启动，否则前置检查无法完成。
