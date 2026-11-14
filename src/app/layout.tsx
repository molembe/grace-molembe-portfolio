import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/navigation/command-palette";
import { TerminalModal } from "@/components/terminal/terminal-modal";
import { personJsonLd } from "@/lib/seo";
import { getSiteConfig, getTerminalData } from "@/lib/content";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — ${siteConfig.role}`,
      template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.intro,
    keywords: [
      "Network Engineer",
      "Systems Engineer",
      "Linux",
      "Ansible",
      "DevSecOps",
      "Cybersecurity",
      "PKI",
      "Proxmox",
      "Infrastructure Automation",
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: `${siteConfig.name} — Portfolio Engineering`,
      title: `${siteConfig.name} — ${siteConfig.role}`,
      description: siteConfig.intro,
      images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} — ${siteConfig.role}`,
      description: siteConfig.intro,
      images: ["/images/og-default.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#050b14",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [siteConfig, terminalData] = await Promise.all([getSiteConfig(), getTerminalData()]);

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} grid-bg flex min-h-screen flex-col font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <a href="#contenu" className="skip-link">
            Aller au contenu principal
          </a>
          <Navbar cvAvailable={siteConfig.cv.available} cvFile={siteConfig.cv.file} />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <Footer />
          <CommandPalette cvAvailable={siteConfig.cv.available} cvFile={siteConfig.cv.file} email={siteConfig.contact.email} />
          <TerminalModal data={terminalData} />
          <Toaster />
        </ThemeProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(siteConfig)) }}
        />
      </body>
    </html>
  );
}
