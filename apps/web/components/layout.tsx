import Header from '@/components/Header/Header'
import { getUserData } from "@/utils/auth";
import { AppContextProvider } from '../app/AppState';

export default async function Layout({ children }: { children: React.ReactNode }) {

  const sessionData: any = await getUserData();
  const { userData } = sessionData;

  return (
    <AppContextProvider>
      <Header userData={userData} />
      {children}
    </AppContextProvider>
  );
}