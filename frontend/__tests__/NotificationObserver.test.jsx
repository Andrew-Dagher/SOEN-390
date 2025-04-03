/**
 * @file NotificationObserver.test.js
 */
import moment from "moment";
import { NotificationObserver } from "../app/screens/calendar/NotificationObserver";

describe("NotificationObserver", () => {
  let showInAppNotificationMock;
  let setTimeoutSpy;
  let originalDateNow;

  beforeAll(() => {
    // Freeze current date/time for deterministic tests
    originalDateNow = Date.now;
    const fixedDate = new Date("2025-03-09T10:00:00Z").getTime();
    global.Date.now = jest.fn(() => fixedDate);
  });

  afterAll(() => {
    // Restore original Date.now
    global.Date.now = originalDateNow;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    setTimeoutSpy = jest.spyOn(global, "setTimeout");
    showInAppNotificationMock = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    setTimeoutSpy.mockRestore();
  });

  test("logs error if displayedStartDate is undefined or null", () => {
    NotificationObserver([], showInAppNotificationMock, undefined);
    expect(showInAppNotificationMock).not.toHaveBeenCalled();
  });

  test("early return if displayedStartDate is invalid (e.g. 'not a date')", () => {
    NotificationObserver(
      [{ start: { dateTime: "2025-03-09T11:00:00Z" } }],
      showInAppNotificationMock,
      "not a date"
    );
    // Should exit before scheduling or sending any notifications
    expect(showInAppNotificationMock).not.toHaveBeenCalled();
  });

  test("skips all notifications if displayedStartDate is more than 3 days away", () => {
    const fourDaysLater = moment().add(4, "days").toISOString();

    NotificationObserver(
      [{ start: { dateTime: "2025-03-09T12:00:00Z" } }],
      showInAppNotificationMock,
      fourDaysLater
    );

    expect(showInAppNotificationMock).not.toHaveBeenCalled();
  });

  test("skips event if event.start.dateTime is missing", () => {
    const today = moment().toISOString();

    NotificationObserver(
      [{ start: {} }, { start: { dateTime: "2025-03-09T12:00:00Z" } }],
      showInAppNotificationMock,
      today
    );

    // Invalid event is skipped; valid event is scheduled
    expect(showInAppNotificationMock).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
  });

  test("skips notification if the event is in the past", () => {
    const today = moment().toISOString();
    const oneHourAgo = moment().subtract(1, "hour").toISOString();

    NotificationObserver(
      [{ start: { dateTime: oneHourAgo } }],
      showInAppNotificationMock,
      today
    );

    expect(showInAppNotificationMock).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  test("immediately triggers notification if event starts in < 15 minutes", () => {
    const today = moment().toISOString();
    const tenMinutesLater = moment().add(10, "minutes").toISOString();

    NotificationObserver(
      [{ title: "Soon Event", start: { dateTime: tenMinutesLater } }],
      showInAppNotificationMock,
      today
    );

    expect(showInAppNotificationMock).toHaveBeenCalledWith(
      `Your event "Soon Event" is starting soon!`
    );
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  test("schedules notification if event starts in > 15 minutes", () => {
    const today = moment().toISOString();
    const twentyMinutesLater = moment().add(20, "minutes").toISOString();

    NotificationObserver(
      [{ title: "Future Event", start: { dateTime: twentyMinutesLater } }],
      showInAppNotificationMock,
      today
    );

    // Not called yet, but a timeout should be scheduled
    expect(showInAppNotificationMock).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

    // Notification is scheduled for 15 minutes before the event,
    // which is 5 minutes from "now". Let's simulate that:
    jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes in ms

    expect(showInAppNotificationMock).toHaveBeenCalledWith(
      `Your event "Future Event" starts in 15 minutes!`
    );
  });
});