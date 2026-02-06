const express = require('express');
const path = require('path');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { getRedisClient, isAvailable } = require('./config/redis');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const flash = require('express-flash');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Adjust based on your needs
  crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Use Redis store if available, otherwise use memory store
const redisClient = getRedisClient();
if (redisClient && isAvailable()) {
  try {
    sessionConfig.store = new RedisStore({ client: redisClient });
    console.log('Session: Using Redis store');
  } catch (error) {
    console.log('Session: Using memory store (Redis unavailable)');
  }
} else {
  console.log('Session: Using memory store (Redis disabled or unavailable)');
}

app.use(session(sessionConfig));

// Flash messages
app.use(flash());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');

app.use('/admin', adminRoutes);
app.use('/', customerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('customer/error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).render('customer/error', {
    title: 'Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong. Please try again later.' 
      : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RatnaVeda server running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin/login`);
  console.log(`🛍️  Customer portal: http://localhost:${PORT}`);
});

module.exports = app;

