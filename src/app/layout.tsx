import type { Metadata, Viewport } from "next";
import { Outfit } from 'next/font/google';
import "./globals.css";

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "Dividi | Finanças Compartilhadas",
  description: "Controle financeiro inteligente e divisão de despesas para casais e residências.",
  manifest: "/manifest.json",
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dividi",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased dark ${outfit.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <body className={`${outfit.className} min-h-full flex flex-col bg-slate-950 text-slate-50 selection:bg-indigo-500/30`}>
        {children}
      </body>
    </html>
  );
}
