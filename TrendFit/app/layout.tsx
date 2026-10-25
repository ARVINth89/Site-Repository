import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'آگهی‌یار | فرصت‌های بهتر، سریع‌تر', description: 'بازارگاه خدمات، فرصت‌های شغلی و معرفی کسب‌وکارها', applicationName: 'TrendFit' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fa" dir="rtl"><body>{children}</body></html>; }
