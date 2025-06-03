const express = require('express');
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middlewares/auth');
const statsController = require('../controllers/statsController');


// 获取用户的所有统计信息
router.get('/', authMiddleware, (req, res, next) => {
  statsController.getUserStats(req, res, next);
});

// 获取用户的笔记统计信息
router.get('/notes', authMiddleware, (req, res, next) => {
  statsController.getNoteStats(req, res, next);
});

// 获取用户的分类统计信息
router.get('/categories', authMiddleware, (req, res, next) => {
  statsController.getCategoryStats(req, res, next);
});

// 获取用户的标签统计信息
router.get('/tags', authMiddleware, (req, res, next) => {
  statsController.getTagStats(req, res, next);
});

// 获取用户的活动统计信息
router.get('/activity', authMiddleware, (req, res, next) => {
  statsController.getActivityStats(req, res, next);
});

module.exports = router;
