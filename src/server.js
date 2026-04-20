import dotenv from 'dotenv';

import app from './app.js';
import connectDB from './config/db.js';
import { verifyEmailSetup } from './services/emailService.js';
import { startReminderCron } from './services/reminderService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await verifyEmailSetup();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    startReminderCron();
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
