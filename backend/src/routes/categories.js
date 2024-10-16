const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const categoryController = require('../controllers/categoryController');

// 获取所有分类
router.get('/', authMiddleware, categoryController.getAllCategories);

// 创建新分类
router.post('/', authMiddleware, categoryController.createCategory);

// 更新分类
router.put('/:id', authMiddleware, categoryController.updateCategory);

// 删除分类
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;

