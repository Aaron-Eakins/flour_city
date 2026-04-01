import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Automated 3D Print Quoting',
  description: 'Upload your STL or 3MF files for an instant 3D printing quote via Bambu Labs P1S.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <div className="bg-glow"></div>
        <div className="bg-glow-accent"></div>
        {children}
      </body>
    </html>
  );
}
