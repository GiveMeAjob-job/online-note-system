const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const statsRouter = require('./stats');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/find/:email', userController.findUser);
router.use('/:userId/stats', statsRouter);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
