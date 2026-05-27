# tree-update-rules.md — 文件树维护规则

> tree.md 是 AI 的项目导航地图，不是代码注释。
> 每个条目必须回答：这个文件"管什么事"，而不是"有什么代码"。

---

## 一、格式规范

每行格式固定为：

```
- path/to/file.go  # 职责描述（动词开头）；关键技术点；对外暴露的核心能力
```

三段内容用中文分号 `；` 隔开，缺少任何一段不允许提交。

**合格示例：**
```
- backend/internal/api/dto  # API 入参/出参结构定义；负责前后端 JSON 字段协议和基础校验；数据源、用户、查询审计等接口使用这里的 DTO
```

**不合格示例（拒绝）：**
```
- backend/internal/api/dto  # dto 目录
- backend/internal/api/dto  # 定义了很多结构体
```

---

## 二、优先级分层标准

| 级别 | 含义 | AI 读取策略 |
|------|------|-------------|
| **P0** | 启动链路 / 全局配置 / 路由注册 / 核心中间件 | 每次必读，改动影响全局 |
| **P1** | 核心业务模块入口（service 层、关键 handler） | 涉及主流程时读取 |
| **P2** | 辅助逻辑（工具函数、validator、helper） | 按需读取 |
| **P3** | 测试文件 / 脚本 / 临时迁移文件 | 默认不读，除非需求明确涉及 |

---

## 三、触发更新的时机（强制）

以下情况必须更新 tree.md，不可跳过：

1. **新增文件** → 在对应优先级下新增条目
2. **文件职责发生变化** → 更新描述，不允许只改代码不改树
3. **文件被删除** → 从树中移除，不允许保留僵尸条目
4. **需求验收通过**（`testing → done`）→ 必须检查本次涉及的所有文件，确认树是否需要更新

---

## 四、tree.md 文件结构模板

```markdown
# AI 项目熟悉指引
后端快速定位手册，只包含功能业务逻辑对应文件映射管理、以及实现效果。

## P0
- backend/cmd/server/main.go  # 启动入口；接口注册、依赖注入、数据库初始化、路由注册；服务启动的唯一入口
- backend/configs/config.go   # 配置获取；从 config.yaml 读取 server/database/jwt 配置并拼接 MySQL DSN；全局配置访问点

## P1
- backend/internal/service/xxx.go  # xxx 业务逻辑；核心算法或流程；暴露给 handler 层的方法

## P2
- backend/internal/utils/xxx.go  # 工具函数；具体能力；被哪些模块使用

## P3
- backend/tests/xxx_test.go  # 测试覆盖范围；测试策略；依赖的 mock
```

---

## 五、更新操作规范

更新 tree.md 时 AI 必须：

1. 定位到对应优先级区块
2. 找到对应文件行（如不存在则新增）
3. 按三段格式重写描述
4. 在对应需求块的评论区追加一条更新记录：

```
<!-- AI | tree.md 已更新 -->
涉及文件：backend/internal/xxx.go
变更原因：新增了 xxx 逻辑，对外暴露 XxxMethod
```
