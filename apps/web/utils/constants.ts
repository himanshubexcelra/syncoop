/*eslint max-len: ["error", { "code": 100 }]*/
import { StatusCode } from "@/lib/definition";
export const status = ["Enabled", "Disabled"];

export const defaultRoutesEnabled = [
  '/profile',
  '/organization',
  '/pathways',
  'ketchertool',
];

export const DELAY = 4000;

export const PROJECT_TYPES = [
  'Retrosynthesis',
  'Optimization',
  'Combinatorial',
];

export const PERMISSIONS = ['Admin', 'Edit', 'View'];

export const stats = [
  {
    text: StatusCode.NEW,
    number: "29",
    background: "bg-white",
    dotColorStyle: ["bg-themeDotGreyColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
  {
    text: StatusCode.READY,
    number: "56",
    background: "bg-white",
    dotColorStyle: ["bg-themeDotBlueColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
  {
    text: StatusCode.INPROGRESS,
    number: "94",
    background: "bg-themeStatsBlueColor",
    dotColorStyle: ["bg-themeDotBlueColor", "bg-themeDotBlueColor", "bg-themeDotGreyColor"]
  },
  {
    text: StatusCode.FAILED,
    number: "13",
    background: "bg-themeStatsRedColor",
    dotColorStyle: ["bg-themeDotRedColor", "bg-themeDotRedColor", "bg-themeDotRedColor"]
  },
  {
    text: StatusCode.DONE,
    number: "359",
    background: "bg-themeStatsGreenColor",
    dotColorStyle: ["bg-themeDotGreenColor", "bg-themeDotGreenColor", "bg-themeDotGreenColor"]
  },
];

export enum StatusCodeBg {
  READY, NEW = 'bg-themeSilverGreyColor',
  INPROGRESS = 'bg-themeStatsBlueColor',
  DONE = 'bg-themeStatsGreenColor',
  INFO = 'bg-themeStatsYellowColor',
  FAILED = 'bg-themeStatsRedColor',
  INRETROQUEUE = 'bg-themeLightBlueColor',
  
}

export const StatusCodeTextColor: { [key: string]: string } = {
  NEW: "text-themeGreyColor",
  READY: "text-themeBlueColor",
  INPROGRESS: "text-themeBlueColor",
  DONE: "text-background",
  FAILED: "text-failedStatusColor",
  INRETROQUEUE: "text-themeGreyColor"
};

export type StatusCodeType = keyof typeof StatusCodeBg;

export interface DataType {
  status: StatusCodeType;
}

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
    href: "./projects"
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

export const features = [
  { name: "Project Management", value: "project_management", checked: true },
  { name: "Protocol Generation", value: "protocol_generation", checked: false },
  { name: "Inventory Management", value: "inventory_management", checked: true },
  { name: "Instrument Management", value: "instrument_management", checked: false },
  { name: "Multiple Org Access", value: "multiple_org_access", checked: false },
  { name: "Order Management", value: "order_management", checked: false },
];