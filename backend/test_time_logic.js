// Test the updated time overlap logic used in the frontend
const time1Start = "11:41:00";
const time1End = "01:41:00";
const time2Start = "11:42:00";
const time2End = "01:42:00";

console.log("Testing updated time overlap logic...");

// Create Date objects as done in the frontend
const formStartTime = new Date(`2000-01-01T${time2Start}`);
const formEndTime = new Date(`2000-01-01T${time2End}`);
const clsStartTime = new Date(`2000-01-01T${time1Start}`);
const clsEndTime = new Date(`2000-01-01T${time1End}`);

console.log("Class 1:", clsStartTime.toString(), "to", clsEndTime.toString());
console.log("Class 2:", formStartTime.toString(), "to", formEndTime.toString());

// Handle cases where end time is before start time (spans midnight)
const formEndTimeAdjusted = formEndTime < formStartTime ? 
  new Date(formEndTime.getTime() + 24 * 60 * 60 * 1000) : formEndTime;
const clsEndTimeAdjusted = clsEndTime < clsStartTime ? 
  new Date(clsEndTime.getTime() + 24 * 60 * 60 * 1000) : clsEndTime;

console.log("Class 1 adjusted:", clsStartTime.toString(), "to", clsEndTimeAdjusted.toString());
console.log("Class 2 adjusted:", formStartTime.toString(), "to", formEndTimeAdjusted.toString());

// Check if times overlap
const overlaps = (formStartTime < clsEndTimeAdjusted && formEndTimeAdjusted > clsStartTime);
console.log("Do they overlap?", overlaps);

// Check individual conditions
console.log("formStartTime < clsEndTimeAdjusted:", formStartTime < clsEndTimeAdjusted, formStartTime.getTime(), "<", clsEndTimeAdjusted.getTime());
console.log("formEndTimeAdjusted > clsStartTime:", formEndTimeAdjusted > clsStartTime, formEndTimeAdjusted.getTime(), ">", clsStartTime.getTime());