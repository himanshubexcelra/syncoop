import { LoginFormSchema } from "@/lib/definition"

export const HOST = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3001";

export async function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function validateAuth(formData: FormData) {
  return LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
}
