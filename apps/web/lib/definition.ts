
import { ColumnHeaderFilter } from "devextreme/common/grids";
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

export type FORMULA_CONFIG = {
  min: number,
  max: number,
}
export interface ADMEConfigTypes {
  [key: string]: FORMULA_CONFIG
}

export interface OrganizationConfigType {
  ADMEParams: ADMEConfigTypes[],
}

export interface OrganizationDataFields {
  id: number;
  name: string;
  email_id: string;
  // status?: string;
  is_active: boolean;
  orgUser: User[];
  metadata: metaDataType;
  other_container?: ProjectDataFields[];
  owner_id: number;
  type: string;
  config?: OrganizationConfigType;
  inherits_configuration: boolean;
}

export interface OrganizationTableProps {
  data: OrganizationDataFields;
}

export type ShowEditPopupType = (value: boolean) => void;

export type fetchDataType = () => void;

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

export interface MoleculeStatus {
  name: string;
  count: string;
  type: string;
  status: MoleculeStatusLabel;
}

export interface MoleculeType {
  created_at: Date;
  created_by: number;
  finger_print: string;
  id: number;
  molecule_id: number;
  inchi_key: string;
  library_id: number;
  project_id: number;
  organization_id: number;
  molecular_weight: number;
  smiles_string: string;
  source_molecule_name: string;
  "project / library": string;
  "organization / order": string;
  disabled: boolean;
  status: number;
  status_name: string;
  favourite_id: number;
  favourite: boolean;
  updated_at: Date;
  updated_by: number;
  yield?: number;
  anlayse?: number;
  herg?: number;
  caco2?: number;
  clint?: number;
  hepG2cytox?: number;
  adme_data: ColorSchemeFormat[],
  reaction_data: any;
  functional_assays: ColorSchemeFormat[],
}

export type addToFavouritesProps = {
  molecule_id: number,
  user_id: number,
  favourite: boolean,
  favourite_id: number
}

export interface LibraryFields {
  name: string;
  id: number;
  description?: string;
  project_id?: number;
  project: ProjectDataFields,
  metadata: {
    target?: string;
  };
  userWhoUpdated?: userType;
  updated_at?: Date;
  owner: User;
  owner_id: number;
  created_at: Date;
  status?: MoleculeStatus[];
  libraryMolecules: StatusType[];
  container?: OrganizationDataFields;
  config?: OrganizationConfigType;
  inherits_configuration: boolean;
  parent_id?: number;
}

export interface StatusType {
  status: string;
}

export interface CombinedLibraryType {
  libraryMolecules: StatusType[];
}
export interface ProjectDataFields {
  name: string;
  id: number;
  description?: string;
  parent_id?: number;
  container: OrganizationDataFields,
  user: userType;
  sharedUsers: sharedUserType[];
  target: string;
  userWhoUpdated: userType;
  userWhoCreated: userType;
  updated_at: Date;
  user_id?: number;
  owner: User;
  owner_id: number;
  orgUser?: OrgUser;
  other_container?: LibraryFields[];
  metadata: {
    target: string,
    type: string
  };
  created_at: Date;
  combinedLibrary?: CombinedLibraryType;
  config?: OrganizationConfigType;
  inherits_configuration: boolean;
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
  name: string;
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
  id?:number
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
  is_active: boolean;
  user_role: UserRoleType[];
  organization?: object;
  organization_id: number;
  orgUser: User;
  id: number;
  owner?: OwnerType;
  status?: string;
  myRoles: string[];
  roles: [{
    type: string;

  }];
  primary_contact_id?: number
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
  color?: string;
}

export interface ADMEProps {
  color?: string;
  type?: string;
  organizationId: number;
  data?: ProjectDataFields | LibraryFields;
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
  color?: string;
}

export interface Status {
  text: string;
  code: number | number[];
  number: number;
  background: string;
  textColor: string;
  image?: string | undefined;
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
  color?: string;
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
  color?: string,
}

// Define the type for the props of each tab
interface TabProps {
  isReactantList: boolean;
  data: any;
  onDataChange?: (updatedData: any) => void;
  solventList?: string[];
  temperatureList?: number[];
  onSolventChange?: (solvent: string) => void;
  onTemperatureChange?: (temperature: number) => void;
  status?: string
  color?: string;
  resetReaction?: number;
}

export interface TabDetail {
  title?: string;
  Component?: React.ComponentType<any>;
  props?: AssayTableProps | ModuleTableProps | StatusComponentProps | ADMEProps
  | UserTableProps | TabProps;
}

export interface OrgUser {
  id: number;
  name: string;
};

export enum MoleculeStatusLabel {
  New = 'New',
  NewInCart = 'New + In Cart',
  Ordered = 'Ordered',
  PreProcessing = 'Pre Processing',
  InRetroQueue = 'In Retro Queue',
  Ready = 'Ready',
  InReview = 'In Review',
  Validated = 'Validated',
  ValidatedInCart = 'Validated + In Cart',
  InProgress = 'In Progress',
  Done = 'Done',
  Failed = 'Failed'
}

export enum MoleculeStatusCode {
  New = 1,
  NewInCart = 2,
  Ordered = 3,
  InRetroQueue = 4,
  Ready = 6,
  InReview = 7,
  Validated = 8,
  ValidatedInCart = 9,
  InProgress = 10,
  Done = 11,
  Failed = 5
}


export enum MoleculeOrderStatusLabel {
  InProgress = 'In Progress',
  Completed = 'Completed',
  Failed = 'Failed',
}

export enum MoleculeOrderStatusCode {
  InProgress = 1,
  Completed = 2,
  Failed = 3
}

export interface UserCountModel {
  internalUsers: number;
  externalUsers: number;
}

export interface AppContextModel {
  userCount: UserCountModel;
  refreshAssayTable: boolean;
  refreshUsersTable: boolean;
  cartDetail?: any[];
  refreshCart: boolean;
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
  library_idx: number,
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
  ordered_molecules: number[];
  organization_id: number;
  created_by: number;
  status: number;
  reactionStatus: number,
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
  organization_id?: number;
  userWhoCreated?: number;
  created_by?: number,
  sample_molecule_id: number
}

export type ColorSchemeFormat = {
  results: { value: string, duplicate: number }[],
  adme_test_name: string
}
export interface MoleculeOrder {
  id: string;
  molecule_order_id?: number;
  bookmark?: boolean;
  order_id: number;
  order_name?: string;
  molecule_id: number;
  library_id: number;
  project_id: number;
  organization_id: number;
  molecularWeight?: number;
  pathway_instance_id?: number;
  organizationName?: string;
  molecular_weight: number;
  source_molecule_name?: string;
  smiles_string: string;
  status: number;
  molecule_status: MoleculeStatusLabel;
  order_status: string;
  adme_data: ColorSchemeFormat[],
  functional_assays: object[],
  reaction_data: any,
  disabled: boolean;
  organizationMetadata: {
    functionalAssay1: string;
    functionalAssay2: string;
    functionalAssay3: string;
    functionalAssay4: string;
  } | null;
}

export enum OrganizationType {
  Internal = "O",
  External = "CO"
}

export interface MoleculeObj {
  molecular_weight: string;
  smiles_string: string;
  project: {
    name: string;
  };
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
  molecule_order_id: number,
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
  "Project / Library": string;
  "Organization / Order": string;
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


export interface ColumnConfig {
  dataField?: string;
  title?: string | React.ReactNode;
  width?: number;
  minWidth?: number;
  visible?: boolean;
  type?: string;
  alignment?: "center" | "left" | "right" | undefined,
  allowSorting?: boolean,
  allowHeaderFiltering?: boolean,
  customRender?: (data: any) => React.ReactNode;
  headerCellRenderer?: () => React.ReactNode;
  headerFilter?: ColumnHeaderFilter;
  cssClass?: string;
  defaultSortOrder?: "asc" | "desc" | undefined
}

export enum StatusTypes {
  Failed = "FAILED",
  InRetroQueue = "INRETROQUEUE",
  Info = "INFO",
  Done = "DONE",
  New = "NEW",
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

export interface Pathway {
  id: number;
  pathway_instance_id: number;
  pathway_score: string;
  molecule_id: string;
  description: string | null;
  selected: boolean;
  created_at: string;
  created_by: number;
  updated_at: string | null;
  updated_by: number | null;
  pathway_index: number;
  step_count: number;
  reaction_detail: ReactionDetailType[];
}

export interface ReactionTemplate {
  id: number;
  name: string;
  type: string;
  version: number;
  chemical_1: string;
  chemical_2: string;
  chemical_3: string;
  chemical_4: string;
  chemical_5: string;
  chemical_6: string | null;
  no_of_components: number;
  solvent: string;
  temperature: string;
  last_synced_at: string;
}

export type ReactionInputData = {
  id: number;
} & {
  [key: string]: string | number;
};

export type NodeType = {
  id: string,
  parentId?: string,
  type?: string,
  name?: string,
  condition?: string,
  smiles?: string,
  reactionIndex: number[],
  reactionColor?: string,
  score?: string | number | null;
  reactionCount?: number;
  doi?: string;
  isRegulated?: boolean;
  isProtected?: boolean;
  isInInventory?: boolean;
  publishedMoleculeCount?: number;
  pathway_instance_id?: number;
}


export type Compound = {
  compound_id: number;
  compound_type: string;
}

export type ReactionCompoundType = {
  id: number,
  type?: string,
  name?: string,
  compound_label?: string,
  sNo?: number,
  reaction_name?: string,
  product_type?: string,
  smiles_string: string,
  compound_type: string,
  compound_name: string,
  role: string,
  molar_ratio: number,
  inventory_id: number,
  dispense_time: number;
  compound_id?: string;
  related_to?: number;
  inventory_url?: string;
}

export type ReactionDetailType = {
  id: string,
  type: string,
  name: string,
  reaction_template?: string,
  pathway_instance_id?: number,
  reaction_sequence?: number,
  confidence?: number,
  reaction_smiles_string?: string,
  reactionCount?: number,
  condition?: string,
  status?: number,
  temperature?: number,
  solvent?: string,
  reaction_name: string,
  product_type?: string,
  smiles: string,
  created_by?: number,
  product_smiles_string: string,
  reaction_compound: ReactionCompoundType[],
  reaction_template_master: { name: string }
}

export type PathwayType = {
  id: string,
  molecule_id?: number,
  parent_id: number,
  pathway_instance_id?: number,
  parentId?: string,
  pathway_score?: number,
  selected?: boolean,
  created_by?: number,
  updated_by?: number,
  type?: "reaction" | "molecule",
  name?: string,
  score?: number,
  doi?: string,
  reactionCount?: number,
  condition?: string,
  reaction_detail: ReactionDetailType[],
  dex?: number,
  pathway_index: number,
}

export type CompoundType = {
  id: string,
  smile: string,
}

export interface ReactionDetail {
  id: string | number;
  temperature: number;
  solvent: string;
  reactionTemplate: string;
}

export enum ActionStatus {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}
export type CreateLabJobOrder = {
  molecule_id: number,
  library_id: number,
  organization_id: number,
  project_id: number,
  user_id: number,
  order_id? : number,
}
export type SaveLabJobOrder = {
  molecule_id: number,
  pathway_id: number,
  product_smiles_string: string,
  product_molecular_weight: number,
  no_of_steps: number,
  functional_bioassays: string,
  // reactions: ReactionLabJobOrder[] | [],
  reactions: string,
  created_by: number,
  status: number,
  reactionStatus: number,
}

export type SelectedPathwayInstance = {
  pathway_instance_id: number;
  pathway_index: number;
  pathway_score: number;
  selected: boolean;
  created_by: number;
  id: number;
}
export interface CellData {
  smiles_string: string;
  source_molecule_name: string;
}

export type ReactionLabJobOrder = {
  Solvent: string,
  "Step No": number,
  "Product MW": number,
  "Product 1 SMILES": string,
  [key: string]: string | number,
}

export enum ReactionButtonNames {
  VALIDATE = 0,
  SAVE = 1
}

export interface ReactionDetailsProps {
  isReactantList: boolean;
  data: ReactionDetailType;
  onDataChange: (changes: RowChange[]) => void;
  solventList?: string[];
  temperatureList?: number[];
  onSolventChange: (value: string) => void;
  onTemperatureChange: (value: number) => void;
  setReactionDetail: (reactionDetail: {
    solvent?: string;
    temperature?: number;
    id?: string | number;
    reactionTemplate?: string;
  }) => void;
  handleSwapReaction: (value: ReactionCompoundType[]) => void;
  resetReaction?: number;
  status?: string;
}

export interface RowChange {
  id: number;
  [field: string]: any;
}

export enum ResetState {
  SUBMIT = 0,
  RESET = 1
}