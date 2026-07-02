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
      <head>
        {/* Fondy pro sdělení (12 voleb, viz app/lib/sdeleniStyl.ts). display=swap → bez blokování. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Spectral:ital,wght@0,400;0,700;1,400;1,700&family=Fraunces:ital,wght@0,400;0,700;1,400;1,700&family=Marcellus&family=Italiana&family=Josefin+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Tangerine:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}