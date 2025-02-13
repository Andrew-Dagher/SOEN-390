import React from 'react';
import { render } from '@testing-library/react-native';
import { Calendar } from 'react-native-calendars';

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
