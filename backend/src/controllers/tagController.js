const Tag = require('../models/Tag');

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.user.id });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: '获取标签失败', error: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const newTag = new Tag({
      name: req.body.name,
      user: req.user.id
    });
    const savedTag = await newTag.save();
    res.status(201).json(savedTag);
  } catch (error) {
    res.status(500).json({ message: '创建标签失败', error: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const updatedTag = await Tag.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name: req.body.name },
      { new: true }
    );
    if (!updatedTag) {
      return res.status(404).json({ message: '标签不存在' });
    }
    res.json(updatedTag);
  } catch (error) {
    res.status(500).json({ message: '更新标签失败', error: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const deletedTag = await Tag.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedTag) {
      return res.status(404).json({ message: '标签不存在' });
    }
    res.json({ message: '标签已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除标签失败', error: error.message });
  }
};

