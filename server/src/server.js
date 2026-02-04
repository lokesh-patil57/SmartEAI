import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`SmartEAI server running on http://localhost:${PORT}`);
      console.log(`Health: GET http://localhost:${PORT}/health`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Set PORT=5001 in .env (or another free port) and restart.`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
