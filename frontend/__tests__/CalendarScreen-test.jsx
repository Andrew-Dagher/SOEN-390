import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Calendar } from 'react-native-calendars';
import { NavigationContainer } from '@react-navigation/native';
import CalendarScreen from '../app/screens/calendar/CalendarScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({
    name: 'CalendarScreen',
  }),
}));

describe('<Calendar />', () => {
  test('it renders the calendar component', () => {
    // Render the Calendar component directly
    const { getByTestId } = render(
      <Calendar
        current={"2025-01-01"}
        minDate={"2025-01-01"}
        maxDate={"2025-12-31"}
        monthFormat={"yyyy MM"}
        onDayPress={(day) => console.log("selected day", day)}
        theme={{
          selectedDayBackgroundColor: "#E6863C",
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: "#862532",
          arrowColor: "#862532",
        }}
        testID="calendar-view"
      />
    );

    // Get the calendar view by its testID
    const calendarComponent = getByTestId('calendar-view');

    expect(calendarComponent).toBeTruthy();
  });
});

describe('<CalendarScreen />', () => {
  const renderWithNavigation = () =>
    render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

  test('it renders the calendar component', () => {
    const { getByTestId } = renderWithNavigation();
    const calendarComponent = getByTestId('calendar-view');
    expect(calendarComponent).toBeTruthy();
  });

  test('it updates the displayed month when navigating with arrows', () => {
    const { getByText, getByTestId } = renderWithNavigation();
    
    // Initial month should be January
    expect(getByText('January')).toBeTruthy();

    // Simulate month change by calling the Calendar's onMonthChange
    fireEvent(getByTestId('calendar-view'), 'onMonthChange', { month: 2, year: 2025 });

    // Check that the month has updated to February
    expect(getByText('February')).toBeTruthy();
  });
});