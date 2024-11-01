import { ProjectDataFields } from './../lib/definition';
import { LibraryFields, LoginFormSchema, Molecule, StatusCode } from "@/lib/definition"

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

export function getCountCardsDetails(projectCount: number, libraryCount: number, moleculeCount: number) {
  return [
    {
      name: "Libraries",
      svgPath: "/icons/library-icon.svg",
      innerGap: "gap-5",
      count: String(libraryCount),
    },
    {
      name: "Projects",
      svgPath: "/icons/project-icon.svg",
      innerGap: "gap-2",
      count: String(projectCount),
      href: "./projects"
    },
    {
      name: "Molecules",
      svgPath: "/icons/molecule-icon.svg",
      innerGap: "gap-2",
      count: String(moleculeCount)
    }
  ];
}

export function formatDetailedDate(date: Date) {
  const today = new Date(date);
  const year = today.getFullYear();
  const day = today.getDate();

  // Create an array of month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const month = monthNames[today.getMonth()]; // Get month name

  return `${day} ${month}, ${year}`;
}

export function formatDatetime(date: Date) {
  const optionsDate: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const dateStr = new Date(date);
  const formattedDate = `${dateStr.toLocaleDateString('en-GB', optionsDate)}, ${dateStr.toLocaleTimeString('en-GB', optionsTime)}`;
  return formattedDate;
}

export function popupPositionValue() {
  if (typeof window !== 'undefined') {
    return ({
      my: 'top right',
      at: 'top right',
      of: window,
    });
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args); // Use the correct this context
    }, delay);
  };
}

export function fetchMoleculeStatus(data: LibraryFields) {
  const projectStatusCount = {
    [StatusCode.READY]: 0,
    [StatusCode.NEW]: 0,
    [StatusCode.FAILED]: 0,
    [StatusCode.INPROGRESS]: 0,
    [StatusCode.DONE]: 0,
  };

  data.molecule.forEach((molecule: Molecule) => {
    if (projectStatusCount[molecule.status] !== undefined) {
      projectStatusCount[molecule.status] += 1;
    }
  });

  return projectStatusCount;
}
