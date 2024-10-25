import Header from '@/components/Header/Header'
import { getUserData } from "@/utils/auth";
import { AppContextProvider } from '../app/AppState';
import { CartContextProvider } from '../app/Provider/CartProvider';

export default async function Layout({ children }: { children: React.ReactNode }) {

  const sessionData: any = await getUserData();
  const { userData } = sessionData;

  return (
    <AppContextProvider>
      <CartContextProvider>
      <Header userData={userData} />
      {children}
      </CartContextProvider>
    </AppContextProvider>
  );
}