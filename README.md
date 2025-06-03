# Online Note System

在线笔记系统后端，基于 **Node.js**、**Express** 和 **MongoDB**。项目提供用户注册登录、笔记管理、分类与标签以及统计等接口，并集成 WebSocket 支持实时通信。

## 功能简介

- 用户注册、登录与个人资料管理
- 笔记的增删改查及草稿保存
- 分类与标签管理
- 统计信息查询
- WebSocket 推送
- `winston` 日志记录

## 环境准备

1. 安装 [Node.js](https://nodejs.org/) 和 [npm](https://www.npmjs.com/)
2. 准备 MongoDB 数据库，获得连接字符串 `MONGO_URI`

## 启动后端

```bash
cd backend
npm install
# 开发模式（需全局或本地安装 nodemon）
npm run dev
# 或生产模式
npm start
```

将 `.env` 文件放在 `backend` 目录下，至少包含：

```env
MONGO_URI=你的 MongoDB 地址
JWT_SECRET=用于签名的密钥
```

服务器默认监听 `5001` 端口，可通过 `PORT` 环境变量修改。

## 项目结构

```
backend/
  src/
    controllers/    业务逻辑
    models/         Mongoose 模型
    routes/         API 路由
    middlewares/    中间件
    utils/          工具函数（含 logger）
frontend/
  (预留前端代码)
```

## 日志

项目使用 [winston](https://github.com/winstonjs/winston) 输出日志到控制台并写入 `combined.log` 和 `error.log` 文件，方便生产环境排查问题。

## 许可证

本项目基于 MIT License 发布，详见 [LICENSE](LICENSE) 文件。

