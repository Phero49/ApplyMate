import { addNotification, getSavedJobs } from "src/db";

export function registerNotifications() {

/**
 * Checks for saved jobs and creates a notification if there are any that need applying.
 */
async function checkAndNotifySavedJobs() {
  try {
    const savedJobs = await getSavedJobs();
    if (savedJobs && savedJobs.length > 0) {
      const jobCount = savedJobs.length;
      const title = "ApplyMate Reminder";
      const message = `You have ${jobCount} saved job${jobCount > 1 ? "s" : ""} waiting for your application. Don't miss out!`;

      // 1. Internal app notification (shown in the extension's notification center)
      await addNotification({
        title: title,
        message: message,
        icon: "work",
        color: "primary",
        time: new Date().toISOString(),
        read: false,
      });

      // 2. System level notification
      void chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-128x128.png",
        title: title,
        message: message,
        priority: 2,
      });
    }
  } catch (error) {
    console.error("Error checking saved jobs for notifications:", error);
  }
}

// Set up the alarm to run every 2 hours (120 minutes)
const ALARM_NAME = "SAVED_JOBS_REMINDER";

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    void checkAndNotifySavedJobs();
  }
});

// Create the alarm if it doesn't exist
chrome.alarms.get(ALARM_NAME, (alarm) => {
  if (!alarm) {
    void chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: 120, // 2 hours
      delayInMinutes: 120, // Start in 2 hours
    });
  }
});

// Optional: Run once on startup to ensure user is reminded if they haven't been in a while
// void checkAndNotifySavedJobs();

}
