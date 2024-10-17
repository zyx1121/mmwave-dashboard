import type { Metadata } from "next";
import { Fira_Code } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const firaCode = Fira_Code({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Network Dashboard",
  description: "Network Dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${firaCode.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
