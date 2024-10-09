import Header from '@/components/Header/Header'
import { getUserData } from "@/utils/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {  

  const userData: any = await getUserData();

  return (
    <>
      <Header userData={userData} />
      {children}
      </>
  );
}