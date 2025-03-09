import moment from "moment";

/**
 * Observer callback that triggers a custom in-app notification 15 minutes before an event starts.
 * If the event starts in less than 15 minutes, it triggers the notification immediately.
 *
 * @param {Array} events - An array of event objects.
 * @param {Function} showInAppNotification - Function to show custom in-app notification.
 * @param {string | Date | moment} displayedStartDate - The currently displayed start date.
 */
export function NotificationObserver(events, showInAppNotification, displayedStartDate) {
  console.log("🔥 NotificationObserver FUNCTION EXECUTED!");

  // 🛠 Log displayedStartDate BEFORE using it to check if it's undefined
  console.log("📅 Raw displayedStartDate received:", displayedStartDate);

  if (!displayedStartDate) {
    console.error("❌ ERROR: displayedStartDate is UNDEFINED or NULL. Fix this in CalendarScreen.js!");
  }

  const currentDate = moment(); // Get today's date
  const displayedStart = moment(displayedStartDate);

  // 🛠 More Debugging Logs
  console.log("🕒 Current Date:", currentDate.format("YYYY-MM-DD HH:mm:ss"));
  console.log("📅 Parsed Displayed Start Date:", displayedStart.isValid() ? displayedStart.format("YYYY-MM-DD HH:mm:ss") : "❌ INVALID DATE");

  // ❌ Handle invalid displayedStartDate
  if (!displayedStart.isValid()) {
    console.error("❌ ERROR: displayedStartDate is INVALID or UNDEFINED:", displayedStartDate);
    return;
  }



  console.log("🔔 NotificationObserver triggered with events:", events.length);

  for (const event of events) {
    // ❌ Skip notifications if `displayedStart` is more than 3 days away from today
    if (Math.abs(currentDate.diff(displayedStart, "days")) > 3) {
      console.warn(
        `⏳ Skipping all notifications: Displayed start date (${displayedStart.format(
          "YYYY-MM-DD"
        )}) is more than 3 days away from today (${currentDate.format("YYYY-MM-DD")}).`
      );
      continue;
    }
    if (!event?.start?.dateTime) {
      console.warn("⚠️ Skipping event with missing start date:", event);
      continue;
    }

    const eventStart = moment(event.start.dateTime);
    const notificationTime = eventStart.clone().subtract(15, "minutes"); // 🔹 15 minutes before
    const now = moment();

    let millisecondsUntilEvent = eventStart.diff(now); // 🔹 Time until the event starts
    let millisecondsUntilNotification = notificationTime.diff(now); // 🔹 Time until we notify

    // ❌ Skip past events
    if (millisecondsUntilEvent < 0) {
      console.warn(`⏳ Skipping notification: "${event.title}" already started or passed.`);
      continue;
    }

    if (millisecondsUntilNotification <= 0) {
      // 🔹 Event starts in less than 15 minutes, trigger notification immediately
      console.log(`🚀 Event "${event.title}" is starting soon! Showing notification immediately.`);
      showInAppNotification(`Your event "${event.title}" is starting soon!`);
    } else {
      console.log(
        `✅ Scheduling in-app notification for "${event.title}" at ${notificationTime.format(
          "YYYY-MM-DD HH:mm:ss"
        )} (in ${millisecondsUntilNotification / 1000} seconds)`
      );

      // Delay execution for when the notification should appear
      setTimeout(() => {
        console.log(`📢 Showing in-app notification: "${event.title}"`);
        showInAppNotification(`Your event "${event.title}" starts in 15 minutes!`);
      }, millisecondsUntilNotification);
    }
  }
}
