import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false, // Bypass SSL verification
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { domainUrl } = body;

  // Validate domainUrl
  if (!domainUrl || typeof domainUrl !== "string") {
    return NextResponse.json(
      { message: "Valid domain URL is required" },
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

  try {
    const response = await axios.post(url, payload, {
      headers,
      httpsAgent: agent, // Use the agent to bypass SSL verification
    });

    // Return the API response
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Failed to fetch domain status:", error);

    // Handle specific Axios errors
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data || error.message;
      return NextResponse.json(
        {
          message: "Failed to fetch domain status",
          error: errorMessage,
        },
        { status: error.response?.status || 500 }
      );
    }

    // Handle other unknown errors
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
