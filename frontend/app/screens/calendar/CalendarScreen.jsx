import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import moment from "moment";
import { fetchPublicCalendarEvents } from "../login/LoginHelper";
import { handleGoToClass } from "./CalendarHelper";
import GoToLoginButton from "../../components/Calendar/GoToLoginButton";
import styles from "./CalendarScreenStyles";
import EventObserver from "./EventObserver";
import { NotificationObserver } from "./NotificationObserver";
import InAppNotification from "../../components/InAppNotification";
import NextClassButton from "../../components/Calendar/NextClassButton";
import { trackEvent } from "@aptabase/react-native";
import { Coachmark } from "react-native-coachmark";

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { isSignedIn } = useAuth();

  const [eventsObserver] = useState(new EventObserver());
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [currentStartDate, setCurrentStartDate] = useState(
    moment().startOf("day")
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [showCoachMark, setShowCoachMark] = useState(false);

  useEffect(() => {
    const observerCallback = (events) => {
      NotificationObserver(events, showInAppNotification, currentStartDate);
    };

    eventsObserver.subscribe(observerCallback);
    return () => eventsObserver.unsubscribe(observerCallback);
  }, [eventsObserver, currentStartDate]);

  const showInAppNotification = (message) => {
    setNotificationMessage(message);
    setNotificationVisible(true);
    setTimeout(() => setNotificationVisible(false), 5000);
  };

  useEffect(() => {
    if (events.length > 0) eventsObserver.notify(events);
  }, [events, eventsObserver]);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedCalendars = await AsyncStorage.getItem("availableCalendars");
        const storedSelectedCalendar = await AsyncStorage.getItem("selectedCalendar");
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

  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCalendar) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const startDate = currentStartDate.toISOString();
      const endDate = currentStartDate.clone().add(10, "days").toISOString();

      let fetchedEvents = await fetchPublicCalendarEvents(
        selectedCalendar,
        startDate,
        endDate
      );

      const regex = /^[^,]+,[^,]+,[^,]+$/;
      fetchedEvents = fetchedEvents.filter((event) => {
        const description = event.description?.trim() || "";
        return regex.test(description);
      });

      setEvents(fetchedEvents);
      setLoading(false);
    };

    fetchEvents();
  }, [selectedCalendar, currentStartDate]);

  useEffect(() => {
    if (!isSignedIn) setShowCoachMark(true);
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <View style={styles.guestContainer}>
        <Coachmark
          message="Sign in to access your calendar events!"
          autoShow={showCoachMark}
          onHide={() => setShowCoachMark(false)}
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

        <View style={styles.bottomNavBar}>
          <BottomNavBar />
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#862532" />
      </View>
    );
  }

  trackEvent("Calendar Screen selected", {});

  return (
    <View style={styles.screen}>
      <InAppNotification
        message={notificationMessage}
        visible={notificationVisible}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={() =>
            setCurrentStartDate(currentStartDate.clone().subtract(10, "days"))
          }
        >
          <Text style={styles.paginationButtonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Google Calendar</Text>
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={() =>
            setCurrentStartDate(currentStartDate.clone().add(10, "days"))
          }
        >
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centeredDateContainer}>
        <Text style={styles.centeredDateText}>
          {currentStartDate.format("MMM DD")} -{" "}
          {currentStartDate.clone().add(9, "days").format("MMM DD")}
        </Text>
      </View>

      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            trackEvent("Get Directions to next class", {});
            setModalVisible(true);
          }}
        >
          <Text style={styles.dropdownButtonText}>
            {calendars.find((c) => c.id === selectedCalendar)?.name ||
              "Select Calendar"}
          </Text>
        </TouchableOpacity>

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

      <View style={styles.container}>
        {events.length === 0 ? (
          <Text style={styles.noEventsText}>
            No events found for this range.
          </Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
              <View style={styles.eventBox}>
                <TouchableOpacity
                  onPress={() =>
                    setExpandedEvent(expandedEvent === item.id ? null : item.id)
                  }
                >
                  <Text style={styles.eventTitle}>{item.title}</Text>
                </TouchableOpacity>
                {expandedEvent === item.id && (
                  <View>
                    <Text style={styles.eventLocation}>
                      📍 {item.description.replace(/<\/?pre>/g, "").trim()}
                    </Text>
                    <Text style={styles.eventTime}>
                      {moment(item.start.dateTime).format("YYYY-MM-DD HH:mm")} -{" "}
                      {moment(item.end.dateTime).format("HH:mm")}
                    </Text>
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
                )}
              </View>
            )}
          />
        )}
      </View>
      <NextClassButton eventObserver={eventsObserver} />
    </View>
  );
}
