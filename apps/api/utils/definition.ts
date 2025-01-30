export enum MoleculeStatusLabel {
  New = 'New',
  NewInCart = 'New + In Cart',
  Ordered = 'Ordered',
  PreProcessing = 'Pre Processing',
  InRetroQueue = 'In Retro Queue',
  Failed = 'Failed',
  Ready = 'Ready',
  InReview = 'In Review',
  Validated = 'Validated',
  ValidatedInCart = 'Validated + In Cart',
  InProgress = 'In Progress',
  Done = 'Done',
  OrderedInCart = 'Ordered + In Cart',
}

export enum MoleculeStatusCode {
  New = 1,
  NewInCart = 2,
  Ordered = 3,
  InRetroQueue = 4,
  Failed = 5,
  Ready = 6,
  InReview = 7,
  Validated = 8,
  ValidatedInCart = 9,
  InProgress = 10,
  Done = 11,
  OrderedInCart = 12,
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


export enum ContainerAccessPermissionLabel {
  Admin = 'Admin',
  Edit = 'Edit'
}

export enum ContainerAccessPermissionType {
  Admin = 1,
  Edit = 2
}

export enum ContainerType {
  ORGANIZATION = 'O',
  CLIENT_ORGANIZATION = 'CO',
  PROJECT = 'P',
  LIBRARY = 'L',
}

export interface labJobOrder {
  molecule_id: number;
  pathway_id?: number;
  product_smiles_string: any;
  product_molecular_weight: any;
  no_of_steps: number;
  functional_bioassays: any;
  reactions: any;
  status: any;
  created_by: any;
  submitted_by: any;
  created_at: string;
} 