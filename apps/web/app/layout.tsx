import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./form.css";
import "./accordion.css";
import "./table.css";
import './project.css';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const openSans = localFont({
  src: "./fonts/OpenSans-Regular.ttf",
  variable: "--font-open-sans",
  weight: "400",
});

export const metadata: Metadata = {
  title: "SynCoOp App",
  description: "Millipore SynCoOp App",
};

import "devextreme/dist/css/dx.material.blue.light.css";
import { Toaster } from "react-hot-toast";
import LicenseCheckComponent from "@/components/LicenseCheckComponent";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} antialiased`}>
        <LicenseCheckComponent />
        {children}
        <Toaster position="bottom-center" reverseOrder={false} />
      </body>
    </html>
  );
}
