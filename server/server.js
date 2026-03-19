const express = require('express');
const http    = require('http');
const mongoose = require('mongoose');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { mongoURI, port } = require('./utils/config');
const passport = require('./utils/passport');

const authRoutes           = require('./routes/admin/authRoutes');
const adminRoutes          = require('./routes/admin/adminRoutes');
const freelancerRoutes     = require('./routes/freelancer/freelancerRoutes');
const bidRoutes            = require('./routes/bid/bidRoutes');
const projectRoutes        = require('./routes/bid/projectRoutes');
const clientProjectRoutes  = require('./routes/client/clientProjectRoutes');
const messageRoutes        = require('./routes/message/messageRoutes');
const reviewRoutes         = require('./routes/review/reviewRoutes');
const {protectAdmin}         = require('./middleware/authMiddleware');
const analyticsRoutes = require('./routes/analytics/analyticsRoutes');
const freelancerProjectTimelineRoutes = require('./routes/freelancer/projectTimelineRoutes');
const adminAnalyticsRoutes = require('./routes/admin/adminAnalyticsRoutes');
const adminNotificationRoutes = require('./routes/admin/notificationRoutes');

const app    = express();
const server = http.createServer(app);
const io     = require('socket.io')(server, {
  cors: { origin: '*' }
});

// Make io accessible in controllers
app.set('io', io);

// Ensure upload dirs
const uploadRoot = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadRoot, { recursive: true });
fs.mkdirSync(path.join(uploadRoot, 'docs'), { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadRoot));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', protectAdmin, adminRoutes);
app.use('/api', freelancerRoutes);
app.use('/api', bidRoutes);
app.use('/api', projectRoutes);
app.use('/api', clientProjectRoutes);
app.use('/api', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/freelancer/project-timeline', freelancerProjectTimelineRoutes);
app.use('/api', adminAnalyticsRoutes);
app.use('/api', adminNotificationRoutes);
app.use(passport.initialize());

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

// Socket.io rooms
io.on('connection', socket => {
  console.log('🔌 Socket connected:', socket.id);
  
  socket.on('joinProject', projectId => {
    socket.join(`project_${projectId}`);
  });
  
  socket.on('leaveProject', projectId => {
    socket.leave(`project_${projectId}`);
  });

  socket.on('joinUser', userId => {
    socket.join(`user_${userId}`);
  });
  
  socket.on('leaveUser', userId => {
    socket.leave(`user_${userId}`);
  });
});

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('🌐 MongoDB connected');
    server.listen(port, () =>
      console.log(`🚀 Server running on http://localhost:${port}`)
    );
  })
  .catch(err => console.error('MongoDB error:', err));