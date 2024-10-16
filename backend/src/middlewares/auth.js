const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new AppError('请先登录', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('用户不存在', 401));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(new AppError('认证失败', 401));
  }
};

module.exports = auth;
