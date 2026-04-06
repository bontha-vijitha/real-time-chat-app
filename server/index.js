const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

app.use(cors());
app.use(express.json());

// SQLite Database Setup
const dbPath = path.join(__dirname, 'chat.db');
const db = new Database(dbPath);
console.log('Connected to local SQLite database at:', dbPath);

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    isPinned INTEGER DEFAULT 0,
    isDeletedEveryone INTEGER DEFAULT 0,
    deletedBy TEXT DEFAULT '[]',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// REST ENDPOINTS

// Fetch messages (Filtered for a specific user)
app.get('/api/messages', (req, res) => {
  const { userId } = req.query;
  try {
    const rawMessages = db.prepare('SELECT * FROM messages ORDER BY createdAt ASC').all();
    
    // Filter and normalize for frontend (SQLite integers to booleans)
    const messages = rawMessages
      .map(m => ({
        ...m,
        _id: m.id, // match frontend's expected format
        isPinned: !!m.isPinned,
        isDeletedEveryone: !!m.isDeletedEveryone,
        deletedBy: JSON.parse(m.deletedBy)
      }))
      .filter(m => !m.deletedBy.includes(userId));

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create message
app.post('/api/messages', (req, res) => {
  const { content, sender } = req.body;
  if (!content || !sender) return res.status(400).json({ error: 'Content and sender are required' });
  if (content.length > 500) return res.status(400).json({ error: 'Message content too long' });

  try {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    db.prepare('INSERT INTO messages (id, content, sender, createdAt) VALUES (?, ?, ?, ?)').run(id, content, sender, createdAt);
    
    const newMessage = { 
      id, 
      _id: id, 
      content, 
      sender, 
      createdAt, 
      isPinned: false, 
      isDeletedEveryone: false, 
      deletedBy: [] 
    };
    
    io.emit('new_message', newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Toggle Pin
app.patch('/api/messages/:id/pin', (req, res) => {
  const { id } = req.params;
  const { isPinned } = req.body;
  try {
    db.prepare('UPDATE messages SET isPinned = ? WHERE id = ?').run(isPinned ? 1 : 0, id);
    
    const updated = db.prepare('SELECT * FROM messages WHERE id = ?').get();
    const normalized = { ...updated, _id: updated.id, isPinned: !!updated.isPinned, isDeletedEveryone: !!updated.isDeletedEveryone, deletedBy: JSON.parse(updated.deletedBy) };
    
    io.emit('pin_toggle', normalized);
    res.status(200).json(normalized);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

// Delete Logic
app.patch('/api/messages/:id/delete', (req, res) => {
  const { id } = req.params;
  const { type, userId } = req.body;
  
  try {
    if (type === 'everyone') {
      db.prepare('UPDATE messages SET isDeletedEveryone = 1 WHERE id = ?').run(id);
      io.emit('delete_broadcast', { id, type: 'everyone' });
      res.status(200).json({ success: true });
    } else {
      const current = db.prepare('SELECT deletedBy FROM messages WHERE id = ?').get();
      const deletedByArray = JSON.parse(current.deletedBy);
      
      if (!deletedByArray.includes(userId)) {
        deletedByArray.push(userId);
        db.prepare('UPDATE messages SET deletedBy = ? WHERE id = ?').run(JSON.stringify(deletedByArray), id);
      }
      res.status(200).json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
