import Header from '@/components/Header/Header'
import Cryptr from 'cryptr';
import { cookies } from 'next/headers';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const sessionData: any = cookies().get('session')?.value;
  const userData: any = new Cryptr(`${process.env.AUTH_SECRET}`).decrypt(sessionData);
  return (
    <>
      <Header userData={userData} />
      {children}
    </>
  );
}