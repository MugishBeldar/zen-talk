/* eslint-disable @typescript-eslint/no-explicit-any */
import { DAYS } from "./enum";
import { Buffer } from "buffer";

export function capitalizeNames(name: string) {
  const names = name.split(" "); // Split the name into an array
  return names
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()) // Capitalize the first letter of each part
    .join(" ");
}

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

export const bufferToBase64 = (bufferObj: any) => {
  if (
    bufferObj &&
    bufferObj.type === "Buffer" &&
    Array.isArray(bufferObj.data)
  ) {
    const base64String = Buffer.from(bufferObj.data).toString("base64");
    return `data:image/jpeg;base64,${base64String}`;
  }
};
