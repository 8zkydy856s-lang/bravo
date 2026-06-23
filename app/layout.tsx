import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BRAVO · místo k zastavení",
  description: "Specialty coffee, tea & flowers · Luxembourg",
  // Ikony řeší souborová konvence Next App Routeru (app/icon.png, app/apple-icon.png, app/favicon.ico).
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}