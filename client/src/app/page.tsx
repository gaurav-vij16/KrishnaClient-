import { AppNavigation } from '@/components/app-navigation';
import { OrderForm } from '@/features/orders/order-form';
import { PageHeader } from '@/components/ui/page-header';

export default function Home() {
  return (
    <>
      <AppNavigation current="new" />
      <main className="mx-auto min-h-screen max-w-[1440px] px-4 py-5 pb-36 sm:px-6 lg:ml-64 lg:py-7 lg:pb-10">
        <PageHeader
          eyebrow="Order desk"
          title="New Order"
          description="Add the items and save the bill in a few taps."
        />
        <OrderForm />
      </main>
    </>
  );
}
