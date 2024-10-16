const Note = require('../models/Note');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

const statsController = {
  getUserStats: async (req, res) => {
    try {
      const userId = req.params.userId;

      const totalNotes = await Note.countDocuments({ user: userId });
      const totalCategories = await Category.countDocuments({ user: userId });
      const totalTags = await Tag.countDocuments({ user: userId });

      const recentNotes = await Note.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('category')
        .populate('tags');

      const categories = await Category.find({ user: userId });
      const categoryStats = await Promise.all(categories.map(async (category) => {
        const count = await Note.countDocuments({ user: userId, category: category._id });
        return { name: category.name, count };
      }));

      const tags = await Tag.find({ user: userId });
      const tagStats = await Promise.all(tags.map(async (tag) => {
        const count = await Note.countDocuments({ user: userId, tags: tag._id });
        return { name: tag.name, count };
      }));

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const activityStats = await Note.aggregate([
        { $match: { user: userId, updatedAt: { $gte: oneWeekAgo } } },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        totalNotes,
        totalCategories,
        totalTags,
        recentNotes,
        categoryStats,
        tagStats,
        activityStats
      });
    } catch (error) {
      res.status(500).json({ message: '获取用户统计信息失败', error: error.message });
    }
  },

  getNoteStats: async (req, res) => {
    try {
      const userId = req.params.userId;

      const totalNotes = await Note.countDocuments({ user: userId });
      const recentNotes = await Note.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('category')
        .populate('tags');
      res.json({ totalNotes, recentNotes });
    } catch (error) {
      res.status(500).json({ message: '获取笔记统计信息失败', error: error.message });
    }
  },

  getCategoryStats: async (req, res) => {
    try {
      const userId = req.params.userId;

      const categories = await Category.find({ user: userId });
      const categoryStats = await Promise.all(categories.map(async (category) => {
        const count = await Note.countDocuments({ user: userId, category: category._id });
        return { name: category.name, count };
      }));
      res.json(categoryStats);
    } catch (error) {
      res.status(500).json({ message: '获取分类统计信息失败', error: error.message });
    }
  },

  getTagStats: async (req, res) => {
    try {
      const userId = req.params.userId;

      const tags = await Tag.find({ user: userId });
      const tagStats = await Promise.all(tags.map(async (tag) => {
        const count = await Note.countDocuments({ user: userId, tags: tag._id });
        return { name: tag.name, count };
      }));
      res.json(tagStats);
    } catch (error) {
      res.status(500).json({ message: '获取标签统计信息失败', error: error.message });
    }
  },

  getActivityStats: async (req, res) => {
    try {
      const userId = req.params.userId;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const activityStats = await Note.aggregate([
        { $match: { user: userId, updatedAt: { $gte: oneWeekAgo } } },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      res.json(activityStats);
    } catch (error) {
      res.status(500).json({ message: '获取活动统计信息失败', error: error.message });
    }
  }
};

module.exports = statsController;