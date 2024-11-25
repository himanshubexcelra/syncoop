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
import { LoginFormSchema, OrganizationCreateFields } from "@/lib/definition";
import { DELAY } from "@/utils/constants";
import { AppContext } from "@/app/AppState";
import { useContext } from "react";
import { Messages } from "@/utils/message";
import { useMemo, useState } from "react";
import { ButtonTypes } from "devextreme-react/cjs/button";
import { TextBoxTypes } from "devextreme-react/cjs/text-box";
import Image from "next/image";
import { Tooltip, } from "devextreme-react";
import PasswordCriteria from "../PasswordCriteria/PasswordCriteria";

const customPasswordCheck = (password: any) =>
  LoginFormSchema.shape.password_hash.safeParse(password).success

export default function RenderCreateOrganization({
  setCreatePopupVisibility,
  formRef,
  fetchOrganizations,
  role_id,
  created_by,
}: OrganizationCreateFields) {
  const context: any = useContext(AppContext);
  const appContext = context.state;
  const [password_hash, setPassword] = useState('');
  const [passwordMode, setPasswordMode] = useState<TextBoxTypes.TextBoxType>('password');
  const handleSubmit = async () => {
    const values = formRef.current!.instance().option("formData");
    if (formRef.current!.instance().validate().isValid) {
      const response = await createOrganization({ ...values, created_by }, role_id);
      if (!response.error) {
        formRef.current!.instance().reset();
        fetchOrganizations();
        setCreatePopupVisibility(false);
        context?.addToState({ ...appContext, refreshUsersTable: true })
      } else {
        const toastId = toast.error(`${response.error}`);
        await delay(DELAY);
        toast.remove(toastId);
      }
    }
  };
  const passwordButton = useMemo<ButtonTypes.Properties>(
    () => ({
      icon: passwordMode === "text" ? "eyeclose" : "eyeopen",
      stylingMode: "text",
      onClick: () => {
        setPasswordMode((prevPasswordMode: TextBoxTypes.TextBoxType) =>
          prevPasswordMode === "text" ? "password" : "text"
        );
      },
    }),
    [passwordMode]
  );
  const handleGeneratePassword = () => {
    const generatedPassword = generatePassword();
    setPassword(generatedPassword);
    navigator.clipboard.writeText(generatedPassword)
      .then(() => toast.success(Messages.PASSWORD_COPY))
      .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
    formRef.current!.instance().updateData("password_hash", generatedPassword);
  };

  const handleCopyPassword = async () => {
    if (password_hash === "") {
      const toastId = toast.error(Messages.PASSWORD_EMPTY)
      await delay(DELAY);
      toast.remove(toastId);
      return;
    }
    navigator.clipboard.writeText(password_hash)
      .then(() => toast.success(Messages.PASSWORD_COPY))
      .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
  };

  return (
    <CreateForm ref={formRef} showValidationSummary={true} >
      <SimpleItem
        dataField="name"
        editorOptions={{ placeholder: "Enter new organization name" }}
      >
        <Label text="Organization Name" />
        <RequiredRule message="Organization name is required" />
      </SimpleItem>
      <SimpleItem
        dataField="first_name"
        editorOptions={{ placeholder: "Organization Admin first name" }}
      >
        <Label text="Organization Admin First Name" />
      </SimpleItem>
      <SimpleItem
        dataField="last_name"
        editorOptions={{ placeholder: "Organization Admin last name" }}
      >
        <Label text="Organization Admin Last Name" />
      </SimpleItem>
      <SimpleItem
        dataField="email_id"
        editorOptions={{ placeholder: "Enter admin email id address" }}
      >
        <Label text="Organization Admin Email Address" />
        <RequiredRule message="Email is required" />
        <EmailRule message="Invalid Email Address" />
      </SimpleItem>
      <GroupItem colCount={4} cssClass="password-group">
        <SimpleItem
          dataField="password_hash"
          editorType="dxTextBox"
          cssClass="custom-password"
          editorOptions={{
            mode: passwordMode,
            placeholder: "Enter Password",
            buttons: [{
              name: "password_hash",
              location: "after",
              options: passwordButton,
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
      <ButtonItem horizontalAlignment="left" cssClass="form_btn_primary">
        <ButtonOptions
          text="Create Organization"
          useSubmitBehavior={true}
          onClick={handleSubmit}
          elementAttr={{ class: "btn-primary" }}
        />
      </ButtonItem>
    </CreateForm>
  );
}