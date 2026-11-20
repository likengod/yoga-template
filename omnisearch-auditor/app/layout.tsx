import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniSearch Auditor | SEO + AEO + GEO Analyzer",
  description: "Comprehensive search optimization analyzer across Traditional SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 font-sans text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
