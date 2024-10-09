import { LoginFormSchema } from "@/lib/definition"

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

export function generatePassword() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const capitalLetter = letters.charAt(Math.floor(Math.random() * letters.length)).toUpperCase();
  const lowerCaseLetters = Array.from({ length: 5 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
  const number = Math.floor(Math.random() * 10);
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  const specialChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  return `${capitalLetter}${lowerCaseLetters}${number}${specialChar}`;
}

export function filterUsersByOrgId(users: any, orgID: any) {
  const internalUsers: any = [];
  const externalUsers: any = [];

  users?.forEach((user: any) => {
    if (user.organizationId === orgID) {
      internalUsers.push(user);
    } else {
      externalUsers.push(user);
    }
  });
  return {
    internalUsers,
    externalUsers
  };
}

export function filterOrganizationList(organizations: any, orgName: any) {
  const orgInternal = organizations.filter((org: any) => org.name === orgName);
  const clients = organizations.filter((org: any) => org.name !== orgName);
  return { orgInternal, clients };
}

export function formatDate(date: Date) {
  const today = new Date(date);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${month}/${day}/${year}`;
}
