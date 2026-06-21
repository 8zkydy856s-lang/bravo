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
  // ?v=2 donutí prohlížeče (zejm. Safari) vzít novou verzi ikon
  icons: {
    icon: [{ url: "/icon.png?v=2", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon.png?v=2", sizes: "180x180" }],
    shortcut: [{ url: "/favicon.ico?v=2" }],
  },
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