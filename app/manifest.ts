import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TRUTH_SIGNAL",
    short_name: "TRUTH",
    description: "Autonomous Signal Protocol for Human Verification",
    start_url: "/feed",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#FF3366",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
