import { isAuthenticated } from "@/utils/auth";
import Image from "next/image";
import LoginForm from "@/components/LoginForm/LoginForm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function Login() {

  if (await isAuthenticated()) {
    revalidatePath('/dashboard');
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen bg-[url('/images/login-background.jpg')] bg-cover bg-center justify-center items-center">
      <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-16 lg:space-y-0 lg:space-x-16 justify-between w-4/5">
        <div className="flex-shrink-0 w-[213px] h-[126.4px] overflow-hidden">
          <Image
            src="/icons/aidd-login-icon.svg"
            alt="SynCoOp logo"
            priority
            width={213}
            height={126.4}
            className='w-full h-full object-contain'
          />
        </div>
        <LoginForm />
      </div>
    </div>
  )
}