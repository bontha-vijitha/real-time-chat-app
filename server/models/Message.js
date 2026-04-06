const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isDeletedEveryone: {
    type: Boolean,
    default: false,
  },
  deletedBy: {
    type: [String], // Array of user names/IDs who deleted this locally
    default: [],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
