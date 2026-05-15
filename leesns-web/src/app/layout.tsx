import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import AppFrame from "@/components/layout/app-frame";
import ModalProvider from "@/components/modal-provider";
import Provider from "@/components/query-provider";
import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import localFont from "next/font/local";

const pretendard = localFont({
  src: "../assets/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "SnS 서비스 - danpung12",
  description: "Nest로 만든 sns 입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${pretendard.variable} font-sans antialiased`}>
        <Provider>
          <ThemeProvider>
            <AuthProvider>
              <ModalProvider>
                <Toaster />
                <AppFrame>{children}</AppFrame>
              </ModalProvider>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
