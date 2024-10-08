import Header from '@/components/Header/Header'
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserData, isAuthenticated } from "@/utils/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!await isAuthenticated()) {
    revalidatePath('/');
    redirect("/")
  }

  const userData: any = await getUserData();

  return (
    <>
      <Header userData={userData} />
      {children}
    </>
  );
}