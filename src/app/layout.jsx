import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "JogjaNavigator",
  description: "Chat, Go, Explore Yogyakarta!",
  keywords: ["Jogja", "Yogyakarta", "Travel", "Tourism", "Navigator", "Guide"],
  authors: [{ name: "JogjaNavigator" }],
  openGraph: {
    title: "JogjaNavigator",
    description: "Chat, Go, Explore Yogyakarta!",
    siteName: "JogjaNavigator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JogjaNavigator Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JogjaNavigator",
    description: "Chat, Go, Explore Yogyakarta!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
