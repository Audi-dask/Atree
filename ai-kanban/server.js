const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'kanban.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId(type) {
  const data = readData();
  const list = type === 'system' ? data.system : data.requirements;
  const prefix = type === 'system' ? 'SYS' : 'REQ';
  const max = list.reduce((m, item) => {
    const n = parseInt(item.id.split('-')[1]);
    return n > m ? n : m;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

// GET all
app.get('/api/kanban', (req, res) => {
  res.json(readData());
});

// POST new item
app.post('/api/kanban', (req, res) => {
  const { title, description, priority, type, acceptanceCriteria } = req.body;
  if (!title || !type) return res.status(400).json({ error: 'title and type required' });

  const data = readData();
  const now = new Date().toISOString();
  const item = {
    id: generateId(type),
    title,
    description: description || '',
    priority: priority || 'P2',
    status: 'backlog',
    type,
    comments: [],
    createdAt: now,
    updatedAt: now,
    ...(type === 'requirement' ? { acceptanceCriteria: acceptanceCriteria || [] } : {})
  };

  if (type === 'system') data.system.push(item);
  else data.requirements.push(item);

  writeData(data);
  res.json(item);
});

// PATCH update status
app.patch('/api/kanban/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const data = readData();

  const list = id.startsWith('SYS') ? data.system : data.requirements;
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  const now = new Date().toISOString();
  // If status moving to done, append completedAt
  if (updates.status === 'done' && list[idx].status !== 'done') {
    updates.completedAt = now;
  }

  list[idx] = { ...list[idx], ...updates, updatedAt: now };
  writeData(data);
  res.json(list[idx]);
});

// POST comment
app.post('/api/kanban/:id/comment', (req, res) => {
  const { id } = req.params;
  const { author, content } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });

  const data = readData();
  const list = id.startsWith('SYS') ? data.system : data.requirements;
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  const comment = {
    id: Date.now(),
    author: author || 'Human',
    content,
    createdAt: new Date().toISOString()
  };

  list[idx].comments.push(comment);
  list[idx].updatedAt = new Date().toISOString();
  writeData(data);
  res.json(comment);
});

// DELETE item
app.delete('/api/kanban/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();

  if (id.startsWith('SYS')) {
    data.system = data.system.filter(i => i.id !== id);
  } else {
    data.requirements = data.requirements.filter(i => i.id !== id);
  }

  writeData(data);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`AI Kanban running at http://localhost:${PORT}`));
