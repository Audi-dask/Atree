2025-04-06
# AI 项目熟悉指引
后端快速定位手册，只包含功能业务逻辑对应文件映射管理、以及实现效果。

## P0
- backend/cmd/server/main.go # 启动目录、接口注册、依赖注入、数据库初始化、路由注册和服务启动
- backend/configs/config.go  # 配置获取相关，从 config.yaml 读取 server/database/jwt 配置，并拼接 MySQL DSN
- backend/config.yaml # 后端运行配置文件，包含服务端口、MySQL、JWT 有效期配置
- backen
