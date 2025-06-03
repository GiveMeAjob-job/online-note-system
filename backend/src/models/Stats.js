const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalNotes: {
    type: Number,
    default: 0
  },
  totalCategories: {
    type: Number,
    default: 0
  },
  totalTags: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Stats = mongoose.model('Stats', statsSchema);

module.exports = Stats;
