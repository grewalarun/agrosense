import type { MetadataRoute } from "next";

// Lets FarmPaisa be added to a phone's home screen like an app
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FarmPaisa",
    short_name: "FarmPaisa",
    description: "Track every rupee your farm spends and earns, crop by crop.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#faf9f5",
    theme_color: "#166534",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/farmpaisa-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
