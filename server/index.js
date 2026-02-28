const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());
app.use(express.static('../client'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log('DB Error:', err));

// Make io accessible in routes
app.set('io', io);

app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/tables', require('./routes/tables'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/complaints', require('./routes/complaints'));

app.get('/', (req, res) => res.send('Server is running!'));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected'));
});

http.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});