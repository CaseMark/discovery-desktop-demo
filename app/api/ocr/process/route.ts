import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { caseDevClient } from "@/lib/case-dev/client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = formData.get("fileName") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const finalFileName = fileName || file.name;

    // Check if Vercel Blob is configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    let documentUrl: string;

    if (blobToken) {
      // Upload to Vercel Blob for production
      console.log("[OCR] Uploading to Vercel Blob:", finalFileName);

      const blob = await put(`ocr-uploads/${Date.now()}-${finalFileName}`, file, {
        access: "public",
        addRandomSuffix: true,
      });

      documentUrl = blob.url;
      console.log("[OCR] Blob URL:", documentUrl);
    } else {
      // Fallback to base64 data URL for local development
      console.log("[OCR] No Blob token, using base64 data URL");

      const fileData = await file.arrayBuffer();
      const base64Data = arrayBufferToBase64(fileData);
      documentUrl = `data:${file.type};base64,${base64Data}`;
    }

    // Submit to OCR service
    const result = await caseDevClient.submitOCR(documentUrl, finalFileName);

    return NextResponse.json(result);
  } catch (error) {
    console.error("OCR submit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OCR submission failed" },
      { status: 500 }
    );
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
