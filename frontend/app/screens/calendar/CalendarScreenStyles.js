// CalendarScreenStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginTop: "10%",
  },
  headerText: {
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 20,
    color: "#E6863C",
  },
  calendarListContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  calendarButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  selectedCalendarButton: {
    backgroundColor: "#862532",
  },
  calendarButtonText: {
    fontSize: 16,
    color: "#000",
  },
  selectedCalendarButtonText: {
    color: "#FFFFFF",
  },
  container: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  eventBox: {
    backgroundColor: "#F5F5F5",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  eventLocation: {
    color: "#007AFF",
    marginTop: 5,
  },
  eventTime: {
    color: "#862532",
    marginTop: 5,
  },
  nextClassButton: {
    backgroundColor: "#862532",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  nextClassButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  noEventsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  bottomNavBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  centeredDateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  centeredDateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E6863C",
    textAlign: "center",
  },

  dropdownContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  dropdownButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  // iOS-Style Modal Styles
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
    backgroundColor: "#842534",
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

  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  googleLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#862532",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  googleLoginContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: 30,
    height: 30,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 10,
  },
  googleLoginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
