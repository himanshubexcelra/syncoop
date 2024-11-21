
import { z } from "zod";

export const LoginFormSchema = z.object({
  email_id: z.string().email({ message: "Please enter a valid email id." })/* .trim() */,
  password_hash: z
    .string()
    .min(8, { message: 'Password should be at least 8 characters long' })
    .regex(/[a-z]/, { message: 'Password should contain at least one lowercase letter.' })
    .regex(/[0-9]/, { message: 'Password should contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Password should contain at least one special character.',
    })
    .regex(/[A-Z]/, { message: 'Password should contain at least one uppercase letter.' })
    .trim(),
});

export type BreadCrumbsObj = {
  label: string;
  href: string;
  svgPath: string;
  svgWidth: number;
  svgHeight: number;
  isActive?: boolean;
  type?: string;
}

export type HeadingObj = BreadCrumbsObj

export interface DropDownItem {
  label: string;
  value: string;
  link?: string;
  trigger?: string;
}

export type OrganizationEditFieldType = {
  dataField: string;
  type?: string;
  items?: string[];
  required?: string;
  roleType?: string;
  loggedInUser: number;
};

export interface OrganizationTableFields {
  columns: string[];
  editable: boolean;
  editingMode: string;
  editFields: OrganizationEditFieldType[];
}
export interface userType {
  id: number,
  first_name: string,
  last_name: string,
  email_id: string,
  status: string,
}

export interface sharedUserType {
  user_id: number,
  id: number,
  name: string,
  last_name: string,
  first_name?: string,
  email_id: string,
  status: string,
  role?: string
}

export interface metaDataType {
  functionalAssay1: string,
  functionalAssay2: string,
  functionalAssay3: string,
  functionalAssay4: string,
}

export interface OrganizationDataFields {
  id?: number;
  name?: string;
  email_id?: string;
  status?: string;
  orgUser?: User[];
  metadata?: metaDataType;
  projects?: ProjectDataFields[];
  orgAdminId?: number;
  type?: string;
}

export interface OrganizationTableProps {
  data: OrganizationDataFields;
}

export type ShowEditPopupType = (value: boolean) => void;

export type fetchDataType = () => void;

export interface OrganizationCreateFields {
  setCreatePopupVisibility: ShowEditPopupType,
  formRef: any,
  fetchOrganizations: FetchUserType,
  projectData?: ProjectDataFields,
  users?: User[],
  organizationData?: OrganizationDataFields[],
  roleType?: string,
  edit?: boolean,
  role_id: number,
  data?: UserData,
  created_by: number
}

export interface ProjectCreateFields {
  setCreatePopupVisibility: ShowEditPopupType,
  formRef: any,
  fetchOrganizations: FetchUserType,
  projectData?: ProjectDataFields,
  users: User[],
  organizationData: OrganizationDataFields[],
  myRoles?: string[],
  edit?: boolean,
  /* role: number, */
  userData: UserData,
  clickedOrg?: number,
}

export type FetchUserType = (value?: boolean) => void;
export interface OrganizationEditField {
  organizationData: OrganizationDataFields,
  showEditPopup: ShowEditPopupType,
  formRef: any,
  fetchOrganizations: fetchDataType,
  projectData?: ProjectDataFields,
  myRoles?: string[],
  edit?: boolean,
  loggedInUser: number,
  orgAdminRole?: number,
}

export interface MoleculeStatus {
  name: string;
  count: string;
  type: string;
  status: StatusCode;
}

export interface MoleculeType {
  created_at: Date;
  created_by: number;
  finger_print: string;
  id: number;
  inchi_key: string;
  library_id: number;
  molecular_weight: number;
  smiles_string: string;
  source_molecule_name: string;
  "project / library": string;
  "organization / order": string;
  status: number;
  updated_at: Date;
  updated_by: number;
  user_favourite_molecule?: MoleculeFavourite[];
  yield?: number;
  anlayse?: number;
  herg?: number;
  caco2?: number;
}

export interface MoleculeFavourite {
  user_id: number;
  molecule_id: number;
  id: number;
}

export type addToFavouritesProps = {
  molecule_id: number,
  user_id: number,
  existingFavourite?: MoleculeFavourite,
  favourite: boolean,
}

export interface LibraryFields {
  name: string;
  id: number;
  description?: string;
  project_id?: number;
  project: ProjectDataFields,
  target?: string;
  userWhoUpdated?: userType;
  updated_at?: Date;
  owner: User;
  ownerId: number;
  created_at: Date;
  status?: MoleculeStatus[];
  molecule: [];
}

export interface StatusType {
  status: string;
}

export interface CombinedLibraryType {
  molecule: StatusType[];
}
export interface ProjectDataFields {
  name: string;
  id: number;
  description?: string;
  organization_id?: number;
  organization: OrganizationDataFields,
  user: userType;
  sharedUsers: sharedUserType[];
  target: string;
  type: string;
  userWhoUpdated: userType;
  userWhoCreated: userType;
  updated_at: Date;
  user_id?: number;
  owner: User;
  ownerId: number;
  orgUser?: OrgUser;
  libraries: LibraryFields[];
  created_at: Date,
  combinedLibrary?: CombinedLibraryType
}

export interface UserRole {
  id: number;
  name: string;
  type?: string;
  priority?: number;
}

interface Organization {
  id: number;
}

export interface User {
  id: number;
  first_name: string;
  name?: string;
  email_id: string;
  status: string;
  last_name: string;
  organization: Organization;
  user_role: UserRoleType[];
  role?: string,
  permission?: string,
  type: string
}

export interface UserRoleType {
  role: UserRole
  role_id: number
}

export interface OwnerType {
  first_name?: string;
  last_name?: string;
}

export interface UserData {
  email_id: string;
  first_name: string;
  last_name: string;
  user_role: UserRoleType[];
  organization?: object;
  organization_id: number;
  orgUser: User;
  id: number;
  owner?: OwnerType;
  status?: string;
  myRoles: string[];
}
export interface projectType {
  id: number,
  name: string
}

export interface Assay {
  name: string;
  description: string;
}

export interface AssayTableProps {
  orgUser: OrgUser;
}

export interface ModuleFeature {
  id: number;
  name: string;
  description: string;
  requiredPurchase: boolean;
  created_at: string;
  created_by: number;
  updated_at: string
  updated_by: number | null;
}

export interface ModuleTableProps {
  orgUser: OrgUser;
  myRoles?: string[];
}

export interface Status {
  text: StatusCode;
  number: string;
  background: string;
  dotColorStyle: string[];
}

export interface CountCard {
  name: string;
  svgPath: string;
  innerGap: string;
  count: string;
  href?: string;
}

export interface StatusComponentProps {
  myRoles: string[];
  orgUser: OrgUser;
  customerOrgId?: number;
}

export type UserTableProps = {
  orgUser?: OrgUser;
  filteredRoles: UserRole[];
  myRoles: string[];
  type?: string;
  setExternalCount?: any,
  setInternalCount?: any,
  user_id: number,
  actionsEnabled: string[],
  customerOrgId?: number,
}

export interface TabDetail {
  title?: string;
  Component?: React.ComponentType<any>;
  props?: AssayTableProps | ModuleTableProps | StatusComponentProps | UserTableProps;
}

export interface OrgUser {
  id: number;
  name: string;
};

export enum StatusCode {
  READY = 'Ready',
  NEW = 'New',
  FAILED = 'Failed',
  INPROGRESS = 'In Progress',
  DONE = 'Done',
  INRETROQUEUE = 'In-retro Queue',
  INFO = 'Info'
}

export enum MoleculeStatusCode {
  New = 1,
  Ordered = 2,
  InRetroQueue = 3,
  Ready = 4,
  FailedRetro = 5,
  InReview = 6,
  Validated = 7,
  Done = 8,
  Failed = 9
}

export const MoleculeStatusLabels: Record<MoleculeStatusCode, string> = {
  [MoleculeStatusCode.New]: "New",
  [MoleculeStatusCode.Ordered]: "Ordered",
  [MoleculeStatusCode.InRetroQueue]: "In-retro Queue",
  [MoleculeStatusCode.Ready]: "Ready",
  [MoleculeStatusCode.FailedRetro]: "Failed Retro",
  [MoleculeStatusCode.InReview]: "In Review",
  [MoleculeStatusCode.Validated]: "Validated",
  [MoleculeStatusCode.Done]: "Done",
  [MoleculeStatusCode.Failed]: "Failed"
};

export interface UserCountModel {
  internalUsers: number;
  externalUsers: number;
}

export interface AppContextModel {
  userCount: UserCountModel;
  refreshAssayTable: boolean;
  refreshUsersTable: boolean;
}

export type ToggleExpandType = (value: number, text: string) => void;

export interface ExpandTextType {
  id: number,
  text: string,
  isExpanded: boolean,
  toggleExpanded: ToggleExpandType,
  heading?: string,
  clamp: number,
  component: string,
}

export interface LibraryCreateFields {
  setCreatePopupVisibility: ShowEditPopupType,
  formRef: any,
  fetchLibraries: FetchUserType,
  projectData: ProjectDataFields,
  userData: UserData,
  library_idx?: number,
}

export interface LibraryDataNode {
  id: string;
  type?: string;
  smiles?: string;
  parentId?: string;
  score?: string | number | null;
  name?: string;
  condition?: string;
  reactionCount?: number;
  doi?: string;
  isRegulated?: boolean;
  isProtected?: boolean;
  isInInventory?: boolean;
  publishedMoleculeCount?: number;
}

export interface ValidateSmileRequest {
  smiles: string;
}
export interface UploadMoleculeSmilesRequest {
  smiles: string[];
  created_by_user_id: number;
  library_id: string;
  project_id: string;
  organization_id: string;
  source_molecule_name: string;
  id?: number;
}

export interface RejectedSmiles {
  smiles: string;
  reason: string;
}
export interface UploadMoleculeSmilesResponse {
  message: string;
  uploaded_smiles_count: number;
  rejected_smiles_count: number;
  uploaded_smiles: string[];
  rejected_smiles: RejectedSmiles[]
}
export interface OrderType {
  order_id: number;
  order_name: string;
  molecule_id: number;
  library_id: number;
  project_id: number;
  organization_id: number;
  created_by: number;
}

export interface DeleteMoleculeCart {
  id: number;
  library_id: number;
  molecule_id: number;
  project_id: number;
  moleculeName: string,
  created_by: number;
}

export interface MoleculeOrderParams {
  project_id?: number;
  library_id?: number;
  organization_id?: number;
  userWhoCreated?: number;
  created_by?: number
}

export interface MoleculeOrder {
  id: number;
  bookmark: boolean;
  order_id: number;
  order_name: string;
  molecule_id: number;
  molecularWeight: number;
  organizationName: string;
  molecular_weight: string;
  source_molecule_name: string;
  smiles_string: string;
  status: number;
  yield?: number;
  anlayse?: number;
  herg?: number;
  caco2?: number;
}

export enum OrganizationType {
  Internal = "Internal",
  External = "External"
}

export interface MoleculeObj {
  molecular_weight: string;
  smiles_string: string;
  library: {
    name: string;
    project: {
      name: string;
    };
  };
  source_molecule_name: string;
}
interface Organization {
  name: string;
}
export interface CartItem {
  id: number;
  molecule_id: number;
  library_id: number;
  project_id: number;
  organization_id: number;
  molecule: MoleculeObj;
  moleculeName: string;
  smiles_string: string;
  order_id: number,
  orderName: string,
  organization: Organization;
}
export interface UploadMoleculeFileRequest {
  file: File;
  created_by_user_id: string;
  library_id: string;
  project_id: string;
  organization_id: string;
  updated_by_user_id: string;
}

export interface CartDetail {
  id: number;
  molecule_id: number;
  library_id: number;
  organization_id: number;
  project_id: number;
  molecular_weight: string;
  moleculeName: string;
  created_by: number;
  smiles_string: string;
  "project / library": string;
  "organization / order": string;
}
export interface OrderDetail {
  order_id: number;
  order_name: string;
  molecule_id: number;
  library_id: number;
  project_id: number;
  organization_id: number;
  user_id: number;
}

export interface RejectedMolecules {
  smiles: string;
  reason: string;
};
export interface ColumnConfig<T> {
  dataField: keyof T;
  title?: string | React.ReactNode;
  width?: number;
  minWidth?: number;
  visible?: boolean;
  type?: string;
  alignment?: "center" | "left" | "right" | undefined,
  allowSorting?: boolean,
  allowHeaderFiltering?: boolean,
  customRender?: (data: T) => React.ReactNode;
}

export enum StatusTypes {
  Failed = "FAILED",
  InRetroQueue = "INRETROQUEUE"
}

export interface SaveMoleculeParams {
  setLoader: (loading: boolean) => void;
  setButtonText: (text: string) => void;
}

export type UserAction = {
  userData: UserData,
  actionsEnabled: string[],
  routesEnabled: string[]
}

export enum AssayLabel {
  functionalAssay1 = 'Functional Assay 1',
  functionalAssay2 = 'Functional Assay 2',
  functionalAssay3 = 'Functional Assay 3',
  functionalAssay4 = 'Functional Assay 4',
};