import { NextRequest, NextResponse } from "next/server";
import { caseDevClient } from "@/lib/case-dev/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const statusUrl = searchParams.get("statusUrl");
    const textUrl = searchParams.get("textUrl");

    if (!statusUrl) {
      return NextResponse.json(
        { error: "Status URL is required" },
        { status: 400 }
      );
    }

    console.log(`[OCR Status] Checking job ${jobId} at ${statusUrl}`);
    const result = await caseDevClient.getOCRStatus(statusUrl, textUrl || undefined);
    return NextResponse.json(result);
  } catch (error) {
    console.error("OCR status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get OCR status" },
      { status: 500 }
    );
  }
}
