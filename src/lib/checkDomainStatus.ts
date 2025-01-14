export const runtime = "nodejs";

import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false, // Bypass SSL verification
});

export async function POST(req: Request) {
  try {
    const { domainUrl } = await req.json();

    if (!domainUrl) {
      return NextResponse.json(
        { message: "Domain URL is required" },
        { status: 400 }
      );
    }

    const url =
      "https://trustpositif.kominfo.go.id/Rest_server/getrecordsname_home";
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0 Safari/537.36",
      Origin: "https://trustpositif.kominfo.go.id",
      Referer: "https://trustpositif.kominfo.go.id/",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
    };
    const payload = new URLSearchParams({
      csrf_token: "d82d36271ea86cf9874f4042ef4e5918", // Update token if needed
      name: domainUrl,
    });

    const response = await axios.post(url, payload, {
      headers,
      httpsAgent: agent,
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch domain status:", error);
    return NextResponse.json(
      { message: "Failed to fetch domain status", error: String(error) },
      { status: 500 }
    );
  }
}
