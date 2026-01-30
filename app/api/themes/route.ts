import { NextResponse } from "next/server";
import { getSystemThemePresets } from "@/lib/data/themes";

export async function GET() {
  try {
    const presets = await getSystemThemePresets();

    return NextResponse.json({
      success: true,
      presets,
    });
  } catch (error) {
    console.error("Get theme presets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
