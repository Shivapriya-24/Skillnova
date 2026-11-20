require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const notificationsRouter = require('./routes/notificationRoutes');
const User = require('./models/User'); 


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', credentials: true },
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'skillnova-secret',
  resave: false,
  saveUninitialized: false,
}));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ googleId: profile.id });
        let isNewUser = false;

        if (!user) {
          isNewUser = true;
          user = await User.create({
            email,
            username: profile.displayName,
            googleId: profile.id,
            role: 'learner', 
          });
        }

        user.isNewUser = isNewUser;

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
//require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());


//app.use('/uploads',express.static(path.join(__dirname,'public/uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'public', 'certificates')));

// MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected succesfully'))
  .catch((err) => console.error('❌ MongoDB error:', err));



const createAdmin = require('./utils/createAdmin');

createAdmin(); // will create admin if not exists
app.use('/api/admin', require('./routes/adminRoutes'));

app.use('/api/notifications', notificationsRouter);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api',require('./routes/contactRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api', require('./routes/messageRoutes')); 
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/api/collaborations',require('./routes/collaborationRoutes'));
app.use('/uploads/collaborations', express.static(path.join(__dirname,  'uploads/collaborations')));
app.use('/api/achievements',require('./routes/achievementRoutes'));
//app.use('/uploads', express.static(path.join(__dirname, 'public','uploads')));
// ✅ Serve everything in backend/public/uploads at /uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'public', 'uploads'), {
    setHeaders: (res, filePath) => {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${path.basename(filePath)}"`
      );
    },
  })
);


// Health check
app.get('/health', (_, res) => res.json({ status: 'OK' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Unexpected server error' });
});
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("identify", (email) => {
    socket.join(email); // now all emits to `io.to(email)` will reach this socket
  });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('📡 socket Connected:', socket.id);

  socket.on('join', (userEmail) => {
    if (userEmail) socket.join(userEmail);
    console.log(`👤 ${userEmail} joined room`);
  });

  socket.on('send-message', (message) => {
    const { sender, receiver } = message;
    //if (!message || !message.receiver) return;
    io.to(receiver).emit('receive-message', message);
    io.to(sender).emit('receive-message', message);
  });
  

  socket.on('disconnect', () => console.log('❌ Disconnected:', socket.id));
});

const PORT = process.env.PORT || 5137;
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
