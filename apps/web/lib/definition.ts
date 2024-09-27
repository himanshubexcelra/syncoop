import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." })/* .trim() */,
  password: z
    .string()
    .min(8, { message: 'Password should be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Password should contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Password should contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Password should contain at least one special character.',
    })
    .trim(),
});

export interface BreadCrumbsObj {
  label: string;
  href: string;
  svgPath: string;
  svgWidth: number;
  svgHeight: number;
  isActive?: boolean;
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

export interface OrganizationDataFields {
  name: string;
  email: string;
  status: string;
}

export interface OrganizationTableProps {
  data: OrganizationDataFields;
}
