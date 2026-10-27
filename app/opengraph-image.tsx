import { ImageResponse } from "next/og";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

// Share image for links to FarmPaisa (WhatsApp, Facebook, X, search results).
// Built once at build time, in English, from the brand icon and the dashboard screenshot.

export const alt = "FarmPaisa – Track. Harvest. Earn. Free farm accounts app for Indian farmers.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (path: string, type: string) =>
  readFile(join(process.cwd(), "public", path), "base64").then(data => `data:${type};base64,${data}`);

const [icon, shot] = await Promise.all([
  asset("brand/farmpaisa-icon.svg", "image/svg+xml"),
  asset("landing/dashboard-desktop.png", "image/png"),
]);

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #052e16 0%, #14532d 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 72px", width: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={icon} width={64} height={64} alt="" />
            <span style={{ fontSize: 40, fontWeight: 700 }}>FarmPaisa</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40, fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            <span style={{ color: "#86efac" }}>Track.</span>
            <span style={{ color: "#fcd34d" }}>Harvest.</span>
            <span>Earn.</span>
          </div>
          <p style={{ marginTop: 32, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.8)" }}>
            Free farm expense &amp; profit app for Indian farmers. In English, Hindi and Punjabi.
          </p>
        </div>
        {/* Dashboard screenshot, running off the right edge */}
        <img src={shot} width={880} height={550} alt="" style={{ position: "absolute", left: 640, top: 90, borderRadius: 16, border: "6px solid rgba(255,255,255,0.15)", boxShadow: "0 30px 60px rgba(0,0,0,0.45)" }} />
      </div>
    ),
    size,
  );
}
