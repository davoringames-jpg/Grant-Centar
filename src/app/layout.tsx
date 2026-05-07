import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ScriptProvider } from "@/components/script-provider";
import { ScriptToggle } from "@/components/script-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grant Portal RS",
  description: "Platforma za praćenje javnih poziva i grantova za opštine i gradove Republike Srpske.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ScriptProvider>
          <ScriptToggle />
          {children}
        </ScriptProvider>
      </body>
    </html>
  );
}
