import cron from "node-cron";

import Agreement from "../models/Agreement.js";

const checkUpcomingDueRent = async () => {
  const today = new Date();
  const nextSevenDays = new Date();
  nextSevenDays.setDate(today.getDate() + 7);

  const agreements = await Agreement.find({
    status: { $in: ["active", "overdue"] },
    endDate: { $gte: today, $lte: nextSevenDays },
    "reminderSettings.enabled": true,
  })
    .populate("tenant")
    .populate("unit");

  if (agreements.length > 0) {
    console.log(`Reminder stub: ${agreements.length} agreement(s) are near due date.`);
  }
};

const startReminderCron = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      await checkUpcomingDueRent();
    } catch (error) {
      console.error("Reminder cron failed:", error.message);
    }
  });
};

export {
  startReminderCron,
  checkUpcomingDueRent,
};
