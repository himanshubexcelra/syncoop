/*eslint max-len: ["error", { "code": 100 }]*/
import {
  CombinedLibraryType, LibraryFields, LoginFormSchema,
  MoleculeOrder,
  MoleculeStatusCode, MoleculeStatusLabels, MoleculeType,
  Status,
  StatusCode, StatusType,
  StatusTypes
} from "@/lib/definition"
import CustomFile from "./file";
import { stats, CategoryCodeBg, StatusCodeType } from "./constants";

export async function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function validateAuth(formData: FormData) {
  return LoginFormSchema.safeParse({
    email_id: formData.get('email_id'),
    password_hash: formData.get('password_hash'),
  })
}

export function generatePassword() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const capitalLetter =
    letters.charAt(Math.floor(Math.random() * letters.length)).toUpperCase();
  const lowerCaseLetters = Array.from({ length: 5 }, () =>
    letters.charAt(Math.floor(Math.random() * letters.length))).join('');
  const number = Math.floor(Math.random() * 10);
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  const specialChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  return `${capitalLetter}${lowerCaseLetters}${number}${specialChar}`;
}

export function filterUsersByOrgId(users: any, orgID: any) {
  const internalUsers: any = [];
  const externalUsers: any = [];

  users?.forEach((user: any) => {
    if (user.organization_id === orgID) {
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

export function getCountCardsDetails(
  projectCount: number,
  libraryCount: number,
  moleculeCount: number,
  customerOrgId?: number) {

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
      ...(customerOrgId ?
        { href: `/organization/${customerOrgId}/projects` } :
        { href: "/projects" }),
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
  const formattedDate = `${dateStr.toLocaleDateString('en-GB', optionsDate)}, 
  ${dateStr.toLocaleTimeString('en-GB', optionsTime)}`;
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

type UnionLibType = LibraryFields | CombinedLibraryType;
type UnionMoleculeType = MoleculeType | StatusType;

export function fetchMoleculeStatus(data: UnionLibType) {

  let projectStatusCode: any = {};
  let projectStatusName: any = {};
  Object.entries(MoleculeStatusCode).forEach(([key, value]) => {
    if (!isNaN(Number(key))) {
      projectStatusCode = {
        ...projectStatusCode,
        [key]: 0
      }
    } else {
      projectStatusName = {
        ...projectStatusName,
        [value]: key
      }
    }
  });

  let projectStatusCount: any = {
    [StatusCode.Ready]: 0,
    [StatusCode.New]: 0,
    [StatusCode.FailedRetro]: 0,
    [StatusCode.InProgress]: 0,
    [StatusCode.Done]: 0,
  };

  const keys: string[] = Object.keys(projectStatusCode);
  const values: number[] = Object.values(projectStatusCode);
  data.libraryMolecules.forEach((molecule: UnionMoleculeType) => {
    const keyIndex = keys.indexOf(String(molecule.status) as any);
    if (keyIndex > -1) {
      const status_code = keys[keyIndex];
      const status_name = projectStatusName[status_code];
      if (projectStatusCount[status_name]) {
        projectStatusCount = {
          ...projectStatusCount,
          [status_name]: projectStatusCount[status_name] + 1
        }
      } else {
        projectStatusCount = {
          ...projectStatusCount,
          [status_name]: 1
        }
      }
    }
  });

  return projectStatusCount;
}

export function isAdmin(myRoles: string[]) {
  return ['admin', 'org_admin'].some((role) => myRoles.includes(role));
}
export function isExternal(myRoles: string[]) {
  return ['library_manager', 'org_admin'].some((role) => myRoles.includes(role));
}
export function isInternal(myRoles: string[]) {
  return ['admin', 'protocol_approver', 'researcher'].some((role) => myRoles.includes(role));
}

export function isSystemAdmin(myRoles: string[]) {
  return myRoles.includes('admin');
}

export function generateRandomDigitNumber() {
  // Generate a random number between 10000000 and 99999999
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return randomNum;
}

export const colorSchemeADME = (data: MoleculeType | MoleculeOrder) => {
  let color: StatusCodeType = StatusTypes.Failed;
  const value = data;
  if (typeof value === 'number') {
    if (value <= 0.5) color = StatusTypes.Failed;
    else if (value > 0.5 && value < 1) color = StatusTypes.Info;
    else if (value >= 1) color = StatusTypes.Done;
  }
  const background = CategoryCodeBg[color];
  return background;
};

export const getUTCTime = (dateTimeString: string) => {
  const dt = new Date(dateTimeString);
  const dtNumber = dt.getTime();
  const dtOffset = dt.getTimezoneOffset() * 60000;
  const dtUTC = new Date();
  dtUTC.setTime(dtNumber - dtOffset);

  return dtUTC;
}

export const colorStatus = (status: number) => {
  let foundStatus = stats.find((item: Status) => item?.text ===
    MoleculeStatusLabels[status as MoleculeStatusCode]);
  // If no match is found, fallback to the "NEW" status
  if (!foundStatus) {
    foundStatus = stats.find((item: Status) => item?.text === StatusTypes.New);
  }
  if (foundStatus) {
    return foundStatus;
  }
};