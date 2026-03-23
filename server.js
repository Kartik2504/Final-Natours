// ─── Handle uncaught exceptions (sync errors) FIRST ──────────────────────────
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

// ─── DATABASE CONNECTION ──────────────────────────────────────────────────────
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '');

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then(() => console.log('✅ DB connection successful!'))
  .catch((err) => console.error('❌ DB connection error:', err.message));

// ─── START SERVER ─────────────────────────────────────────────────────────────
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🚀 App running on port ${port} in ${process.env.NODE_ENV} mode...`);
});

// ─── Handle unhandled promise rejections (async errors) ───────────────────────
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// ─── Handle SIGTERM (e.g. from Heroku/Railway/Render) ────────────────────────
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
