import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all for hackathon
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage
const gamerTags = {}; // address -> gamerTag
const matchChats = {}; // matchId -> Array<{sender, message, timestamp}>

// API Routes
app.post('/api/gamertag', (req, res) => {
  const { address, tag } = req.body;
  if (!address || !tag) return res.status(400).send('Missing address or tag');
  gamerTags[address.toLowerCase()] = tag;
  console.log(`Registered GamerTag: ${tag} for ${address}`);
  res.json({ success: true });
});

app.get('/api/gamertag/:address', (req, res) => {
  const { address } = req.params;
  const tag = gamerTags[address.toLowerCase()];
  res.json({ tag: tag || null });
});

app.get('/api/chat/:matchId', (req, res) => {
  const { matchId } = req.params;
  res.json({ messages: matchChats[matchId] || [] });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_match', (matchId) => {
    socket.join(matchId);
    console.log(`User ${socket.id} joined match ${matchId}`);
  });

  socket.on('send_message', ({ matchId, sender, message }) => {
    const msgData = { sender, message, timestamp: Date.now() };
    
    if (!matchChats[matchId]) matchChats[matchId] = [];
    matchChats[matchId].push(msgData);

    io.to(matchId).emit('new_message', msgData);
  });

  socket.on('match_update', ({ matchId, status, action }) => {
    // Broadcast status updates (e.g. "Player A voted cancel")
    io.to(matchId).emit('status_update', { status, action });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
