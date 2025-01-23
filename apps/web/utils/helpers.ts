/*eslint max-len: ["error", { "code": 100 }]*/
import {
  ADMEConfigTypes,
  ColorSchemeFormat,
  CombinedLibraryType,
  LibraryFields,
  LoginFormSchema,
  MoleculeStatusCode,
  MoleculeStatusLabel,
  MoleculeType,
  Status,
  StatusType
} from "@/lib/definition"
import { COLOR_SCHEME } from "./constants";

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

  let projectStatusName: any = {};
  let projectStatusCount: any = {};
  Object.entries(MoleculeStatusCode).forEach(([key, value]) => {
    if (isNaN(Number(key))) {
      projectStatusName = {
        ...projectStatusName,
        [value]: key
      }

      let className = 'info';
      if (Object(MoleculeStatusLabel as any)[key] === 'Failed') {
        className = 'error';
      } else if (Object(MoleculeStatusLabel as any)[key] === 'Done') {
        className = 'success';
      }
      projectStatusCount = {
        ...projectStatusCount,
        [key]: { count: 0, className }
      }
    }
  });

  const keys: string[] = Object.keys(projectStatusName);
  data.libraryMolecules.forEach((molecule: UnionMoleculeType) => {
    const keyIndex = keys.indexOf(String(molecule.status));
    if (keyIndex > -1) {
      const status_code = keys[keyIndex];
      const status_name = projectStatusName[status_code];
      if (Object(projectStatusCount).hasOwnProperty(status_name)) {

        projectStatusCount[status_name] = {
          ...projectStatusCount[status_name],
          count: projectStatusCount[status_name].count + 1,
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

export function isOrgAdmin(myRoles: string[]) {
  return myRoles.includes('org_admin');
}

export function isLibraryManger(myRoles: string[]) {
  return !isAdmin(myRoles) && myRoles.includes('library_manager');
}

export function isResearcher(myRoles: string[]) {
  return !isAdmin(myRoles) && myRoles.includes('researcher');
}

export function isProtocolAproover(myRoles: string[]) {
  return !isAdmin(myRoles) && myRoles.includes('protocol_approver');
}

export function isResearcherAndProtocolAproover(myRoles: string[]) {
  return !isAdmin(myRoles) && myRoles.includes('researcher') &&
    myRoles.includes('protocol_approver');
}

export function isOnlyLibraryManger(myRoles: string[]) {
  return myRoles?.length === 1 && myRoles?.includes('library_manager');
}

export function isOnlyResearcher(myRoles: string[]) {
  return myRoles.length === 1 && myRoles.includes('researcher');
}

export function isOnlyProtocolApprover(myRoles: string[]) {
  return myRoles.length === 1 && myRoles.includes('protocol_approver');
}

export function generateRandomDigitNumber() {
  // Generate a random number between 10000000 and 99999999
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return randomNum;
}

export const getUTCTime = (dateTimeString: string) => {
  const dt = new Date(dateTimeString);
  const dtNumber = dt.getTime();
  const dtOffset = dt.getTimezoneOffset() * 60000;
  const dtUTC = new Date();
  dtUTC.setTime(dtNumber - dtOffset);

  return dtUTC;
}

export const getStatusObject = (statusList: Status[], status: string) => {
  return statusList.filter((item: Status) => item?.text === status);
};

export function number_formatter(number: number) {
  return new Intl.NumberFormat('en-IN', {}).format(
    number,
  )
}

export const capitalizeFirstLetter = (str: string | undefined) => {
  if (!str) return 'NA';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const randomValue = (array: number[] | string[]) => {
  return array[Math.floor(Math.random() * array.length)];
}

export const getAverage = (adme_data: ColorSchemeFormat[], key: string) => {
  const configField = adme_data.find(
    (obj: ColorSchemeFormat) => obj.adme_test_name === key);
  if (configField) {
    const value1 = Number(configField.results[0].value);
    const value2 = Number(configField.results[1].value);
    const average: number = (value1 + value2) / 2;
    return { average, value1, value2 };
  }
  return null;
}

export const getADMECalculation = (average: number, key: string) => {
  const formulaeFound = COLOR_SCHEME[key].formulaes.find((formulae: {
    min: number,
    max: number,
    formulae: (value: string) => void
  }) =>
    average >= formulae.min && average < formulae.max
  );
  const { formulae } = formulaeFound;
  const actualValue = formulae(average);
  return actualValue;
}

export const getADMEColor = (
  calculatedResult: number, key: string,
) => {
  return COLOR_SCHEME[key].color.find((color: any) =>
    calculatedResult >= color.min && calculatedResult < color.max);
}

export const roundValue = (value: number, precision: number = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

export const setConfig = () => {
  const defaultConfig: ADMEConfigTypes[] = [
    {
      Solubility: {
        max: 4.3,
        min: 0.67
      }
    },
    {
      CLint: {
        max: 4.21,
        min: 0.85
      }
    },
    {
      Fub: {
        max: 4.05,
        min: 1.11
      }
    },
    {
      Caco2: {
        max: 3.78,
        min: 1.12
      }
    },
    {
      HepG2: {
        max: 3.66,
        min: 1.27
      }
    },
    {
      hERG: {
        max: 3.09,
        min: 1.03
      }
    }
  ];
  return defaultConfig;
}

export const deepEqual = (a: any, b: any) => {
  if (a === b) return true; // Same reference or primitive value
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
};

export const isDeleteLibraryEnable = (data: any): boolean => {
  if (data?.length === 0) {
    return true;
  }
  const result = data?.every((item: any) => item.status === MoleculeStatusCode.New);
  return result;
}
