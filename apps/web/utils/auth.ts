'use server'

import { cookies } from "next/headers";
import { validateAuth } from "./helpers";
import Cryptr from "cryptr";

export async function authorize(formData: FormData) {
    try {
        const validatedFields = validateAuth(formData);
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
            }
        } else {
            const body = JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            });
            const response: any = await fetch(`${process.env.API_HOST_URL}/v1/auth`, {
                mode: 'no-cors',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body
            });

            if (response.status === 200) {
                const output = await response.json();
                const sessionData = JSON.stringify(output.data);
                const encryptedSessionData =
                    new Cryptr(`${process.env.AUTH_SECRET}`).encrypt(sessionData);
                const cookie = cookies();
                cookie.set('session', encryptedSessionData, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7, // One week
                    path: '/',
                });
                return output;
            } else if (response.status === 404) {
                const output = await response.json();
                return output;
            }
            throw new Error("Something went wrong");
        }
    }
    catch (error: any) {
        return error;
    }
}

export async function clearSession() {
    if (cookies().has("session")) {
        cookies().delete('session');
        return true;
    }
    return false;
}

export async function isAuthenticated() {
    return cookies().has('session');
}

export async function getUserData() {
    const sessionData: any = cookies().get('session')?.value;
    return JSON.parse(new Cryptr(`${process.env.AUTH_SECRET}`).decrypt(sessionData));
}