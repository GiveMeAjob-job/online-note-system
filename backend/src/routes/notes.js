const express = require('express');
const router = express.Router({ mergeParams: true });
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

// 草稿路由应该在最前面
router.post('/draft', noteController.createOrUpdateDraft);
router.get('/draft', noteController.getDraft);

// 其他路由
router.get('/', noteController.getAllNotes);
router.get('/recent', noteController.getRecentNotes);
router.get('/search', noteController.searchNotes);
router.post('/', noteController.createNote);
router.get('/:id', noteController.getNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);
router.get('/:id/history', noteController.getNoteHistory);
router.post('/:id/restore/:versionId', noteController.restoreNoteVersion);

module.exports = router;
