import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Isshō | Where plans come together",
  description: "Book unique spaces for your next event, meeting, or production.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body 
        className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen w-full relative">
            <Navbar />
            <main className="flex-1 flex flex-col w-full relative">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
