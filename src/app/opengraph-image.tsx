import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const bars = [38, 62, 24, 80, 50, 92, 30, 70, 44, 86, 58, 66];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1e1035 0%, #3b0764 45%, #831843 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #7c3aed, #db2777)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 6,
              padding: 12,
            }}
          >
            {[16, 26, 34, 22].map((h, i) => (
              <div key={i} style={{ width: 7, height: h, borderRadius: 4, background: "white" }} />
            ))}
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{siteConfig.name}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
              Learn algorithms by watching them work
            </div>
            <div style={{ marginTop: 24, fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
              Interactive tutorials · Visualizers · Works offline
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 260 }}>
            {bars.map((h, i) => (
              <div
                key={i}
                style={{
                  width: 26,
                  height: `${h}%`,
                  borderRadius: 8,
                  background: i === 5 ? "#34d399" : i === 3 || i === 9 ? "#fbbf24" : "rgba(196,181,253,0.85)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
