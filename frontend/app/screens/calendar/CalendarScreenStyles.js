// CalendarScreenStyles.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "flex-start", // Start from left
    alignItems: "center",
    padding: 16,
    marginTop: "10%",
    paddingBottom: 8,
    position: "relative", // For absolute positioning of child
  },
  absoluteCenterContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensure it's above other elements
    pointerEvents: "none", // Allow tapping buttons underneath
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto", // Push to right side
  },
  headerText: {
    fontSize: 24,
    color: "#000000",
    fontWeight: "700",
    textAlign: "center",
  },
  monthText: {
    fontSize: 16,
    color: "#666",
    marginTop: 2,
    fontWeight: "500",
    textAlign: "center",
  },
  arrowButton: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 2, // Ensure buttons are clickable
  },
  arrowText: {
    color: "black",
    fontWeight: "700",
  },
  calendarMenuButton: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2, // Ensure buttons are clickable
  },

  // Week selector styles
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  dayContainer: {
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    width: 48,
  },
  selectedDayContainer: {
    backgroundColor: "#862532",
    shadowColor: "#862532",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  dayName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "600",
  },
  todayText: {
    color: "#862532",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },

  // Day event indicators styles
  dayEventDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
    height: 6,
  },
  dayEventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },

  // Calendar selection styles
  dropdownContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },

  // Timeline and events styles
  calendarBody: {
    flex: 1,
    marginTop: 8,
    paddingBottom: 60, // Space for bottom navigation
    marginHorizontal: 16, // Add horizontal margin
  },
  timelineContainer: {
    flex: 1,
    borderRadius: 12, // Rounded corners for the timeline container
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineContent: {
    flexDirection: "row",
    height: 30 * 29, // 29 half-hour slots from 8:00 to 22:30
  },
  hoursColumn: {
    width: 60,
    backgroundColor: "#FBFBFB",
    borderRightWidth: 0.5, // Thinner border
    borderRightColor: "#E8E8E8",
  },
  timeSlotRow: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 0, // Remove bottom borders for cleaner look
  },
  hourText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500", // Make hour text slightly bolder
  },
  halfHourText: {
    color: "#BBB", // Lighter color for half-hour markers
    fontSize: 12,
  },
  eventsColumn: {
    flex: 1,
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  timeSlotLine: {
    height: 30,
    borderBottomWidth: 0.5, // Thinner line
    borderBottomColor: "#F5F5F5", // Lighter color for grid lines
  },
  hourSlotLine: {
    height: 30,
    borderBottomWidth: 0.5, // Slightly more visible for full hours
    borderBottomColor: "#EEEEEE",
  },
  eventCard: {
    padding: 12,
    borderRadius: 10,
    position: "absolute",
    left: 10,
    right: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 10,
    overflow: "hidden",
    // Add minimum height to ensure content visibility
    minHeight: 60,
    // Add display flex to better organize content
    display: "flex",
    flexDirection: "column",
  },
  eventTime: {
    color: "#555", // Darker text for better readability on colored cards
    fontSize: 14,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333", // Darker text for better readability on colored cards
  },
  eventDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    minHeight: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  eventLocation: {
    color: "#333", // Match the dark text color used throughout the app
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500", // Add a bit of weight for better readability
  },

  // For the Go to Class button in expanded view
  goToClassButton: {
    backgroundColor: "#862532", // Maintain the app's primary color
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10, // Match the rounded style of other buttons
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#000", // Add subtle shadow to match other buttons
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  // For the button text
  goToClassButtonText: {
    color: "#FFFFFF",
    fontWeight: "600", // Match the weight of other button text
  },

  eventCardExpanded: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },

  // No events message
  noEventsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // Modal styles - Updated for more modern look
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "85%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginTop: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  modalItem: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  modalLastItem: {
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  modalCancel: {
    backgroundColor: "#862532",
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    // No border radius on bottom as it matches the container
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Guest container
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  bottomNavBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  threeDots: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 20,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#862532",
    marginVertical: 2,
  },
});

export default styles;
