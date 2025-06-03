const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB连接成功');
  } catch (err) {
    logger.error(`MongoDB连接失败: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
