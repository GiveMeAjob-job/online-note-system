const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const logger = require('./src/utils/logger');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Online Note System API" });
});

app.use('/api/users', userRoutes);

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
