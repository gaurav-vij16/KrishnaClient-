import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { UnsavedChangesProvider } from '@/components/ui/unsaved-changes';
import { shopConfig } from '@/lib/shop';
export const metadata: Metadata = {
  title: `${shopConfig.shopName} CRM`,
  description: `Order entry and reports for ${shopConfig.shopName}`,
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <UnsavedChangesProvider>
          <ToastProvider>{children}</ToastProvider>
        </UnsavedChangesProvider>
      </body>
    </html>
  );
}
