const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: '获取分类失败', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
      user: req.user.id
    });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: '创建分类失败', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name: req.body.name },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: '分类不存在' });
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: '更新分类失败', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedCategory) {
      return res.status(404).json({ message: '分类不存在' });
    }
    res.json({ message: '分类已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除分类失败', error: error.message });
  }
};

