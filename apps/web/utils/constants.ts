/*eslint max-len: ["error", { "code": 100 }]*/
import {
  ActionStatus,
  MoleculeOrderStatusCode,
  MoleculeOrderStatusLabel,
  MoleculeStatusCode,
  MoleculeStatusLabel, Status
} from "@/lib/definition";
import { number_formatter } from "./helpers";
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
  'Custom Reaction',
];

export const PERMISSIONS = ['Admin', 'Edit', 'View'];

export enum ContainerAccessPermissionType {
  Admin = 1,
  Edit = 2
}

export const DashboardStatuses = ['New', 'Pre Processing', 'In Progress', 'Done', 'Failed'];

export const ADME_fieldNames: string[] = ["yield", "anlayse", "herg", "caco2"];

export const moleculeStatus: Status[] = [
  {
    text: MoleculeStatusLabel.New,
    code: [MoleculeStatusCode.New, MoleculeStatusCode.NewInCart, MoleculeStatusCode.Ordered],
    number: 0,
    background: "bg-gray",
    textColor: "text-grey",
    dotColorStyle: ["dot-grey", "dot-grey", "dot-grey"]
  },
  {
    text: MoleculeStatusLabel.NewInCart,
    code: MoleculeStatusCode.NewInCart,
    number: 0,
    background: "bg-gray",
    textColor: "text-grey",
    dotColorStyle: ["dot-grey", "dot-grey", "dot-grey"]
  },
  {
    text: MoleculeStatusLabel.Ordered,
    code: MoleculeStatusCode.Ordered,
    number: 0,
    background: "bg-gray",
    textColor: "text-blue",
    dotColorStyle: ["dot-blue", "dot-grey", "dot-grey"]
  },
  {
    text: MoleculeStatusLabel.PreProcessing,
    code: [
      MoleculeStatusCode.InRetroQueue,
      MoleculeStatusCode.Ready,
      MoleculeStatusCode.InReview,
      MoleculeStatusCode.Validated,
      MoleculeStatusCode.ValidatedInCart
    ],
    number: 0,
    background: "bg-blue",
    textColor: "text-blue",
    dotColorStyle: ["dot-blue", "dot-blue", "dot-grey"]
  },
  {
    text: MoleculeStatusLabel.InRetroQueue,
    code: MoleculeStatusCode.InRetroQueue,
    number: 0,
    background: "bg-light-blue",
    textColor: "text-grey",
    image: '/icons/queue.svg',
    dotColorStyle: []
  },
  {
    text: MoleculeStatusLabel.Ready,
    code: MoleculeStatusCode.Ready,
    number: 0,
    background: "bg-gray",
    textColor: "text-blue",
    dotColorStyle: ["dot-blue", "dot-grey", "dot-grey"]
  },
  {
    text: MoleculeStatusLabel.InReview,
    code: MoleculeStatusCode.InReview,
    number: 0,
    background: "bg-gray",
    textColor: "text-blue",
    dotColorStyle: ["dot-blue", "dot-grey", "dot-grey"]
  },
  {
    text: MoleculeStatusLabel.Validated,
    code: MoleculeStatusCode.Validated,
    number: 0,
    background: "bg-gray",
    textColor: "text-blue",
    dotColorStyle: ["dot-blue", "dot-grey", "dot-grey"]
  },
  {
    text: MoleculeStatusLabel.ValidatedInCart,
    code: MoleculeStatusCode.ValidatedInCart,
    number: 0,
    background: "bg-gray",
    textColor: "text-blue",
    dotColorStyle: ["dot-blue", "dot-grey", "dot-grey"]
  },
  {
    text: MoleculeStatusLabel.InProgress,
    code: MoleculeStatusCode.InProgress,
    number: 0,
    background: "bg-blue",
    textColor: "text-blue",
    dotColorStyle: ["dot-blue", "dot-blue", "dot-grey"]
  },
  {
    text: MoleculeStatusLabel.Done,
    code: MoleculeStatusCode.Done,
    number: 0,
    background: "bg-green",
    textColor: "text-green",
    dotColorStyle: ["dot-green", "dot-green", "dot-green"]
  },
  {
    text: MoleculeStatusLabel.Failed,
    code: MoleculeStatusCode.Failed,
    number: 0,
    background: "bg-red",
    textColor: "text-red",
    /* image: '/icons/warning.svg', */
    dotColorStyle: ["dot-red", "dot-red", "dot-red"]
  }
];

export const moleculeOrderStatus: Status[] = [
  {
    text: MoleculeOrderStatusLabel.InProgress,
    code: MoleculeOrderStatusCode.InProgress,
    number: 0,
    background: "bg-blue",
    textColor: "text-blue",
    dotColorStyle: ["dot-blue", "dot-blue", "dot-grey"]
  },
  {
    text: MoleculeOrderStatusLabel.Failed,
    code: MoleculeOrderStatusCode.Failed,
    number: 0,
    background: "bg-red",
    textColor: "text-red",
    image: '/icons/warning.svg',
    dotColorStyle: ["dot-red", "dot-red", "dot-red"]
  },
  {
    text: MoleculeOrderStatusLabel.Completed,
    code: MoleculeOrderStatusCode.Completed,
    number: 0,
    background: "bg-green",
    textColor: "text-green",
    dotColorStyle: ["dot-green", "dot-green", "dot-green"]
  }
];

export enum CategoryCodeBg {
  DONE = 'bg-doneCategoryGreen',
  INFO = 'bg-infoCategoryYellow',
  FAILED = 'bg-failedCategoryRed',
}

export type StatusCodeType = keyof typeof CategoryCodeBg;

export enum ReactionColors {
  R1 = '#30A454',
  R2 = '#EB3C96',
  R3 = '#08A3B0',
  R4 = '#8A68D2',
  R5 = '#A37303',
  R6 = '#478664',
  R7 = '#C86989',
  R8 = '#277BAE',
  R9 = '#8370C2',
  R10 = '#997F12',
}

export type ReactionColorsType = keyof typeof ReactionColors;
export interface DataType {
  status: StatusCodeType;
}

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

export const COMPOUND_TYPE_R = 'R';
export const COMPOUND_TYPE_A = 'A';
export const AMS_TYPE = "AMS";
export const AMS_HYPER_LINK = "AMS Link";
export const AUTOMATION_LAB = 'AL';

export const DEFAULT_TEMPERATURE = 25;

export enum LabJobStatus {
  Submitted = 1,
  InProgress = 2,
  Complete = 3,
}

export enum ReactionStatus {
  New = 1,
  Reviewed = 2,
  Ready = 3,
  InProgress = 4,
  Done = 5,
  Failed = 6,
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
      innerGap: "gap-2",
      count: number_formatter(libraryCount),
      ...(customerOrgId ?
        { href: `/organization/${customerOrgId}/projects` } :
        { href: "/projects" }),
    },
    {
      name: "Projects",
      svgPath: "/icons/project-icon.svg",
      innerGap: "gap-2",
      count: number_formatter(projectCount),
      ...(customerOrgId ?
        { href: `/organization/${customerOrgId}/projects` } :
        { href: "/projects" }),
    },
    {
      name: "Molecules",
      svgPath: "/icons/molecule-icon.svg",
      innerGap: "gap-2",
      count: number_formatter(moleculeCount),
      ...(customerOrgId ?
        { href: `/organization/${customerOrgId}/projects` } :
        { href: "/projects" }),
    }
  ];
}

export const sample_molecule_ids = [
  1001,
  1234,
  9003,
  3947,
  3946,
  3945,
  3944,
  3943,
  3942,
  3941,
  3940,
  3939,
  4057,
  60,
  61,
  62
];

export const MAX_RANGE = 5;

export const COLOR_SCHEME: any = {
  Solubility: {
    unit: 'μM',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Poor'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Moderate'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'Good'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 1,
        formulae: (value: number) => {
          return 0.1 * value;
        }
      },
      {
        min: 1,
        max: 100,
        formulae: (value: number) => {
          return 0.1 + ((value - 1) * 0.9 / 99)
        }
      },
      {
        min: 100,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Poor (≤ 1), Moderate (1 to <100), Good (≥ 100)'
  },
  CLint_Human: {
    unit: 'μL/min/mg',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Low'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Medium'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'High'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 1,
        formulae: (value: number) => {
          return 0.1 * value;
        }
      },
      {
        min: 1,
        max: 10,
        formulae: (value: number) => {
          return 0.1 + ((value - 1) * 0.9 / 9)
        }
      },
      {
        min: 10,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Low (≤ 1μL/min/mg), Medium (1 to <10μL/min/mg), High (≥ 10μL/min/mg)',
  },
  CLint_Rat: {
    unit: 'μL/min/mg',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Low'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Medium'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'High'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 1,
        formulae: (value: number) => {
          return 0.1 * value;
        }
      },
      {
        min: 1,
        max: 10,
        formulae: (value: number) => {
          return 0.1 + ((value - 1) * 0.9 / 9)
        }
      },
      {
        min: 10,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Low (≤ 1μL/min/mg), Medium (1 to <10μL/min/mg), High (≥ 10μL/min/mg)',
  },
  CLint_Mouse: {
    unit: 'μL/min/mg',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Low'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Medium'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'High'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 1,
        formulae: (value: number) => {
          return 0.1 * value;
        }
      },
      {
        min: 1,
        max: 10,
        formulae: (value: number) => {
          return 0.1 + ((value - 1) * 0.9 / 9)
        }
      },
      {
        min: 10,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Low (≤ 1μL/min/mg), Medium (1 to <10μL/min/mg), High (≥ 10μL/min/mg)',
  },
  Fub_Human: {
    unit: '%',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Low'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Moderate'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'High'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 0.1,
        formulae: (value: number) => {
          return value / 0.1 * 0.1;
        }
      },
      {
        min: 0.1,
        max: 0.5,
        formulae: (value: number) => {
          return 0.1 + (value - 0.1) * (1 - 0.1) / (0.5 - 0.1)
        }
      },
      {
        min: 0.5,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Low (≤ 0.1), Moderate (0.1 to <0.5), High (≥ 0.5)'
  },
  Fub_Rat: {
    unit: '%',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Low'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Moderate'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'High'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 0.1,
        formulae: (value: number) => {
          return value / 0.1 * 0.1;
        }
      },
      {
        min: 0.1,
        max: 0.5,
        formulae: (value: number) => {
          return 0.1 + (value - 0.1) * (1 - 0.1) / (0.5 - 0.1)
        }
      },
      {
        min: 0.5,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Low (≤ 0.1), Moderate (0.1 to <0.5), High (≥ 0.5)'
  },
  Fub_Mouse: {
    unit: '%',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Low'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Moderate'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'High'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 0.1,
        formulae: (value: number) => {
          return value / 0.1 * 0.1;
        }
      },
      {
        min: 0.1,
        max: 0.5,
        formulae: (value: number) => {
          return 0.1 + (value - 0.1) * (1 - 0.1) / (0.5 - 0.1)
        }
      },
      {
        min: 0.5,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Low (≤ 0.1), Moderate (0.1 to <0.5), High (≥ 0.5)'
  },
  Caco2_Papp: {
    unit: 'cm/sec',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Low',
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Medium'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'High'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 0.000001,
        formulae: (value: number) => {
          return value * 0.1 / 0.000001
        }
      },
      {
        min: 0.000001,
        max: 0.000005,
        formulae: (value: number) => {
          return 0.1 + ((value - 0.000001) * (1 - 0.1) / (0.00005 - 0.000001))
        }
      },
      {
        min: 0.000005,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Low (≤ 1.0 x 10⁻⁶),  Medium (1.0 x 10⁻⁶ to <1.0 x 10⁻⁵), High (≥ 1.0 x 10⁻⁵)'
  },
  HepG2_IC50: {
    unit: 'μM',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Risk'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Caution'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'Safe'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 1,
        formulae: (value: number) => {
          return 0.1 * value;
        }
      },
      {
        min: 1,
        max: 10,
        formulae: (value: number) => {
          return 0.1 + (value - 1) * (1 - 0.1) / (10 - 1)
        }
      },
      {
        min: 10,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Safe (≥ 10), Caution (1 to <10), Risk (≤ 1)'
  },
  hERG_Ki: {
    unit: 'μM',
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Risk'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Caution',
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'Safe'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 1,
        formulae: (value: number) => {
          return 0.1 * value;
        }
      },
      {
        min: 1,
        max: 10,
        formulae: (value: number) => {
          return 0.1 + (value - 1) * (1 - 0.1) / (10 - 1)
        }
      },
      {
        min: 10,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Safe (≥ 10), Caution (1 to <10), Risk (≤ 1)'
  },
  yield: {
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
        status: 'Low Yield'
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
        status: 'Medium Yield'
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
        status: 'High Yield'
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 20,
        formulae: (value: number) => {
          return 0;
        }
      },
      {
        min: 20,
        max: 60,
        formulae: (value: number) => {
          return value - 20 / 40
        }
      },
      {
        min: 60,
        max: 100,
        formulae: (value: number) => {
          return 1;
        }
      }
    ],
    reference: 'Low Yield (< 20%), Medium Yield (20% to 60%), High Yield (> 60%)'
  },
  molecular_weight: {
    color: [
      {
        min: 0,
        max: 0.1,
        className: 'bg-red',
      },
      {
        min: 0.1,
        max: 1,
        className: 'bg-yellow',
      },
      {
        min: 1,
        max: Number.MAX_SAFE_INTEGER,
        className: 'bg-green',
      }
    ],
    formulaes: [
      {
        min: 0,
        max: 100,
        formulae: (value: number) => {
          return 0;
        }
      },
      {
        min: 100,
        max: 250,
        formulae: (value: number) => {
          return (value - 100) / 150
        }
      },
      {
        min: 250,
        max: 500,
        formulae: (value: number) => {
          return 1;
        }
      },
      {
        min: 500,
        max: 750,
        formulae: (value: number) => {
          return (750 - value) / 250
        }
      },
      {
        min: 750,
        max: Number.MAX_SAFE_INTEGER,
        formulae: (value: number) => {
          return 0;
        }
      }
    ],
  }
}

export const PATHWAY_BOX_WIDTH = 800;

