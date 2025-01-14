import { NextResponse } from "next/server";
import { runBackgroundTasks } from "@/lib/runBackgroundTasks";

let tasksStarted = false;

export async function GET() {
  if (!tasksStarted) {
    tasksStarted = true;
    console.log("Starting background tasks...");
    runBackgroundTasks();
    return NextResponse.json({ message: "Background tasks started." });
  } else {
    return NextResponse.json({
      message: "Background tasks are already running.",
    });
  }
}
