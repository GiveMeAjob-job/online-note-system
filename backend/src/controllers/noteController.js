const Note = require('../models/Note');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

const noteController = {
  getAllNotes: async (req, res) => {
    try {
      const userId = req.params.userId;
      const notes = await Note.find({ user: userId })
        .sort({ updatedAt: -1 })
        .populate('category')
        .populate('tags');
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: '获取笔记失败', error: error.message });
    }
  },

  getRecentNotes: async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit) || 5;
      const notes = await Note.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('category')
        .populate('tags');
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: '获取最近笔记失败', error: error.message });
    }
  },

  getNote: async (req, res) => {
    try {
      const userId = req.user.id; // 从认证中间件获取用户ID
      const noteId = req.params.id;
      console.log(`Attempting to fetch note. UserID: ${userId}, NoteID: ${noteId}`);
      
      const note = await Note.findOne({ _id: noteId, user: userId })
        .populate('category')
        .populate('tags');
      
      if (!note) {
        console.log(`Note not found. UserID: ${userId}, NoteID: ${noteId}`);
        return res.status(404).json({ message: '笔记未找到' });
      }
      
      console.log(`Note found:`, note);
      res.json(note);
    } catch (error) {
      console.error('Error in getNote:', error);
      res.status(500).json({ message: '获取笔记失败', error: error.message });
    }
  },

  createOrUpdateDraft: async (req, res) => {
    try {
      const userId = req.params.userId;
      const { title, content, category, tags } = req.body;

      let draft = await Note.findOne({ user: userId, isDraft: true });

      if (draft) {
        draft.title = title;
        draft.content = content;
        draft.category = category;
        draft.tags = tags;
        draft.updatedAt = Date.now();
      } else {
        draft = new Note({
          user: userId,
          title,
          content,
          category,
          tags,
          isDraft: true
        });
      }

      await draft.save();
      res.json(draft);
    } catch (error) {
      console.error('Error saving draft:', error);
      res.status(500).json({ message: '保存草稿失败', error: error.message });
    }
  },

  getDraft: async (req, res) => {
    try {
      const userId = req.user.id;
      const draft = await Note.findOne({ user: userId, isDraft: true });
      if (!draft) {
        return res.json({ title: '', content: '', category: '', tags: [] });
      }
      res.json(draft);
    } catch (error) {
      console.error('Error fetching draft:', error);
      res.status(500).json({ message: '获取草稿失败', error: error.message });
    }
  },

  createNote: async (req, res) => {
    try {
      const userId = req.params.userId;
      let { title, content, category, tags } = req.body;
      
      if (!title || title.trim() === '') {
        title = '未命名笔记';
      }

      const newNote = new Note({
        user: userId,
        title,
        content,
        category,
        tags,
        isDraft: false
      });

      const savedNote = await newNote.save();

      // 删除草稿
      await Note.findOneAndDelete({ user: userId, isDraft: true });

      res.status(201).json(savedNote);
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ message: '创建笔记失败', error: error.message });
    }
  },

  updateNote: async (req, res) => {
    try {
      const userId = req.params.userId;
      const noteId = req.params.id;
      const { title, content, category, tags } = req.body;

      const updatedNote = await Note.findOneAndUpdate(
        { _id: noteId, user: userId },
        { 
          title, 
          content, 
          category, 
          tags, 
          isDraft: false,
          updatedAt: Date.now(),
          $push: { 
            history: { 
              content: content, 
              createdAt: Date.now() 
            } 
          }
        },
        { new: true }
      ).populate('category').populate('tags');

      if (!updatedNote) return res.status(404).json({ message: '笔记未找到' });

      // 删除草稿
      await Note.findOneAndDelete({ user: userId, isDraft: true });

      res.json(updatedNote);
    } catch (error) {
      res.status(400).json({ message: '更新笔记失败', error: error.message });
    }
  },

  deleteNote: async (req, res) => {
    try {
      const noteId = req.params.id;  // 注意这里使用 id 而不是 noteId
      const userId = req.user.id;    // 从 req.user 获取 userId

      console.log('Attempting to delete note:', noteId, 'for user:', userId);

      const deletedNote = await Note.findOneAndDelete({ _id: noteId, user: userId });
      
      if (!deletedNote) {
        console.log('Note not found or does not belong to user');
        return res.status(404).json({ message: 'Note not found or user not authorized' });
      }

      console.log('Note deleted successfully');
      
      // 获取更新后的统计信息
      const updatedStats = await getUserStats(userId);
      
      res.json({ message: 'Note deleted successfully', updatedStats });
    } catch (error) {
      console.error('Error in deleteNote:', error);
      res.status(500).json({ message: 'Error deleting note', error: error.message });
    }
  },

  getCategories: async (req, res) => {
    try {
      const categories = await Category.find({ user: req.user.id });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: '获取分类失败', error: error.message });
    }
  },

  getTags: async (req, res) => {
    try {
      const tags = await Tag.find({ user: req.user.id });
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: '获取标签失败', error: error.message });
    }
  },

  getNoteHistory: async (req, res) => {
    try {
      const userId = req.params.userId;
      const note = await Note.findOne({ _id: req.params.id, user: userId });
      if (!note) return res.status(404).json({ message: '笔记未找到' });
      res.json(note.history);
    } catch (error) {
      res.status(500).json({ message: '获取笔记历史失败', error: error.message });
    }
  },

  restoreNoteVersion: async (req, res) => {
    try {
      const userId = req.params.userId;
      const note = await Note.findOne({ _id: req.params.id, user: userId });
      if (!note) return res.status(404).json({ message: '笔记未找到' });
      
      const versionToRestore = note.history.find(version => version._id.toString() === req.params.versionId);
      if (!versionToRestore) return res.status(404).json({ message: '版本未找到' });

      note.content = versionToRestore.content;
      note.updatedAt = Date.now();
      note.history.push({ content: note.content, createdAt: note.updatedAt });

      const updatedNote = await note.save();
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ message: '恢复笔记版本失败', error: error.message });
    }
  },

  searchNotes: async (req, res) => {
    try {
      const { query } = req.query;
      const notes = await Note.find({
        user: req.user.id,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      }).populate('category').populate('tags');
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: '搜索笔记失败', error: error.message });
    }
  }
};

const getUserStats = async (userId) => {
  try {
    const totalNotes = await Note.countDocuments({ user: userId });
    // ... 其他统计信息 ...
    return { totalNotes, /* 其他统计数据 */ };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

module.exports = noteController;
