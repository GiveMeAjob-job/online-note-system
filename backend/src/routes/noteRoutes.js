const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middlewares/auth');

// 使用 auth 中间件保护所有路由
router.use(auth);

// 获取所有笔记
router.get('/', noteController.getAllNotes);

// 获取单个笔记
router.get('/:id', (req, res, next) => {
  req.params.userId = req.user.id; // 假设 auth 中间件设置了 req.user
  noteController.getNote(req, res, next);
});

// 创建新笔记
router.post('/', noteController.createNote);

// 更新笔记
router.patch('/:id', noteController.updateNote);

// 删除笔记
router.delete('/:id', noteController.deleteNote);

// 获取所有分类
router.get('/categories', noteController.getCategories);

// 获取所有标签
router.get('/tags', noteController.getTags);

// 获取笔记历史
router.get('/:id/history', noteController.getNoteHistory);

// 恢复笔记版本
router.post('/:id/restore/:versionId', noteController.restoreNoteVersion);

module.exports = router;
