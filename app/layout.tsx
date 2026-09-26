import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://route.jev.works"),
  title: "Jev Router Lab",
  description: "Unofficial community tool and model routing with Jev: closed-set choices, explicit fallbacks, and application-owned authorization.",
  openGraph: {
    type: "website",
    siteName: "Jev Router Lab",
    title: "Jev Router — selection is not authorization",
    description: "An unofficial TypeScript routing lab with closed choices and inspectable fallback policies.",
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/opengraph-image", alt: "Jev Router — unofficial community tool and model routing" }],
  },
};

/** Apply a saved theme before first paint. Dark is the default. */
const themeScript = `(function(){try{var t=localStorage.getItem("jev-router:theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <main>{children}</main>
      </body>
    </html>
  );
}
