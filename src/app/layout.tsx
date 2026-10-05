import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { TopNav } from "@/shared/components/TopNav";
import { AuthBootstrap } from "@/features/auth";
import { mantineTheme } from "@/theme/mantine-theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Book Cờ tướng",
  description: "Advanced Xiangqi Study App built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${manrope.variable} h-full antialiased light`}
    >
      <head>
        {/* Material Symbols is loaded globally from the root layout on purpose. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="h-full flex flex-col bg-surface text-on-surface font-body overflow-hidden">
        <MantineProvider theme={mantineTheme} defaultColorScheme="light">
          <Notifications position="top-right" />
          <AuthBootstrap />
          <TopNav />
          <main className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
            {children}
          </main>
        </MantineProvider>
      </body>
    </html>
  );
}
