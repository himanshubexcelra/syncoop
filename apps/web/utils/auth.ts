'use server'

import { cookies } from "next/headers";
import { Messages } from "./message";

export async function authorize(formData: FormData) {
    try {
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
        console.log(response);
        if (response.status === 200) {
            const output = await response.json();
            const sessionData = JSON.stringify(output.data);
            const cookie = cookies();
            cookie.set('session', sessionData, {
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
        throw new Error(Messages.SOMETHING_WENT_WRONG);
    }
    catch (error) {
        return error;
    }
}

export async function clearSession() {
    cookies().delete('session');
}

export async function getUserData() {
    const sessionData: any = cookies().get('session')?.value;
    if (sessionData) {
        return JSON.parse(sessionData);
    }
    return null;
}