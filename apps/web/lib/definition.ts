
import { FormRef } from "devextreme-react/cjs/form";
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
  user?: userType;
  metadata?: metaDataType;
}

type ShowEditPopupType = (value: boolean) => void;

type SetTableDataType = (value: OrganizationDataFields[]) => void;

export interface OrganizationCreateFields {
  setCreatePopupVisibility: ShowEditPopupType,
  setTableData: SetTableDataType,
  formRef: FormRef,
  tableData: OrganizationDataFields[],
}

type FetchUserType = (value: boolean) => void;

export interface OrganizationCreateFields {
  setCreatePopupVisibility: ShowEditPopupType,
  formRef: FormRef,
  fetchOrganizations: FetchUserType,
  role: number
}
export interface OrganizationEditField extends OrganizationCreateFields {
  organizationData: OrganizationDataFields,
  showEditPopup: ShowEditPopupType,
  users: userType[],
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
  email: string;
  status: string;
  lastName: string;
  organization: Organization;
  user_role: UserRoleType[];
}

export interface UserRoleType {
  role: UserRole
}

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  user_role: UserRoleType[];
  organization?: object;
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
  featuresLeft: ModuleFeature[];
  featuresRight: ModuleFeature[];
}

export interface Status {
  text: string;
  number: string;
  background: string;
  dotColorStyle: string[];
}

export interface CountCard {
  name: string;
  svgPath: string;
  innerGap: string;
  count: string;
}

export interface StatusComponentProps {
  countCardsDetails: CountCard[];
  stats: Status[];
}

export type UserTableProps = {
  data: User[];
  organizationData?: OrganizationDataFields[];
  roles: UserRole[];
  roleType: string;
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
