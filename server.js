import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import exampleRoutes from './routes/exampleRoutes.js';
import session from 'express-session';
import flash from 'express-flash';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Session middleware (must be before other middleware)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',  // Use a secure secret from .env
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true in production with HTTPS
}));

// Flash messages middleware (must be after session)
app.use(flash());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Routes
app.use('/', exampleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
