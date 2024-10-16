const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // 确保这个目录存在
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // 使用时间戳作为文件名
  }
});

const upload = multer({ storage: storage });

exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user || !(await user.comparePassword(password))) {
      console.log('Authentication failed');
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }

    console.log('Authentication successful');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, user: { id: user._id, email: user.email, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    // 检查密码是否匹配
    if (password !== confirmPassword) {
      return res.status(400).json({ message: '密码不匹配' });
    }

    // 检查用户名或邮箱是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被使用' });
    }

    const user = new User({ name, username, email, password });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(201).json({ token, user: { id: user._id, name, email, username } });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: '注册失败，请稍后再试' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: '获取用户资料失败' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.json({ message: '个人资料更新成功', user: user.toObject({ getters: true, versionKey: false }) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: '更新用户资料失败' });
  }
};

exports.findUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      res.json({ message: 'User found', userId: user._id });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadAvatar = [
  upload.single('avatar'), // 中间件处理文件上传
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '没有文件上传' });
      }
      
      // 构建头像 URL
      const avatarUrl = `/uploads/${req.file.filename}`;
      
      // 更新用户的头像 URL
      const user = await User.findByIdAndUpdate(
        req.user.id, 
        { avatar: avatarUrl },
        { new: true, select: '-password' }
      );

      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      res.json({ message: '头像上传成功', user });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({ message: '上传头像失败', error: error.message });
    }
  }
];
