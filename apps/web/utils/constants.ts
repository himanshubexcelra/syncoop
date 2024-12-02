/*eslint max-len: ["error", { "code": 100 }]*/
import { ActionStatus, StatusCode } from "@/lib/definition";
export const status = [
  ActionStatus.Enabled,
  ActionStatus.Disabled
];

export const defaultRoutesEnabled = [
  '/profile',
  '/organization',
  '/pathways',
  'ketchertool',
  '/test'
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
    text: StatusCode.New,
    number: "29",
    background: "bg-themeSilverGreyColor",
    textColor: "text-themeGreyColor",
    dotColorStyle: ["bg-themeDotGreyColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
  {
    text: StatusCode.Ready,
    number: "56",
    background: "bg-themeSilverGreyColor",
    textColor: "text-themeBlueColor",
    dotColorStyle: ["bg-themeDotBlueColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
  {
    text: StatusCode.InProgress,
    number: "94",
    background: "bg-themeStatsBlueColor",
    textColor: "text-themeBlueColor",
    dotColorStyle: ["bg-themeDotBlueColor", "bg-themeDotBlueColor", "bg-themeDotGreyColor"]
  },
  {
    text: StatusCode.FailedRetro,
    number: "13",
    background: "bg-themeStatsRedColor",
    textColor: "text-textLightRed",
    image: '/icons/warning.svg',
    dotColorStyle: ["bg-themeDotRedColor", "bg-themeDotRedColor", "bg-themeDotRedColor"]
  },
  {
    text: StatusCode.Done,
    number: "359",
    background: "bg-themeStatsGreenColor",
    textColor: "text-textLightGreen",
    dotColorStyle: ["bg-themeDotGreenColor", "bg-themeDotGreenColor", "bg-themeDotGreenColor"]
  },
  {
    text: StatusCode.InRetroQueue,
    number: "360",
    background: "bg-themeLightBlueColor",
    textColor: "text-themeGreyColor",
    image: '/icons/queue.svg',
    dotColorStyle: []
  },
  {
    text: StatusCode.InReview,
    number: "56",
    background: "bg-themeSilverGreyColor",
    textColor: "text-themeBlueColor",
    dotColorStyle: ["bg-themeDotBlueColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
  {
    text: StatusCode.Ordered,
    number: "96",
    background: "bg-themeSilverGreyColor",
    textColor: "text-themeBlueColor",
    dotColorStyle: ["bg-themeDotBlueColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
  {
    text: StatusCode.Validated,
    number: "78",
    background: "bg-themeSilverGreyColor",
    textColor: "text-themeBlueColor",
    dotColorStyle: ["bg-themeDotBlueColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
  {
    text: StatusCode.NewInCart,
    number: "29",
    background: "bg-themeSilverGreyColor",
    textColor: "text-themeGreyColor",
    dotColorStyle: ["bg-themeDotGreyColor", "bg-themeDotGreyColor", "bg-themeDotGreyColor"]
  },
];

export enum CategoryCodeBg {
  DONE = 'bg-doneCategoryGreen',
  INFO = 'bg-infoCategoryYellow',
  FAILED = 'bg-failedCategoryRed',
}

export type StatusCodeType = keyof typeof CategoryCodeBg;

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

export const COMPOUND_TYPE_R = 'r';
export const COMPOUND_TYPE_A = 'a';
