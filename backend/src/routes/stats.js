const express = require('express');
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middlewares/auth');
const statsController = require('../controllers/statsController');

// 调试输出
console.log('statsController:', statsController);
console.log('getUserStats:', statsController.getUserStats);

// 获取用户的所有统计信息
router.get('/', authMiddleware, (req, res, next) => {
  console.log('Accessing getUserStats. User ID:', req.params.userId);
  statsController.getUserStats(req, res, next);
});

// 获取用户的笔记统计信息
router.get('/notes', authMiddleware, (req, res, next) => {
  console.log('Accessing getNoteStats. User ID:', req.params.userId);
  statsController.getNoteStats(req, res, next);
});

// 获取用户的分类统计信息
router.get('/categories', authMiddleware, (req, res, next) => {
  console.log('Accessing getCategoryStats. User ID:', req.params.userId);
  statsController.getCategoryStats(req, res, next);
});

// 获取用户的标签统计信息
router.get('/tags', authMiddleware, (req, res, next) => {
  console.log('Accessing getTagStats. User ID:', req.params.userId);
  statsController.getTagStats(req, res, next);
});

// 获取用户的活动统计信息
router.get('/activity', authMiddleware, (req, res, next) => {
  console.log('Accessing getActivityStats. User ID:', req.params.userId);
  statsController.getActivityStats(req, res, next);
});

module.exports = router;
