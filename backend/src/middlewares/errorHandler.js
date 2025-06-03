const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误
  logger.error(err);

  // Mongoose 错误处理
  if (err.name === 'CastError') {
    const message = `无效的 ${err.path}: ${err.value}`;
    error = new AppError(message, 400);
  }

  if (err.code === 11000) {
    const message = '字段值重复';
    error = new AppError(message, 400);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `无效输入数据: ${errors.join('. ')}`;
    error = new AppError(message, 400);
  }

  // 发送错误响应
  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message || '服务器内部错误'
  });
};

module.exports = errorHandler;
