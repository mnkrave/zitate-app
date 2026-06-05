import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Zitate der Freunde",
  description: "Eine Sammlung von Zitaten unserer Freunde.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <Providers>
          <Navbar />
          <main className="container">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
