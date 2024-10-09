"use client"

import { authorize } from "@/utils/auth";
import Image from "next/image"
import React, { useState } from "react"
import styles from "./LoginForm.module.css"
import toast from "react-hot-toast";
import { delay } from "@/utils/helpers";
import DialogPopUp from "../../ui/DialogPopUp";
import PopupContent from "../ForgotPopUp/ForgotContent";
import { DELAY } from "@/utils/constants";
import { Messages } from "@/utils/message";
import { UserData } from "@/lib/definition";

export type ErrorType = {
    email: string,
    password: string[]
}
const dialogProperties = {
    width: 336,
    height: 424,
}

type LoginFormProps = {
    onSuccess: (userData: UserData) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [visible, setVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const response = await authorize(formData);
        if (response) {
            if (response.success) {
                const { data } = response;
                await onSuccess(data);
            } else if (response.errorMessage) {
                const toastId = toast.error(`${response?.errorMessage}`);
                await delay(DELAY);
                toast.remove(toastId);
            }
        } else {
            const toastId = toast.error(Messages.SOMETHING_WENT_WRONG);
            await delay(DELAY);
            toast.remove(toastId);
        }
        return false;
    }

    return (
        <>
            <DialogPopUp {...{ visible, setVisible, dialogProperties, Content: PopupContent, }} />
            <form onSubmit={handleSubmit} className="flex flex-col w-[540px] h-auto p-[32px] gap-[10px] border-2 border-themelightGreyColor bg-background rounded-[8px]">
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
                        className={`border border-themeBorderGrey rounded-[4px] w-[476px] h-[40px] flex-shrink-0 p-3 bg-themeSilverGreyColor ${styles.emailInput}`}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="flex flex-col gap-2 mb-6">
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <div className="flex items-center">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            className={`border border-themeBorderGrey rounded-[4px] w-[476px] h-[40px] flex-shrink-0 p-3 bg-themeSilverGreyColor ${styles.emailInput}`}
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            className="ml-[-30px] flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <Image
                                src={showPassword ? "/icons/eye-off-icon.svg" : "/icons/eye-icon.svg"}
                                alt={showPassword ? "Hide password" : "Show password"}
                                width={18}
                                height={18}
                            />
                        </button>
                    </div>
                    <div className="flex gap-1.5">
                        <Image
                            src="/icons/info-icon.svg"
                            alt="Forgot Password"
                            priority
                            width={14}
                            height={15}
                        />
                        <span className="text-foreground text-sm font-bold leading-tight cursor-pointer" onClick={() => setVisible(true)}>Forgot password?</span>
                    </div>
                </div>
                <button type="submit" className="w-24 h-10 p-3 bg-themeBlueColor rounded justify-center items-center inline-flex text-background text-base font-bold font-['Lato'] leading-tight">Login</button>

            </form>
        </>
    )
} 