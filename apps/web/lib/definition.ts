
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
  userId: number,
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
  roleId: number,
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
  status: string;
  updated_at: Date;
  updated_by: number;
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
  updated_by?: userType;
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
  updated_by: userType;
  updated_at: Date;
  userId?: number;
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
  roleId: number
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
  myRoles: string[]
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
}

export type UserTableProps = {
  orgUser?: OrgUser;
  filteredRoles: UserRole[];
  myRoles: string[];
  type?: string;
  setExternalCount?: any,
  setInternalCount?: any,
  userId: number,
  actionsEnabled: string[]
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
}

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

export interface DashboardPageType {
  userData: UserData,
  tabsStatus: TabDetail[],
  filteredRoles: UserRole[],
  myRoles: string[],
  orgUser: OrgUser,
  heading: HeadingObj[],
  actionsEnabled: string[],
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
  organization_id: number;
  source_molecule_name: string;
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
  molecule_id: number;
  library_id: number;
  project_id: number;
  organization_id: number;
  userId: number;
}

export interface DeleteMoleculeCart {
  id: number;
  library_id: number;
  molecule_id: number;
  project_id: number;
  moleculeName: string,
  userId: number;
}

export interface MoleculeOrderParams {
  project_id?: number;
  library_id?: number;
  organization_id?: number;
  created_by?: number;
}

export enum OrganizationType {
  Internal = "Internal",
  External = "External"
}

export interface MoleculeObj {
  molecular_weight: string;
  library: {
    name: string;
    project: {
      name: string;
    };
  };
  source_molecule_name: string;
}

export interface CartItem {
  id: number;
  molecule_id: number;
  library_id: number;
  project_id: number;
  organization_id: number;
  molecule: MoleculeObj;
  moleculeName: string;
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
  projectName: string;
  libraryName: string;
  moleculeName: string;
  userId: number;
}

export interface OrderDetail {
  orderId: number;
  orderName: string;
  molecule_id: number;
  library_id: number;
  project_id: number;
  organization_id: number;
  userId: number;
}

export interface GroupedData {
  [key: string]: { id: number; molecule_id: number; molecularWeight: string; moleculeName: string; library_id: number, project_id: number, userId: number }[];
}
