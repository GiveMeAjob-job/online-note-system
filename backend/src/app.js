const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const userRoutes = require('./routes/users');
const notesRouter = require('./routes/notes');
const categoriesRouter = require('./routes/categories');
const tagsRouter = require('./routes/tags');
const statsRouter = require('./routes/stats');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 5001;

// WebSocket 连接处理
wss.on('connection', (ws, req) => {
  const userId = new URL(req.url, 'http://localhost').searchParams.get('userId');
  logger.info(`New WebSocket connection for user: ${userId}`);

  ws.on('message', (message) => {
    logger.info('Received: %s', message);
    // 处理接收到的消息
  });

  ws.on('close', () => {
    logger.info(`WebSocket connection closed for user: ${userId}`);
  });
});

// 中间件
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// 路由
app.use('/api/users', userRoutes);
app.use('/api/users/:userId/notes', notesRouter);
app.use('/api/users/:userId/categories', categoriesRouter);
app.use('/api/users/:userId/tags', tagsRouter);
app.use('/api/users/:userId/stats', statsRouter);
app.use('/api/users/:userId/notes', notesRouter);

// 错误处理
app.use(errorHandler);

// 数据库连接
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB连接成功'))
  .catch(err => logger.error('MongoDB连接失败:', err.message));

// 服务器启动
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = { app, server };
