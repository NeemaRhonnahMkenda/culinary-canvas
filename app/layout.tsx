import { Geist, Geist_Mono } from "next/font/google";
import CulinaryShell, { ccMetadata } from "../components/Shell";
import "./globals.css";
import "../styles/culinary.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = ccMetadata;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CulinaryShell>{children}</CulinaryShell>
      </body>
    </html>
  );
}
