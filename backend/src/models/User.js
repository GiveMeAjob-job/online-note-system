const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, '请输入姓名'] },
  username: { 
    type: String, 
    required: [true, '请输入用户名'], 
    unique: true,
    minlength: [3, '用户名至少需要3个字符']
  },
  email: { 
    type: String, 
    required: [true, '请输入邮箱'], 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  password: { 
    type: String, 
    required: [true, '请输入密码'],
    minlength: [6, '密码至少需要6个字符']
  },
  avatar: {
    type: String,
    default: 'default-avatar.png' // 默认头像
  },
  bio: {
    type: String,
    maxlength: [200, '个人简介不能超过200个字符']
  },
  location: {
    type: String,
    maxlength: [100, '地址不能超过100个字符']
  },
  website: {
    type: String,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, '请输入有效的网址']
  },
  socialLinks: {
    twitter: String,
    facebook: String,
    linkedin: String,
    github: String
  }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 添加一个方法来获取公开的用户信息
UserSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// 使用这种方式来避免重复编译模型
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
