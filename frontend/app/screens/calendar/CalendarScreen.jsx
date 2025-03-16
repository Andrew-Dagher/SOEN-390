import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { fetchPublicCalendarEvents } from "../login/LoginHelper";
import { handleGoToClass } from "./CalendarHelper";
import GoToLoginButton from "../../components/Calendar/GoToLoginButton";
import EventObserver from "./EventObserver";
import { NotificationObserver } from "./NotificationObserver";
import InAppNotification from "../../components/InAppNotification";
import NextClassButton from "../../components/Calendar/NextClassButton";
import MapPinIcon from "../../components/navigation/Icons/MapPinIcon";
import { trackEvent } from "@aptabase/react-native";

export default function CalendarScreen() {
  // Setup hooks
  const navigation = useNavigation();
  const { isSignedIn } = useAuth();
  const [eventsObserver] = useState(new EventObserver());

  // State variables
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(moment().startOf("month"));
  const [selectedDate, setSelectedDate] = useState(moment().startOf("day"));
  const [currentMonthEvents, setCurrentMonthEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  // Observer effects
  useEffect(() => {
    const observerCallback = (events) => {
      NotificationObserver(events, showInAppNotification, selectedDate);
    };

    eventsObserver.subscribe(observerCallback);

    return () => {
      eventsObserver.unsubscribe(observerCallback);
    };
  }, [eventsObserver, selectedDate]);

  // Notify observer whenever `events` changes
  useEffect(() => {
    if (events.length > 0) {
      eventsObserver.notify(events);
    }
  }, [events, eventsObserver]);

  // Show in-app notification
  const showInAppNotification = (message) => {
    console.log("Triggering In-App Notification:", message);
    setNotificationMessage(message);
    setNotificationVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setNotificationVisible(false);
    }, 5000);
  };

  // Load stored calendars & selected calendar from AsyncStorage
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedCalendars = await AsyncStorage.getItem(
          "availableCalendars"
        );
        const storedSelectedCalendar = await AsyncStorage.getItem(
          "selectedCalendar"
        );
        if (storedCalendars) {
          const parsedCalendars = JSON.parse(storedCalendars);
          setCalendars(parsedCalendars);
          setSelectedCalendar(storedSelectedCalendar || parsedCalendars[0]?.id);
        } else {
          console.log("No calendars found in storage.");
        }
      } catch (error) {
        console.error("Error loading stored calendar data:", error);
      }
    };

    loadStoredData();
  }, []);

  // Fetch events when selected calendar changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCalendar) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch events for the entire month plus a few days buffer
      const startDate = moment(currentMonth)
        .subtract(7, "days")
        .startOf("day")
        .toISOString();
      const endDate = moment(currentMonth)
        .add(1, "month")
        .add(7, "days")
        .endOf("day")
        .toISOString();

      let fetchedEvents = await fetchPublicCalendarEvents(
        selectedCalendar,
        startDate,
        endDate
      );

      // Ensure the description follows "Campus, Building, Room" format
      const regex = /^[^,]+,[^,]+,[^,]+$/;
      fetchedEvents = fetchedEvents.filter((event) => {
        const description = event.description?.trim() || "";
        return regex.test(description);
      });

      setEvents(fetchedEvents);
      setLoading(false);
    };

    fetchEvents();
  }, [selectedCalendar, currentMonth]);

  // Filter events for the current month and selected date
  useEffect(() => {
    if (events.length > 0) {
      // Get events for the current month view
      const monthEvents = events.filter((event) => {
        const eventDate = moment(event.start.dateTime);
        return eventDate.isSame(currentMonth, "month");
      });
      setCurrentMonthEvents(monthEvents);

      // Get events for the selected date
      const dateEvents = events.filter((event) => {
        const eventDate = moment(event.start.dateTime);
        return eventDate.isSame(selectedDate, "day");
      });
      setSelectedDateEvents(dateEvents);
    } else {
      setCurrentMonthEvents([]);
      setSelectedDateEvents([]);
    }
  }, [events, currentMonth, selectedDate]);

  // Generate calendar data
  const generateCalendar = () => {
    const startOfMonth = moment(currentMonth).startOf("month");
    const endOfMonth = moment(currentMonth).endOf("month");
    const startDay = startOfMonth.day(); // 0 is Sunday, 1 is Monday, etc.

    const calendar = [];
    const totalDays = endOfMonth.date();

    // Add previous month's days to fill the first week
    const prevMonthDays = startDay;
    const prevMonth = moment(currentMonth).subtract(1, "month");
    const prevMonthTotalDays = prevMonth.daysInMonth();

    for (
      let i = prevMonthTotalDays - prevMonthDays + 1;
      i <= prevMonthTotalDays;
      i++
    ) {
      calendar.push({
        day: i,
        month: "prev",
        date: moment(prevMonth).date(i),
      });
    }

    // Add current month's days
    for (let i = 1; i <= totalDays; i++) {
      const date = moment(currentMonth).date(i);
      calendar.push({
        day: i,
        month: "current",
        date,
        hasEvents: currentMonthEvents.some((event) =>
          moment(event.start.dateTime).isSame(date, "day")
        ),
      });
    }

    // Add next month's days to complete the calendar grid (6 rows x 7 days = 42)
    const remainingDays = 42 - calendar.length;
    const nextMonth = moment(currentMonth).add(1, "month");

    for (let i = 1; i <= remainingDays; i++) {
      calendar.push({
        day: i,
        month: "next",
        date: moment(nextMonth).date(i),
      });
    }

    // Split into rows (weeks)
    const rows = [];
    for (let i = 0; i < calendar.length; i += 7) {
      rows.push(calendar.slice(i, i + 7));
    }

    return rows;
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(moment(currentMonth).subtract(1, "month"));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(moment(currentMonth).add(1, "month"));
  };

  // Guest mode UI
  if (!isSignedIn) {
    return (
      <View style={styles.guestContainer}>
        <GoToLoginButton
          onPress={async () => {
            try {
              await AsyncStorage.removeItem("sessionId");
              await AsyncStorage.removeItem("userData");
              await AsyncStorage.removeItem("guestMode");
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            } catch (error) {
              console.error("Login Redirect Error:", error);
            }
          }}
        />
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#862532" />
      </View>
    );
  }

  trackEvent("Calendar Screen selected", {});

  // Render day cell in the calendar
  const renderDay = (day, index) => {
    const isToday = day.month === "current" && day.date.isSame(moment(), "day");
    const isSelected = day.date.isSame(selectedDate, "day");
    const isPreviousOrNextMonth = day.month !== "current";

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isToday && styles.todayCell,
          isSelected && styles.selectedCell,
          isPreviousOrNextMonth && styles.otherMonthCell,
        ]}
        onPress={() => setSelectedDate(day.date)}
      >
        <Text
          style={[
            styles.dayText,
            isToday && styles.todayText,
            isSelected && styles.selectedText,
            isPreviousOrNextMonth && styles.otherMonthText,
          ]}
        >
          {day.day}
        </Text>
        {day.hasEvents && <View style={styles.eventDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      {/* In-App Notification */}
      <InAppNotification
        message={notificationMessage}
        visible={notificationVisible}
      />

      {/* Header Section with Month and Navigation */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={goToPreviousMonth}
          >
            <Text style={styles.headerButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentMonth.format("MMMM YYYY")}
          </Text>
          <TouchableOpacity style={styles.headerButton} onPress={goToNextMonth}>
            <Text style={styles.headerButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              trackEvent("Calendar dropdown opened", {});
              setModalVisible(true);
            }}
          >
            <Text style={styles.dropdownButtonText}>
              {calendars.find((c) => c.id === selectedCalendar)?.name ||
                "Select Calendar"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Calendar Selection */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalDropdown}>
              <Text style={styles.modalTitle}>Choose a Calendar</Text>
              {calendars.map((calendar, index) => (
                <TouchableOpacity
                  key={calendar.id}
                  style={[
                    styles.modalItem,
                    index === calendars.length - 1
                      ? styles.modalLastItem
                      : null,
                  ]}
                  onPress={async () => {
                    setSelectedCalendar(calendar.id);
                    await AsyncStorage.setItem("selectedCalendar", calendar.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{calendar.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* Compact Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Days of the week */}
        <View style={styles.weekdaysRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => (
              <View key={index} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            )
          )}
        </View>

        {/* Calendar days */}
        {generateCalendar().map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) =>
              renderDay(day, `${weekIndex}-${dayIndex}`)
            )}
          </View>
        ))}
      </View>

      {/* Selected Date Header */}
      <View style={styles.selectedDateHeader}>
        <Text style={styles.selectedDateText}>
          {selectedDate.format("dddd, MMMM D")}
        </Text>
      </View>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        {selectedDateEvents.length === 0 ? (
          <Text style={styles.noEventsText}>No events found for this date</Text>
        ) : (
          <FlatList
            data={selectedDateEvents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.eventsList}
            renderItem={({ item }) => (
              <View style={styles.eventBox}>
                <View style={styles.eventContent}>
                  <View style={styles.eventTimeContainer}>
                    <Text style={styles.eventTimeHour}>
                      {moment(item.start.dateTime).format("h:mm")}
                    </Text>
                    <Text style={styles.eventTimeAmPm}>
                      {moment(item.start.dateTime).format("A")}
                    </Text>
                  </View>
                  <View style={styles.eventMainContent}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventTime}>
                      {moment(item.start.dateTime).format("h:mm A")} -{" "}
                      {moment(item.end.dateTime).format("h:mm A")}
                    </Text>

                    <View style={styles.locationContainer}>
                      <MapPinIcon width={12} height={15} color="#862532" />
                      <Text style={styles.eventLocation}>
                        {item.description.replace(/<\/?pre>/g, "").trim()}
                      </Text>
                    </View>

                    {/* "Go to Class" button => calls handleGoToClass */}
                    <TouchableOpacity
                      style={styles.nextClassButton}
                      onPress={() =>
                        handleGoToClass(item.description, navigation)
                      }
                    >
                      <Text style={styles.nextClassButtonText}>
                        Go to Class
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
      <NextClassButton eventObserver={eventsObserver} />
    </View>
  );
}

const styles = StyleSheet.create({
  eventContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  eventTimeContainer: {
    marginRight: 12,
    alignItems: "center",
    minWidth: 45,
  },
  eventTimeHour: {
    fontSize: 16,
    fontWeight: "600",
    color: "#862532",
  },
  eventTimeAmPm: {
    fontSize: 12,
    color: "#666666",
  },
  eventMainContent: {
    flex: 1,
  },
  eventHint: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
    fontStyle: "italic",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingBottom: 50, // For bottom navbar
  },
  headerSection: {
    paddingTop: 45,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  headerButton: {
    padding: 6,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  headerButtonText: {
    fontSize: 20,
    color: "#862532",
    fontWeight: "bold",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.5,
  },
  dropdownContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDropdown: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    width: "90%",
    paddingTop: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#151114",
    marginBottom: 10,
  },
  modalItem: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#a1a1a1",
  },
  modalItemText: {
    fontSize: 17,
    color: "#151114",
    fontWeight: "500",
  },
  modalLastItem: {
    borderBottomWidth: 0,
  },
  modalCancel: {
    backgroundColor: "#862532",
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 10,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    padding: 6,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  weekdaysRow: {
    flexDirection: "row",
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    padding: 2,
  },
  weekdayText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
  },
  weekRow: {
    flexDirection: "row",
    height: 32,
  },
  dayCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
    borderRadius: 16,
    position: "relative",
  },
  todayCell: {
    backgroundColor: "#f0f0f0",
  },
  selectedCell: {
    backgroundColor: "#862532",
  },
  otherMonthCell: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 13,
    color: "#333",
  },
  todayText: {
    fontWeight: "bold",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  otherMonthText: {
    color: "#BBB",
  },
  eventDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E6863C",
  },
  selectedDateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 6,
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  eventsContainer: {
    flex: 1,
    paddingTop: 4,
  },
  eventsList: {
    paddingHorizontal: 10,
    paddingBottom: 60,
  },
  noEventsText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 15,
    fontStyle: "italic",
  },
  eventBox: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: "#862532",
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
    fontWeight: "500",
  },
  expandedEvent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  eventLocation: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
    flex: 1,
  },
  nextClassButton: {
    backgroundColor: "#862532",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  nextClassButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
});
