import { StatusCode } from "@/lib/definition";
export const status = ["Enabled", "Disabled"];

export const defaultRoutesEnabled = [
  '/profile',
  '/pathways',
  'ketchertool'
];

export const tableFields = {
  columns: [
    "name",
    "projects",
    "molecules",
    "users",
    "status",
    "organizationAdmin",
    "createdAt",
    "updatedAt",
  ],
  editable: true,
  editingMode: "popup",
  editFields: [
    {
      dataField: "name",
      required: "Organization name is required",
    },
    { type: "radio", dataField: "status", items: status },
    // { dataField: "numberAndDateTimeFormat" },
    { type: "dxSelectBox", dataField: "timezone" },
    { dataField: "primaryContact" },
  ],
  toolbar: true,
  searchPanel: true,
  createFields: [
    { dataField: "name" },
    { dataField: "organizationAdminFirstName" },
    { dataField: "organizationAdminLastName" },
    { dataField: "organizationAdminEmailAddress" },
    { dataField: "numberAndDateTimeFormat" },
    { dataField: "timezone" },
    { dataField: "primaryContact" },
  ],
};

export const DELAY = 2000;

export const MOLECULESTATUS = [
  { name: 'New', count: 2, type: 'info' },
  { name: 'Ready', count: 3, type: 'info' },
  { name: 'Progressing', count: 12, type: 'info' },
  { name: 'Done', count: 4, type: 'success' },
  { name: 'Failed', count: 0, type: 'error' },
];

export const MOLECULES = [
  {
    id: 1,
    bookamrk: false,
    structure: '/icon/libraies.svg',
    moleculeId: 5,
    molecularWeight: 500,
    status: 'new',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }, {
    id: 2,
    bookamrk: false,
    structure: '/icon/libraies.svg',
    moleculeId: 5,
    molecularWeight: 500,
    status: 'In Progress',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }, {
    id: 3,
    bookamrk: false,
    structure: '/icon/libraies.svg',
    moleculeId: 5,
    molecularWeight: 500,
    status: 'ready',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }, {
    id: 4,
    bookamrk: false,
    structure: '/icon/libraies.svg',
    moleculeId: 5,
    molecularWeight: 500,
    status: 'done',
    analyse: '',
    herg: 0.12,
    caco2: 1.23,
    clint: 0.92,
    hepg2cytox: 0.02,
    solubility: 1.23
  }, {
    id: 5,
    bookamrk: false,
    structure: '/icon/libraies.svg',
    moleculeId: 5,
    molecularWeight: 500,
    status: 'done',
    analyse: '',
    herg: 1.1,
    caco2: 0.3,
    clint: 0.7,
    hepg2cytox: 1.23,
    solubility: 0.3,
  }, {
    id: 6,
    bookamrk: false,
    structure: '/icon/libraies.svg',
    moleculeId: 5,
    molecularWeight: 500,
    status: 'failed',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }, {
    id: 7,
    bookamrk: false,
    structure: '/icon/libraies.svg',
    moleculeId: 5,
    molecularWeight: 500,
    status: 'new',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }
];

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

export const StatusCodeBg = {
  ready: 'bg-white',
  new: 'bg-white',
  failed: 'bg-themeStatsRedColor',
  inprogress: 'bg-themeStatsBlueColor',
  done: 'bg-themeStatsGreenColor',
  info: 'bg-themeStatsYellowColor'
}

export type StatusCodeType = keyof typeof StatusCodeBg;

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

export const MoleculeOrders = [
  {
    id: 1,
    bookmark: true,
    structure: '/icons/molecule-order-structure.svg',
    moleculeId: 5,
    MoleculeName: 'test1',
    molecularWeight: 500,
    status: 'new',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }, {
    id: 2,
    bookmark: true,
    structure: '/icons/molecule-order-structure.svg',
    moleculeId: 5,
    MoleculeName: 'test1',
    molecularWeight: 500,
    status: 'In Progress',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }, {
    id: 3,
    bookmark: true,
    structure: '/icons/molecule-order-structure.svg',
    moleculeId: 5,
    MoleculeName: 'test2',
    molecularWeight: 500,
    status: 'ready',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }, {
    id: 4,
    bookmark: true,
    structure: '/icons/molecule-order-structure.svg',
    moleculeId: 5,
    MoleculeName: 'test2',
    molecularWeight: 500,
    status: 'done',
    analyse: '',
    herg: 0.12,
    caco2: 1.23,
    clint: 0.92,
    hepg2cytox: 0.02,
    solubility: 1.23
  }, {
    id: 5,
    bookmark: true,
    structure: '/icons/molecule-order-structure.svg',
    moleculeId: 5,
    MoleculeName: 'test2',
    molecularWeight: 500,
    status: 'done',
    analyse: '',
    herg: 1.1,
    caco2: 0.3,
    clint: 0.7,
    hepg2cytox: 1.23,
    solubility: 0.3,
  }, {
    id: 6,
    bookmark: true,
    structure: '/icons/molecule-order-structure.svg',
    moleculeId: 5,
    MoleculeName: 'test3',
    molecularWeight: 500,
    status: 'failed',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }, {
    id: 7,
    bookmark: true,
    structure: '/icons/molecule-order-structure.svg',
    moleculeId: 5,
    MoleculeName: 'test4',
    molecularWeight: 500,
    status: 'new',
    analyse: '',
    herg: '',
    caco2: '',
    clint: '',
    hepg2cytox: '',
    solubility: ''
  }
];