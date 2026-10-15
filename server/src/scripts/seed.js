import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { config } from '../config/config.js';
import { ensureDemoData } from '../utils/seedHelper.js';

const runSeed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB:', config.mongodbUri);
    await mongoose.connect(config.mongodbUri);
    await ensureDemoData(true);
    await mongoose.connection.close();
    console.log('[Seed] Seeding process finished successfully. 🚀');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

runSeed();
