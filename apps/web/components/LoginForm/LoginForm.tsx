"use client"

import { authorize } from "@/utils/auth";
import Image from "next/image"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import styles from "./LoginForm.module.css"
import { Messages } from "@/utils/message";
import toast from "react-hot-toast";
import { delay } from "@/utils/helpers";


export type ErrorType = {
    email: string,
    password: string[]
}

export default function LoginForm() {
    const [message, setForgotMessage] = useState('');
    const [errors, setErrors] = useState({} as ErrorType);
    const router = useRouter();
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = await authorize(formData);
        if (data) {
            if (data?.errors) {
                setErrors(data.errors);
            } else if (data.success) {
                const toastId = toast.success(`User ${(data.firstName || '') + (data.lastName || '')} logged in successfully`);
                await delay(2000);
                toast.remove(toastId);
                router.push('/dashboard');
            } else if (!data?.success) {
                const toastId = toast.error(`${data?.errorMessage}`);
                await delay(2000);
                toast.remove(toastId);
            }
        } else {
            console.log("False");
        }
        return false;
    }

    const handleForgotPassword = () => {
        setForgotMessage('Please request System Admin to re-generate your password');
    };

    const clearErrors = () => {
        setErrors({} as ErrorType);
    }

    return (
        <form onInput={() => clearErrors()} onSubmit={handleSubmit} className="flex flex-col w-[540px] h-auto p-[32px] gap-[10px] border-2 border-[#ECECF4] bg-white rounded-[8px]">
            <div className="mb-6 flex flex-col gap-2">
                <Image
                    src="/icons/M-icon.svg"
                    alt="Merck logo"
                    priority
                    width={64}
                    height={30}
                />
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <h1 className={styles.Headline}>
                    Welcome!
                </h1>
            </div>
            <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className={`border border-gray-300 rounded-[4px] w-[476px] h-[40px] flex-shrink-0 p-3 bg-[#f8f8fc] text-[#838393] ${styles.EmailInput}`}
                    placeholder="Enter your email"
                    required
                />
                <span className={styles.errorMessage}>{errors?.email}</span>
            </div>
            <div className="flex flex-col gap-2 mb-6">
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className={`border border-gray-300 rounded-[4px] w-[476px] h-[40px] flex-shrink-0 p-3 bg-[#f8f8fc] text-[#838393] ${styles.EmailInput}`}
                    placeholder="Enter your password"
                    required
                />
                <span className={styles.errorMessage}>{
                    errors?.password && <ul>
                        {errors.password.map((message: string, index: number) => {
                            return <li key={index + 1}>${message}</li>;
                        })}
                    </ul>}
                </span>
                <div className="flex gap-1.5">
                    <Image
                        src="/icons/info-icon.svg"
                        alt="Forgot Password"
                        priority
                        width={14}
                        height={15}
                    />
                    <span className="text-black text-sm font-bold leading-tight cursor-pointer" onClick={handleForgotPassword}>Forgot password?</span>
                </div>
            </div>
            {message && <div className={`mb-3 flex flex-col text-sm ${styles.errorMessage}`}>
                {Messages.forgotPassword}
            </div>}

            <button type="submit" className="w-24 h-10 p-3 bg-[#0f69af] rounded justify-center items-center inline-flex text-white text-base font-bold font-['Lato'] leading-tight">Login</button>

        </form>
    )
} 