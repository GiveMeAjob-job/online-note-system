const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const tagController = require('../controllers/tagController');

// 获取所有标签
router.get('/', authMiddleware, tagController.getAllTags);

// 创建新标签
router.post('/', authMiddleware, tagController.createTag);

// 更新标签
router.put('/:id', authMiddleware, tagController.updateTag);

// 删除标签
router.delete('/:id', authMiddleware, tagController.deleteTag);

module.exports = router;

