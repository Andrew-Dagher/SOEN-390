/**
 * @file BusSchedule.jsx
 * @description A React Native component to display the bus schedule for departures between Loyola and SGW.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import busScheduleData from '../../data/bus_schedule.json';

/**
 * ScheduleTable component to display a formatted table of bus departure times.
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the schedule (e.g., "Monday - Thursday")
 * @param {Object} props.data - Data containing departure times from Loyola and SGW
 * @param {string[]} props.data.departures_from_loyola - Array of departure times from Loyola
 * @param {string[]} props.data.departures_from_sgw - Array of departure times from SGW
 */
const ScheduleTable = ({ title, data }) => (
  <View className="bg-white rounded-lg p-4 my-2">
    <Text className="text-lg font-bold text-center mb-2">{title}</Text>
    <View className="flex-row justify-between border-b border-gray-300 pb-2">
      <Text className="font-bold flex-1 text-center">Departures from Loyola</Text>
      <Text className="font-bold flex-1 text-center">Departures from S.G.W</Text>
    </View>
    {data.departures_from_loyola.map((time, index) => (
      <View key={index} className="flex-row justify-between py-2 border-b border-gray-200">
        <Text className="flex-1 text-center">{time}</Text>
        <Text className="flex-1 text-center">{data.departures_from_sgw[index] || ''}</Text>
      </View>
    ))}
  </View>
);

/**
 * BusSchedule component that fetches and displays bus schedules for different days of the week.
 * @component
 */
const BusSchedule = () => {
  const [schedule, setSchedule] = useState(null);

  // Load the bus schedule data on component mount
  useEffect(() => {
    setSchedule(busScheduleData);
  }, []);

  if (!schedule) return <Text className="text-white text-center mt-4">Loading schedule...</Text>;

  return (
    <View className="bg-[#862532] p-4 rounded-lg" style={{ maxHeight: 450, width: '90%' }}>
      <ScrollView>
        <ScheduleTable title="Monday - Thursday" data={schedule.monday_thursday} />
        <ScheduleTable title="Friday" data={schedule.friday} />
      </ScrollView>
    </View>
  );
};

export default BusSchedule;
