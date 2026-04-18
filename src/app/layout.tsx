import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Flour City Prints | Instant 3D Printing Quotes',
  description: 'Precision 3D printing services. Upload STL/3MF for instant quotes based on real slice data.',
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
