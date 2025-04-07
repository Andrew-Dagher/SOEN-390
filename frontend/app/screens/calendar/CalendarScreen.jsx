import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
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
import { trackEvent } from "@aptabase/react-native";
import { useAppSettings } from "../../AppSettingsContext";
import styles from "./CalendarScreenStyles.js";
import getThemeColors from "../../ColorBindTheme";
import { Coachmark } from "react-native-coachmark";

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { isSignedIn } = useAuth();
  const { textSize } = useAppSettings();
  const theme = getThemeColors();
  // Event observer for notifications
  const [eventsObserver] = useState(new EventObserver());

  // In-app notification state
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);

  // Calendar state
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Date navigation state
  const [selectedDate, setSelectedDate] = useState(moment().startOf("day"));
  const [weekStartDate, setWeekStartDate] = useState(moment().startOf("week"));

  // Get current month display
  const currentMonthDisplay = useMemo(() => {
    // Show month name and year
    return weekStartDate.format("MMMM YYYY");
  }, [weekStartDate]);

  // Generate weekdays for the week view
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(moment(weekStartDate).add(i, "days"));
    }
    return days;
  }, [weekStartDate]);

  // Create timeline slots with half-hour increments
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 8; i <= 22; i++) {
      slots.push(`${i}:00`);
      slots.push(`${i}:30`);
    }
    return slots;
  }, []);

  // Calendar-specific color assignment
  const getEventColor = (event) => {
    const colors = [
      "#FF9AA2", // Soft pink
      "#FFDAC1", // Peach
      "#B5EAD7", // Mint
      "#C7CEEA", // Periwinkle blue
      "#F9D89C", // Pale gold
      "#BF9ACA", // Lilac
      "#95B8D1", // Steel blue
      "#E2F0CB", // Pale lime
      "#FFB7B2", // Light coral
      "#D4EFDF", // Seafoam green
    ];

    // Create a hash code that includes calendar ID and event details
    const getEventHash = (event) => {
      // Extract time part only from start and end time (HH:MM format)
      const startTime = new Date(event.start.dateTime)
        .toTimeString()
        .substring(0, 5);
      const endTime = new Date(event.end.dateTime)
        .toTimeString()
        .substring(0, 5);

      // Get the calendar ID (assuming it's available in the event object)
      // If not directly available, you might need to track which calendar an event belongs to
      const calendarId = event.calendarId || selectedCalendar;

      // First hash the title, start and end times to get event identity
      const eventIdentity = `${event.title}_${startTime}_${endTime}`;

      let hash = 0;
      for (let i = 0; i < eventIdentity.length; i++) {
        hash = (hash << 5) - hash + eventIdentity.charCodeAt(i);
        hash = hash & hash;
      }

      // Combine with calendar ID to make colors reset per calendar
      return `${calendarId}_${hash}`;
    };

    const hashString = getEventHash(event);

    // Create a numeric hash from the hash string for the final color selection
    let numericHash = 0;
    for (let i = 0; i < hashString.length; i++) {
      numericHash = (numericHash << 5) - numericHash + hashString.charCodeAt(i);
      numericHash = numericHash & numericHash;
    }

    return colors[Math.abs(numericHash) % colors.length];
  };

  // Show in-app notification
  const showInAppNotification = (message) => {
    setNotificationMessage(message);
    setNotificationVisible(true);
    setTimeout(() => setNotificationVisible(false), 5000);
  };

  // Add events by day to track which days have events
  const eventsByDay = useMemo(() => {
    // Then organize events by day with their assigned colors
    const dayMap = {};
    events.forEach((event) => {
      const day = moment(event.start.dateTime).format("YYYY-MM-DD");
      if (!dayMap[day]) {
        dayMap[day] = [];
      }

      dayMap[day].push({
        id: event.id,
        color: getEventColor(event),
      });
    });

    return dayMap;
  }, [events]);

  // Filter events for selected day
  const filteredEvents = events.filter((event) => {
    const eventDate = moment(event.start.dateTime);
    return eventDate.isSame(selectedDate, "day");
  });

  // Position events according to their start time with adaptive height calculation
  const positionedEvents = useMemo(() => {
    return filteredEvents.map((event) => {
      const startTime = moment(event.start.dateTime);
      const endTime = moment(event.end.dateTime);
      const startHour = startTime.hour();
      const startMinute = startTime.minute();
      const duration = moment.duration(endTime.diff(startTime)).asMinutes();

      // Calculate position and height
      const topPosition = (startHour - 8) * 60 + startMinute;

      // Minimum height of 60px for all events to ensure content is visible
      const height = Math.max(60, duration);

      // Calculate the necessary expansion for details - 90px is roughly the space needed
      // for the location text (with 2 lines) and Go to Class button with proper spacing
      const detailsRequiredHeight = 110;

      // Calculate how much additional height is needed based on the current height
      // If the card is already tall enough, we may need less or no additional height
      const additionalHeightNeeded = Math.max(
        0,
        detailsRequiredHeight - height + 30
      );

      // Set expanded height to only add what's actually needed
      const expandedHeight =
        height + (expandedEvent === event.id ? additionalHeightNeeded : 0);

      return {
        ...event,
        topPosition,
        height,
        expandedHeight,
        formattedTime: `${startTime.format("HH:mm")} - ${endTime.format(
          "HH:mm"
        )}`,
      };
    });
  }, [filteredEvents, expandedEvent]);

  // Observer callbacks
  useEffect(() => {
    const observerCallback = (events) => {
      NotificationObserver(events, showInAppNotification, selectedDate);
    };

    eventsObserver.subscribe(observerCallback);
    return () => eventsObserver.unsubscribe(observerCallback);
  }, [eventsObserver, selectedDate]);

  // Notify observer when events change
  useEffect(() => {
    if (events.length > 0) {
      eventsObserver.notify(events);
    }
  }, [events, eventsObserver]);

  // Load stored calendars
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
        }
      } catch (error) {
        console.error("Error loading stored calendar data:", error);
      }
    };

    loadStoredData();
  }, []);

  // Fetch events for the selected date range
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCalendar) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const startDate = weekStartDate.clone().toISOString();
      const endDate = weekStartDate.clone().add(7, "days").toISOString();

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
  }, [selectedCalendar, weekStartDate]);

  // Previous/Next week navigation
  const navigateToPreviousWeek = () => {
    setWeekStartDate(weekStartDate.clone().subtract(7, "days"));
  };

  const navigateToNextWeek = () => {
    setWeekStartDate(weekStartDate.clone().add(7, "days"));
  };

  // Guest mode view
if (!isSignedIn) {
  return (
    <View style={styles.guestContainer}>
      <Coachmark
        message="Sign in to access your calendar events!"
        autoShow
      >
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
      </Coachmark>
    </View>
  );
}

  // Loading view
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          testID="loading-indicator" // Add test ID for loading state
          size="large"
          color= {theme.backgroundColor}
        />
      </View>
    );
  }

  trackEvent("Calendar Screen selected", {});

  // Render main calendar view
  return (
    <View style={styles.screen}>
      {/* In-App Notification */}
      <InAppNotification
        message={notificationMessage}
        visible={notificationVisible}
      />
      {/* Calendar Header */}
      <View style={styles.header}>
        {/* Absolutely positioned title centered on screen */}
        <View style={styles.absoluteCenterContainer}>
          <Text style={[styles.headerText, { fontSize: textSize + 4 }]}>
            My Calendar
          </Text>
          <Text style={[styles.monthText, { fontSize: textSize }]}>
            {currentMonthDisplay}
          </Text>
        </View>

        {/* Left arrow button - positioned normally */}
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={navigateToPreviousWeek}
        >
          <Text style={[styles.arrowText, { fontSize: textSize + 2 }]}>←</Text>
        </TouchableOpacity>

        {/* Right-side container - using marginLeft: auto to push it to the right */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.calendarMenuButton}
            testID="calendar-menu-button"
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.threeDots}>
              <Text style={{ opacity: 0, height: 0 }}>...</Text>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={navigateToNextWeek}
          >
            <Text style={[styles.arrowText, { fontSize: textSize + 2 }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Week Selector */}
      <View style={styles.weekContainer}>
        {weekDays.map((day) => (
          <TouchableOpacity
            key={`day-${day.format("YYYY-MM-DD")}`}
            style={[
              styles.dayContainer,
              day.isSame(selectedDate, "day") && styles.selectedDayContainer,
            ]}
            onPress={() => setSelectedDate(day)}
          >
            <Text
              style={[
                styles.dayName,
                day.isSame(selectedDate, "day") && styles.selectedDayText,
                { fontSize: textSize - 2 },
              ]}
            >
              {day.format("ddd")}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                day.isSame(moment(), "day") && styles.todayText,
                day.isSame(selectedDate, "day") && styles.selectedDayText,
                { fontSize: textSize },
              ]}
            >
              {day.format("D")}
            </Text>

            {/* Event dots indicator */}
            {eventsByDay[day.format("YYYY-MM-DD")] && (
              <View style={styles.dayEventDotsContainer}>
                {eventsByDay[day.format("YYYY-MM-DD")]
                  .slice(0, 3)
                  .map((event) => (
                    <View
                      key={`dot-${event.id}`}
                      style={[
                        styles.dayEventDot,
                        { backgroundColor: event.color },
                        day.isSame(selectedDate, "day") && {
                          backgroundColor: "#fff",
                          opacity: 0.8,
                        },
                      ]}
                    />
                  ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {/* Calendar Body - Timeline and Events */}
      <View style={styles.calendarBody}>
        {filteredEvents.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Text style={[styles.noEventsText, { fontSize: textSize }]}>
              No events for{selectedDate.format(" MMM DD, YYYY")}
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {/* Timeline with half-hour increments */}
            <ScrollView>
              <View style={styles.timelineContent}>
                {/* Hours column */}
                <View style={styles.hoursColumn}>
                  {timeSlots.map((slot) => (
                    <View key={`timeslot-${slot}`} style={styles.timeSlotRow}>
                      <Text
                        style={[
                          slot.endsWith("00")
                            ? styles.hourText
                            : styles.halfHourText,
                          {
                            fontSize: slot.endsWith("00")
                              ? textSize - 2
                              : textSize - 4,
                          },
                        ]}
                      >
                        {slot}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Events container */}
                <View style={styles.eventsColumn}>
                  {/* Time slot grid lines */}
                  {timeSlots.map((slot) => (
                    <View
                      key={`grid-line-${slot}`}
                      style={[
                        slot.endsWith("00")
                          ? styles.hourSlotLine
                          : styles.timeSlotLine,
                      ]}
                    />
                  ))}

                  {/* Positioned events with adaptive height */}
                  {positionedEvents.map((event) => {
                    const eventColor = getEventColor(event);
                    return (
                      <TouchableOpacity
                        key={`event-${event.id}`}
                        style={[
                          styles.eventCard,
                          {
                            backgroundColor: eventColor,
                            top: event.topPosition,
                            height:
                              expandedEvent === event.id
                                ? event.expandedHeight
                                : event.height,
                            zIndex: expandedEvent === event.id ? 20 : 10,
                          },
                          expandedEvent === event.id &&
                            styles.eventCardExpanded, // Add enhanced shadow when expanded
                        ]}
                        onPress={() =>
                          setExpandedEvent(
                            expandedEvent === event.id ? null : event.id
                          )
                        }
                      >
                        <Text
                          style={[styles.eventTime, { fontSize: textSize - 2 }]}
                        >
                          {event.formattedTime}
                        </Text>
                        <Text
                          style={[styles.eventTitle, { fontSize: textSize }]}
                          numberOfLines={
                            expandedEvent === event.id ? undefined : 1
                          }
                          ellipsizeMode="tail"
                        >
                          {event.title}
                        </Text>

                        {expandedEvent === event.id && (
                          <View style={styles.eventDetails}>
                            <Text
                              style={[
                                styles.eventLocation,
                                { fontSize: textSize - 2 },
                              ]}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              <Text style={{ fontWeight: "600" }}>📍</Text>{" "}
                              {event.description
                                .replace(/<\/?pre>/g, "")
                                .trim()}
                            </Text>

                            <TouchableOpacity
                              style={styles.goToClassButton}
                              onPress={() =>
                                handleGoToClass(event.description, navigation)
                              }
                            >
                              <Text
                                style={[
                                  styles.goToClassButtonText,
                                  { fontSize: textSize - 2 },
                                ]}
                              >
                                Go to Class
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
      {/* Floating Next Class Button */}
      <NextClassButton eventObserver={eventsObserver} />
      {/* Calendar Selection Modal */}
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
            <Text style={[styles.modalTitle, { fontSize: textSize }]}>
              Choose a Calendar
            </Text>
            {calendars.map((calendar, index) => (
              <TouchableOpacity
                key={`calendar-${calendar.id}`}
                style={[
                  styles.modalItem,
                  index === calendars.length - 1 ? styles.modalLastItem : null,
                ]}
                onPress={async () => {
                  setSelectedCalendar(calendar.id);
                  await AsyncStorage.setItem("selectedCalendar", calendar.id);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[styles.modalItemText, { fontSize: textSize - 1 }]}
                >
                  {calendar.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={[styles.modalCancelText, { fontSize: textSize - 1 }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
