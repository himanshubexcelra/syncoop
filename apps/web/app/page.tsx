"use client";

import Image from "next/image";
import LoginForm from "@/components/LoginForm/LoginForm";
import toast from "react-hot-toast";
import { Messages } from "@/utils/message";
import { DELAY } from "@/utils/constants";
import { delay } from "@/utils/helpers";
import { UserData } from "@/lib/definition";

export default function Login() {

  async function onSuccess(data: UserData) {
    setTimeout(async () => {
      const toastId = toast.success(
        Messages.userLoggedIn(data.first_name, data.last_name));
      await delay(DELAY);
      toast.remove(toastId);
    }, DELAY);
  }

  return (
    <div className="flex h-screen bg-[url('/images/login-background.jpg')]
    bg-cover bg-center justify-center items-center">
      <div className="flex flex-col lg:flex-row items-center lg:items-start 
      space-y-16 lg:space-y-0 lg:space-x-16 justify-between w-4/5">
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
        <LoginForm onSuccess={(data: UserData) => onSuccess(data)} />
      </div>
    </div>
  )
}