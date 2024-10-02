// Function to build dynamic expressions for UpdateItem
// Takes in object with fields and breaks keys and values
// into the necessary parts for the UpdateItem operation
// Utility function to normalize various time formats to the database's 12-hour AM/PM format
function normalizeTimeFormat(time) {
  // Check if time is already in the desired AM/PM format
  if (/^(0?[1-9]|1[0-2]):[0-5][0-9] ?(AM|PM)$/i.test(time.trim())) {
    return time.toUpperCase().trim(); // Return as-is if it's already correct
  }

  // Handle 24-hour format (e.g., "14:00")
  let [hour, minute] = time.split(":");
  minute = minute.replace(/[^0-9]/g, ""); // Clean any non-numeric characters from minutes
  hour = parseInt(hour, 10);

  let period = "AM"; // Default to AM

  // Convert 24-hour to 12-hour format
  if (hour >= 12) {
    period = "PM";
    if (hour > 12) hour -= 12;
  } else if (hour === 0) {
    hour = 12; // Midnight is 12:00 AM
  }

  // Pad minutes to ensure it's always two digits
  minute = minute.padStart(2, "0");

  // Return time in the database's expected format
  return `${hour}:${minute} ${period}`;
}

export  { 
  normalizeTimeFormat
};