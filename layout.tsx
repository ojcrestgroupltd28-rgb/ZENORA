import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ZENORA — Shop Smart. Live Golden.",
  description: "Discover the latest electronics, fashion, home essentials and more at ZENORA."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
