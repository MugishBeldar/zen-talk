import { DAYS } from "./enum";

export function capitalizeNames(name: string) {
  const names = name.split(" "); // Split the name into an array
  return names
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()) // Capitalize the first letter of each part
    .join(" ");
}

// export function formatDate(dateString: string) {
//   const now = new Date();

//   // Extract the components of the date string
//   const [dayName, date, time, timeWithAMPM] = dateString.split(" ");
//   console.log(
//     ": formatDate -> [dayName, date, time, timeWithAMPM]",
//     dayName,
//     date,
//     time,
//     timeWithAMPM
//   );
//   const [hour, minute] = time.split(":");
//   console.log(": formatDate -> hour, minute", hour, minute);

//   // Get the day of the week (0-6)
//   const currentDay = now.getDay();

//   let formattedDate = "";

//   // Check if today
//   if (DAYS[currentDay].toLowerCase() === dayName.toLowerCase()) {
//     formattedDate = `Today at ${hour}:${minute} ${timeWithAMPM.toLowerCase()}`;
//   }
//   // Check if yesterday
//   else if (DAYS[currentDay - 1 < 0 ? 6 : currentDay - 1] === dayName) {
//     formattedDate = `Yesterday at ${hour}:${minute} ${timeWithAMPM.toLowerCase()}`;
//   } else {
//     // Otherwise format as Day of week month-day at hour:minute AM/PM
//     formattedDate = `${date} at ${hour}:${minute} ${timeWithAMPM.toLowerCase()}`;
//   }

//   console.log(": formatDate -> formattedDate", formattedDate);
//   return formattedDate;
// }

export function extractTime(timeStamp: string) {
  if (!timeStamp) {
    return "";
  }
  const currentTimestamp = new Date();
  const time = new Date(timeStamp);

  const day = time.getDay();
  const isSameDay = currentTimestamp.toDateString() === time.toDateString();

  const yesterdayDate = new Date(currentTimestamp);
  yesterdayDate.setDate(currentTimestamp.getDate() - 1);
  const isYesterday = yesterdayDate.toDateString() === time.toDateString();

  const minutes = time.getMinutes();
  let hours = time.getHours();
  const period = hours < 12 ? "AM" : "PM";

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  if (isSameDay) {
    return `Today, ${formattedHours}:${formattedMinutes} ${period}`;
  } else if (isYesterday) {
    return `Yesterday, ${formattedHours}:${formattedMinutes} ${period}`;
  } else {
    return `${DAYS[day]}, ${formattedHours}:${formattedMinutes} ${period}`;
  }
}
