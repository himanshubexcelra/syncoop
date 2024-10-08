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

export const stats = [
  {
    text: "New",
    number: "29",
    background: "bg-white",
    dotColorStyle: ["bg-themeDotGreyColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
  {
    text: "Ready",
    number: "56",
    background: "bg-white",
    dotColorStyle: ["bg-themeDotBlueColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
  {
    text: "In Progress",
    number: "94",
    background: "bg-themeStatsBlueColor",
    dotColorStyle: ["bg-themeDotBlueColor", "bg-themeDotBlueColor", "bg-themeDotGreyColor"]
  },
  {
    text: "Failed",
    number: "13",
    background: "bg-themeStatsRedColor",
    dotColorStyle: ["bg-themeDotRedColor", "bg-themeDotRedColor", "bg-themeDotRedColor"]
  },
  {
    text: "Done",
    number: "359",
    background: "bg-themeStatsGreenColor",
    dotColorStyle: ["bg-themeDotGreenColor", "bg-themeDotGreenColor", "bg-themeDotGreenColor"]
  },
];

export const countCardsDetails = [
  {
    name: "Libraries",
    svgPath: "/icons/library-icon.svg",
    innerGap: "gap-5",
    count: "12"
  },
  {
    name: "Projects",
    svgPath: "/icons/project-icon.svg",
    innerGap: "gap-2",
    count: "4",
  },
  {
    name: "Molecules",
    svgPath: "/icons/molecule-icon.svg",
    innerGap: "gap-2",
    count: "551"
  }
];

export const dataSource = [
  { name: "Assay 1", description: "assay 1 text" },
  { name: "Assay 2", description: "assay 2 text" },
  { name: "Assay 3", description: "assay 3 text" },
  { name: "Assay 4", description: "assay 4 text" },
];

export const featuresLeft = [
  { name: "Project Management", value: "project_management", checked: true },
  { name: "Protocol Generation", value: "protocol_generation", checked: false },
  { name: "Inventory Management", value: "inventory_management", checked: true },
];

export const featuresRight = [
  { name: "Instrument Management", value: "instrument_management", checked: false },
  { name: "Multiple Org Access", value: "multiple_org_access", checked: false },
  { name: "Order Management", value: "order_management", checked: false },
];
