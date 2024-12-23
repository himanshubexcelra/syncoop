/*eslint max-len: ["error", { "code": 100 }]*/
import toast from "react-hot-toast";
import {
  Form as CreateForm,
  SimpleItem,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  EmailRule,
  Label,
  GroupItem,
  Item,
} from "devextreme-react/form";
import { delay, generatePassword } from "@/utils/helpers";
import { createOrganization } from "./service";
import {
  FetchUserType,
  LoginFormSchema,
  OrganizationDataFields,
  ProjectDataFields,
  ShowEditPopupType,
  User,
  UserData,
  UserRole
} from "@/lib/definition";
import { DELAY } from "@/utils/constants";
import { AppContext } from "@/app/AppState";
import { useCallback, useContext, useEffect } from "react";
import { Messages } from "@/utils/message";
import { useState } from "react";
import Image from "next/image";
import { Tooltip, } from "devextreme-react";
import PasswordCriteria from "../Tooltips/PasswordCriteria";
import { getFilteredRoles } from "../Role/service";

const customPasswordCheck = (password: any) =>
  LoginFormSchema.shape.password_hash.safeParse(password).success

type OrganizationCreateFields = {
  setCreatePopupVisibility: ShowEditPopupType,
  formRef: any,
  fetchOrganizations: FetchUserType,
  projectData?: ProjectDataFields,
  users?: User[],
  organizationData?: OrganizationDataFields[],
  roleType?: string,
  edit?: boolean,
  data?: UserData,
  created_by: number
}
export default function RenderCreateOrganization({
  setCreatePopupVisibility,
  formRef,
  fetchOrganizations,
  created_by,
}: OrganizationCreateFields) {
  const context: any = useContext(AppContext);
  const appContext = context.state.appContext;
  const [password_hash, setPassword] = useState('');
  const [role_id, setRoleId] = useState(-1);
  let copyPassword = password_hash
  const handleSubmit = async () => {
    const values = formRef.current!.instance().option("formData");
    if (formRef.current!.instance().validate().isValid) {
      const response = await createOrganization({ ...values, created_by }, role_id);
      if (!response.error) {
        formRef.current!.instance().reset();
        fetchOrganizations();
        setCreatePopupVisibility(false);
        context?.addToState({ appContext: { ...appContext, refreshUsersTable: true } })
        const toastId = toast.success(Messages.ADD_ORGANIZATION);
        await delay(DELAY);
        toast.remove(toastId);
      } else {
        const toastId = toast.error(`${response.error}`);
        await delay(DELAY);
        toast.remove(toastId);
      }
    }
  };

  const changePasswordMode = useCallback((name: any) => {
    const editor = formRef.current.instance().getEditor(name);
    const currentMode = editor.option('mode');
    editor.option('mode', currentMode === 'text' ? 'password' : 'text');
    const passwordButton = editor.option('buttons').find((button: any) =>
      button.name === 'password_hash');
    if (passwordButton) {
      passwordButton.options.icon = currentMode === 'text' ? "eyeopen" : "eyeclose";
    }
    editor.repaint();
  }, []);
  const handleGeneratePassword = () => {
    const generatedPassword = generatePassword();
    setPassword(generatedPassword);
    navigator.clipboard.writeText(generatedPassword)
      .then(() => toast.success(Messages.PASSWORD_COPY))
      .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
    formRef.current!.instance().updateData("password_hash", generatedPassword);
  };

  const handleCopyPassword = async () => {
    if (copyPassword === "") {
      const toastId = toast.error(Messages.PASSWORD_EMPTY)
      await delay(DELAY);
      toast.remove(toastId);
      return;
    }
    navigator.clipboard.writeText(copyPassword)
      .then(() => toast.success(Messages.PASSWORD_COPY))
      .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
  };

  const fetchRoles = async () => {
    const roles = await getFilteredRoles();
    const role = roles.find(
      (role: UserRole) => role.type === 'org_admin');
    if (role) {
      setRoleId(role.id)
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <CreateForm ref={formRef} showValidationSummary={true} >
      <SimpleItem
        dataField="name"
        editorOptions={{ placeholder: "Enter new organization name" }}
      >
        <Label text="Organization Name" />
        <RequiredRule message={Messages.ORGANIZATION_NAME_REQUIRED} />
      </SimpleItem>
      <SimpleItem
        dataField="first_name"
        editorOptions={{ placeholder: "Organization Admin first name" }}
      >
        <Label text="Organization Admin First Name" />
        <RequiredRule message={Messages.ORGANIZATION_ADMIN_FIRST_NAME_REQUIRED} />
      </SimpleItem>
      <SimpleItem
        dataField="last_name"
        editorOptions={{ placeholder: "Organization Admin last name" }}
      >
        <Label text="Organization Admin Last Name" />
        <RequiredRule message={Messages.ORGANIZATION_ADMIN_LAST_NAME_REQUIRED} />
      </SimpleItem>
      <SimpleItem
        dataField="email_id"
        editorOptions={{ placeholder: "Enter admin email id address" }}
      >
        <Label text="Organization Admin Email Address" />
        <RequiredRule message={Messages.EMAIL_REQUIRED} />
        <EmailRule message={Messages.EMAIL_INVALID} />
      </SimpleItem>
      <GroupItem colCount={4} cssClass="password-group">
        <SimpleItem
          dataField="password_hash"
          editorType="dxTextBox"
          cssClass="custom-password"
          editorOptions={{
            mode: 'password',
            placeholder: "Enter Password",
            valueChangeEvent: 'keyup',
            onValueChanged: (e: any) => copyPassword = e.value,
            buttons: [{
              name: "password_hash",
              location: "after",
              options: {
                stylingMode: 'text',
                icon: 'eyeopen',
                onClick: () => changePasswordMode('password_hash'),
              },
            }],
          }}
          validationRules={[
            {
              type: 'required',
              message: Messages.requiredMessage('Password')
            },
            {
              type: 'custom',
              validationCallback: (e) => {
                return customPasswordCheck(e.value);
              },
              message: Messages.PASSWORD_CRITERIA
            }
          ]}
        >
          <Label text={'Password'} />
        </SimpleItem>
        <Item>
          <div className="mt-[12px]">
            <Image
              src="/icons/copy-icon.svg"
              alt="copy"
              width={16}
              height={16}
              priority
              onClick={handleCopyPassword}
            />
          </div>
        </Item>
        <Item>
          <div className="mt-[12px]" id="info-box">
            <Image
              src="/icons/info-icon.svg"
              alt="info"
              width={16}
              height={16}
              priority
              id="info-icon-password_hash"
            />
            <Tooltip
              target="#info-icon-password_hash"
              showEvent="mouseenter"
              hideEvent="mouseleave"
              position="bottom"
              hideOnOutsideClick={false}
            >
              <PasswordCriteria />
            </Tooltip>
          </div>
        </Item>
        <ButtonItem cssClass="pt-[20px]">
          <ButtonOptions
            text={`Generate`}
            onClick={handleGeneratePassword}
            elementAttr={{ class: 'btn-secondary' }} />
        </ButtonItem>
      </GroupItem>
      <GroupItem
        cssClass="buttons-group"
        colCountByScreen={{ xs: 2, sm: 2, md: 2, lg: 2 }}
      >
        <ButtonItem cssClass="form_btn_primary">
          <ButtonOptions
            text="Create Organization"
            useSubmitBehavior={true}
            onClick={handleSubmit}
            elementAttr={{ class: "btn-primary" }}
          />
        </ButtonItem>
        <ButtonItem cssClass="form_btn_secondary">
          <ButtonOptions
            text="Cancel"
            onClick={() => {
              formRef.current?.instance().reset();
              setCreatePopupVisibility(false)
            }}
            elementAttr={{ class: "btn-secondary" }}
          />
        </ButtonItem>
      </GroupItem>
    </CreateForm>
  );
}