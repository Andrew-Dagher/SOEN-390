import axios from "axios";
import * as Location from "expo-location";
import { polygons } from "../navigation/navigationConfig";

export async function fetchGeminiData(tasks) {
  console.log("Tasks:", tasks);
  const classes = tasks.classes;
  const tasksOnly = tasks.tasks;
  // Get the user's current location
  const currentLocation = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = currentLocation.coords;

  // Helper function to match tasks to university locations
  const matchUniversityLocation = (classLocation) => {
    for (const polygon of polygons) {
      if (
        classLocation.location
          .toLowerCase()
          .includes(polygon.name.toLowerCase())
      ) {
        const { latitude, longitude } = polygon.point;
        return {
          ...classLocation,
          latitude,
          longitude,
          building: polygon.name,
          type: "university",
        };
      }
    }
    return null; // No match found
  };

  // Separate tasks into university-related and external tasks
  const universityLocations = [];
  const externalTasks = [];

  classes.forEach((classItem) => {
    const matchedLocation = matchUniversityLocation(classItem);
    if (matchedLocation) {
      universityLocations.push(matchedLocation);
    } else {
      console.log("No match found for class location:", classItem.location);
    }
  });

  const externalLocations = await Promise.all(
    tasksOnly.map(async (task) => {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${
        task.name + " " + task.location
      }&location=${latitude},${longitude}&radius=1500&key=${
        process.env.EXPO_PUBLIC_GOOGLE_API_KEY
      }`;
      // console.log("Google Maps API URL:", url);

      try {
        if (task.location.toLowerCase() === "online") {
          return { ...task, nearestLocations: [], type: "online" };
        }
        const response = await axios.get(url);
        const results = response.data.results;

        if (results.length > 0) {
          //   console.log("Found locations for task:", task);
          //   console.log("Location details:", results);

          // Collect multiple locations for the task
          const nearestLocations = results.map((result) => {
            const { lat, lng } = result.geometry.location;
            return {
              name: result.name,
              latitude: lat,
              longitude: lng,
              address: result.vicinity,
              rating: result.rating || null, // Include rating if available
              type: result.types || [], // Include types of the location
            };
          });

          return { ...task, nearestLocations, type: "external" }; // Return the task with its nearest locations
        } else {
          console.log("No location found for task:", task);
        }

        return { task, nearestLocations: [], type: "external" }; // Return an empty array if no results are found
      } catch (error) {
        console.error(`Error fetching location for task "${task}":`, error);
        return { task, nearestLocations: [], type: "external" }; // Return an empty array in case of an error
      }
    })
  );

  // Combine university locations and external locations
  const allLocations = [
    { name: "Current Location", latitude, longitude, type: "current location" },
    ...universityLocations,
    ...externalLocations,
  ];

  //console.log("All Locations:", JSON.stringify(allLocations, null, 2));
  // Generate a prompt for Gemini
  const geminiPrompt = `
      You are a route optimization assistant. Here is a list of tasks with their locations:
      ${JSON.stringify(allLocations, null, 2)}

      Constraints and Guidelines:
1. Classes (fixed):
   - Cannot be moved from their scheduled times.
   - Each class has an "id", "name", "location", "start_time", "end_time", and a "skippable" flag.
   - If a class is marked "skippable", tasks may overlap it.
   - If a class is not skippable, no tasks may overlap its time.

2. Tasks (flexible):
   - Each task has an "id", "name", "location", "start_time", "end_time", and an "important" flag.
   - Tasks can be rescheduled if it helps minimize walking distance.
   - If a task is "important", keep it at the same time or schedule it as early as possible.
   - Under no circumstance should a task overlap with a class that is not skippable.

3. Minimize walking distance by scheduling tasks as close as possible to the locations of adjacent classes.

**EVENTS SHOULD NOT CHANGE DURATION**
      Please generate an optimized route that minimizes travel time and returns the order of tasks to be completed.
      Generate the route in the following format but minimized json format without any new lines or extra spaces:
      [
        {
          "name": "Task 1",
          "latitude": 12.345678,
          "longitude": 98.765432
        },
        {
          "name": "Task 2",
          "latitude": 23.456789,
          "longitude": 87.654321
        }
      ]
        Ensure that the tasks are ordered in a way that minimizes travel time and time spent outside and makes sense with the start and end times of tasks.
        For external locations, include only the name of the chosen location in the task name. Do not include extra stuff like Montreal, QC, Canada
        Any tasks that share the exact same location should share the same object instead of being seperated with the name being the names of the tasks joined with a hyphen.
          EX: If Coffee and Lunch are at the same location, the name should be "Coffee - Lunch" and the location should be the same.
        Do not include any additional text or explanations.
    `.trim();

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: geminiPrompt }],
      },
    ],
  };

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${apiKey}`;

  //   console.log("Sending Gemini prompt:\n", geminiPrompt);

  try {
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      throw new Error(`Gemini API request failed with status ${res.status}`);
    }

    const data = await res.json();

    // Extract the output from the response
    const candidates = data.candidates;
    if (candidates && candidates.length > 0) {
      const outputText = candidates[0].content.parts[0].text; // Get the text from the first candidate
      const parsedOutput = JSON.parse(outputText); // Parse the JSON string into an object
      //   console.log("Parsed Output:", parsedOutput);
      return parsedOutput; // Return the parsed output
    } else {
      throw new Error("No candidates found in Gemini response.");
    }
  } catch (error) {
    console.error("Error fetching Gemini data:", error);
    throw error;
  }
}
