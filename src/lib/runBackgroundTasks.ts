import { startCheckingAllShortlinks } from "@/lib/checkAllDomains";

export const runBackgroundTasks = () => {
  console.log("Starting background tasks...");

  // Start the periodic task
  const stopChecking = startCheckingAllShortlinks();

  // Log that tasks are running
  console.log("Background tasks are running.");

  // Optional: Return a cleanup/stop function
  return stopChecking; // You can use this to stop the tasks if needed
};
