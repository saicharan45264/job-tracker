import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { config } from './config/config.js';
import { ensureDemoData } from './utils/seedHelper.js';

const startServer = async () => {
  try {
    await connectDB();
    await ensureDemoData();

    const server = app.listen(config.port, () => {
      console.log(`[CareerTrack Server] Running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`[CareerTrack Server] Health check available at: http://localhost:${config.port}/api/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[CareerTrack Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[CareerTrack Server] Process terminated safely.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error(`[CareerTrack Server] Fatal startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
