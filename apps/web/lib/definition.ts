
import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." })/* .trim() */,
  password: z
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

export interface BreadCrumbsObj {
  label: string;
  href: string;
  svgPath: string;
  svgWidth: number;
  svgHeight: number;
  isActive?: boolean;
  type?: string;
}

export interface HeadingObj extends BreadCrumbsObj { }
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
  firstName: string,
  lastName: string,
  email: string,
  status: string,
}

export interface sharedUserType {
  userId: number,
  id: number,
  name: string,
  lastName: string,
  firstName?: string,
  email: string,
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
  email?: string;
  status?: string;
  orgUser?: User[];
  metadata?: metaDataType;
  projects?: ProjectDataFields[];
  orgAdminId?: number;
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
  role: number,
  data?: UserData,
}

export interface ProjectCreateFields {
  setCreatePopupVisibility: ShowEditPopupType,
  formRef: any,
  fetchOrganizations: FetchUserType,
  projectData?: ProjectDataFields,
  users: User[],
  organizationData: OrganizationDataFields[],
  roleType?: string,
  edit?: boolean,
  /* role: number, */
  data: UserData,
}

export type FetchUserType = (value?: boolean) => void;
export interface OrganizationEditField {
  organizationData: OrganizationDataFields,
  showEditPopup: ShowEditPopupType,
  formRef: any,
  fetchOrganizations: fetchDataType,
  projectData?: ProjectDataFields,
  roleType?: string,
  edit?: boolean,
  loggedInUser: number,
}

export interface Molecule {
  name: string;
  count: string;
  type: string;
}

export interface LibraryFields {
  name: string;
  id: number;
  description?: string;
  projectId?: number;
  project: ProjectDataFields,
  target?: string;
  updatedBy?: userType;
  updatedAt?: Date;
  owner: User;
  ownerId: number;
  createdAt: Date;
  status?: Molecule[];
}
export interface ProjectDataFields {
  name: string;
  id: number;
  description?: string;
  organizationId?: number;
  organization: OrganizationDataFields,
  user: userType;
  sharedUsers: sharedUserType[];
  target: string;
  type: string;
  updatedBy: userType;
  updatedAt: Date;
  userId?: number;
  owner: User;
  ownerId: number;
  orgUser?: OrgUser;
  libraries: LibraryFields[];
  createdAt: Date,
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
  firstName: string;
  name?: string;
  email: string;
  status: string;
  lastName: string;
  organization: Organization;
  user_role: UserRoleType[];
  role?: string,
  permission?: string,
}

export interface UserRoleType {
  role: UserRole
  roleId: number
}

export interface OwnerType {
  firstName?: string;
  lastName?: string;
}

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  user_role: UserRoleType[];
  organization?: object;
  organizationId: number;
  orgUser: User;
  id: number;
  owner?: OwnerType;
  status?: string;
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
  dataSource: Assay[];
}

export interface ModuleFeature {
  name: string;
  value: string;
  checked: boolean;
}

export interface ModuleTableProps {
  features: ModuleFeature[];
  roleType?: string;
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
  countCardsDetails: CountCard[];
  stats: Status[];
}

export type UserTableProps = {
  orgUser?: OrgUser;
  roles: UserRole[];
  roleType: string;
  type?: string;
  setExternalCount?: any,
  setInternalCount?: any,
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
}

export interface ProjectListProps {
  data: ProjectDataFields[],
  users: User[],
  fetchOrganizations: FetchUserType,
  organizationData: OrganizationDataFields[],
  dataCreate: UserData
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
  libraryIdx?: number,
}
export interface ProjectAccordionType {
  data: ProjectDataFields,
  users: User[],
  fetchOrganizations: FetchUserType,
  organizationData: OrganizationDataFields[],
  dataCreate: UserData,
  roleType: string | undefined,
}