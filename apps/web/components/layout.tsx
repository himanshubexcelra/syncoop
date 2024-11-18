import Header from '@/components/Header/Header'
import { getUserData } from "@/utils/auth";
import { AppContextProvider } from '../app/AppState';

export default async function Layout({ children }: { children: React.ReactNode }) {

  const sessionData = await getUserData();
  const { userData, actionsEnabled } = sessionData;
  return (
    <AppContextProvider>
      <Header userData={userData} actionsEnabled={actionsEnabled} />
      {children}
    </AppContextProvider>
  );
}