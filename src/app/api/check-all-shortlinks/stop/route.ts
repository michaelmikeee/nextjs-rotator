import { NextResponse } from "next/server";

let interval: NodeJS.Timeout | null = null;

export async function GET() {
  if (interval) {
    clearInterval(interval);
    interval = null;
    console.log("Stopped periodic shortlink checking");
  }

  return NextResponse.json({ message: "Shortlink checker stopped" });
}
