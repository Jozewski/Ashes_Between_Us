// app/layout.js
import { Bebas_Neue, Share_Tech_Mono, Barlow } from "next/font/google";
import "./globals.css";
import { MusicProvider } from "@/components/MusicProvider";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono-game",
  display: "swap",
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  applicationName: "Ashes Between Us",
  title: {
    default: "Ashes Between Us",
    template: "%s | ABU",
  },
  description: "An apocalyptic butterfly-effect RPG. Your future self is trying to reach you.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${shareTechMono.variable} ${barlow.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased" suppressHydrationWarning>
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}
