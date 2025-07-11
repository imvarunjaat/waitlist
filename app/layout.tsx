import type { Metadata } from "next";
import { Geist, Geist_Mono, UnifrakturMaguntia } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gothicFont = UnifrakturMaguntia({
  weight: ["400"],
  variable: "--font-gothic",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ogadda",
  description: "Build for Og's",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
    other: [
      {
        url: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        url: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-7F91JW65W5`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7F91JW65W5');
          `,
        }}
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gothicFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
