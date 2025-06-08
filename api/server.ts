import app from './app';
import { config } from './config/config';
import { initializeDatabase } from './utils/database';

const PORT = config.port;

// Initialize database before starting the server
initializeDatabase()
  .then(() => {
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${config.env} mode`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });