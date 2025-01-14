import { NextResponse } from "next/server";
import { startCheckingAllShortlinks } from "@/lib/checkAllDomains";

let interval: NodeJS.Timeout | null = null;

export async function GET() {
  if (!interval) {
    console.log("Starting periodic shortlink checker...");
    interval = setInterval(async () => {
      try {
        await startCheckingAllShortlinks();
      } catch (err) {
        console.error("Error running periodic check:", err);
      }
    }, 60000); // Run every 60 seconds (1 minute)
  }

  return NextResponse.json({ message: "Shortlink checker running" });
}
