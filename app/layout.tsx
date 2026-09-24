import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Email Template Editor",
  description: "Drag and drop email template builder with HTML export",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
