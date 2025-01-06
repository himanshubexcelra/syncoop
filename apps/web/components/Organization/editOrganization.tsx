/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import toast from "react-hot-toast";
import { useContext, useEffect, useState } from "react";
import {
  Form,
  SimpleItem,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  Label,
  GroupItem,
} from "devextreme-react/form";
import RadioGroup from "devextreme-react/radio-group";
import { editOrganization } from "./service";
import { delay } from "@/utils/helpers";
import { DELAY, status } from "@/utils/constants";
import {
  userType,
  OrganizationDataFields,
  OrganizationType,
  AssayLabel,
  ShowEditPopupType,
  fetchDataType,
  ProjectDataFields,
  ActionStatus
} from "@/lib/definition";
import { TextBoxTypes } from 'devextreme-react/text-box';
import { User } from "@/lib/definition";
import { AppContext } from "@/app/AppState";
import { Messages } from "@/utils/message";

const functionalAssay = {
  functionalAssay1: '',
  functionalAssay2: '',
  functionalAssay3: '',
  functionalAssay4: '',
};

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
  editPopup: boolean,
}

export default function EditOrganization({
  organizationData,
  showEditPopup,
  fetchOrganizations,
  formRef,
  myRoles,
  loggedInUser,
  editPopup,
}: OrganizationEditField) {
  const [formData, setFormData] = useState(organizationData);
  const [primaryContactId, setPrimaryContactId] = useState(organizationData.owner_id);
  const meta = organizationData.metadata ? organizationData.metadata : functionalAssay
  const [metaData, setMetaData] = useState(meta);
  const context: any = useContext(AppContext);
  const appContext = context.state;
  const { orgUser, type } = organizationData;

  // Update local state when organizationData changes

  useEffect(() => {
    const data = organizationData.metadata || functionalAssay;
    const formValue = { ...organizationData, metadata: data };
    formRef.current?.instance().option('formData', formValue);
    setFormData(formValue);
    setPrimaryContactId(organizationData.owner_id);
    setMetaData(data);
    if (editPopup) {
      setMetaData(meta);
    }
  }, [organizationData, formRef, editPopup]);


  const handleSubmit = async () => {
    if (formRef.current!.instance().validate().isValid) {
      const metadata = metaData;
      const finalData = { ...formData, metadata: metadata, primaryContactId };
      const response = await editOrganization(finalData);
      if (!response.error) {
        formRef.current!.instance().reset();
        fetchOrganizations();
        showEditPopup(false);
        context?.addToState({ ...appContext, refreshAssayTable: true })
        const toastId = toast.success(Messages.UPDATE_ORGANIZATION);
        await delay(DELAY);
        toast.remove(toastId);
      } else {
        const toastId = toast.error(`${response.error}`);
        await delay(DELAY);
        toast.remove(toastId);
      }
    }
  };

  const handleValueChange = (value: string) => {
    setFormData((prevData: OrganizationDataFields) => ({
      ...prevData,
      is_active: value === ActionStatus.Enabled,
    }));
  };

  const handleContactChange = (contact: any) => {
    const user = formData?.orgUser?.filter((val: userType) => val.id === contact.value)?.[0];
    setFormData((prevData: OrganizationDataFields) => ({
      ...prevData,
      user
    }));
    setPrimaryContactId(user?.id)
  }

  const userList = orgUser?.filter((user: User) =>
    user.user_role[0]?.role?.type ===
    (type === OrganizationType.Internal ? 'admin' : 'org_admin'));

  const primaryContact = {
    key: "id",
    dataSource: userList,
    displayExpr: (item: userType) => `${item?.first_name} ${item?.last_name || ''}`,
    valueExpr: "id",
    value: primaryContactId, // Bind the value to state
    onValueChanged: handleContactChange,
  };

  const setMetaDataValue = (e: TextBoxTypes.ValueChangedEvent) => {
    const field = e?.event?.currentTarget;
    if (field) {
      const { value, name } = field as any;
      const data = {
        ...metaData,
        ...{ [name]: value }
      };
      setFormData((prevData: OrganizationDataFields) => ({
        ...prevData,
        metadata: data
      }));
      setMetaData(data);
    }
  }

  const disableAllowed = myRoles?.includes('admin') &&
    organizationData.owner_id !== loggedInUser;

  const cancelSave = () => {
    formRef?.current!.instance().reset();
    showEditPopup(false);
    setMetaData(meta)
  }

  return (
    <>
      <Form ref={formRef} formData={formData}>
        <SimpleItem dataField="name" editorOptions={{ disabled: true }}>
          <Label text="Organization Name" />
          <RequiredRule message="Organization name is required" />
        </SimpleItem>
        <GroupItem colCount={2} cssClass="delete-button-group">
          <SimpleItem dataField="status" editorOptions={{ disabled: !disableAllowed }}>
            <RadioGroup
              items={status}
              disabled={!disableAllowed}
              className={!disableAllowed ? "disabled-field" : ""}
              defaultValue={formData.is_active ? ActionStatus.Enabled : ActionStatus.Disabled}
              onValueChange={handleValueChange} />
          </SimpleItem>
          <ButtonItem cssClass="delete-button">
            <ButtonOptions
              stylingMode="text"
              text={`Delete 
          ${formData.name}`}
              visible={disableAllowed}
              disabled={true}
              elementAttr={{ class: 'lowercase' }} />
          </ButtonItem>
        </GroupItem>
        <SimpleItem
          editorType="dxSelectBox"
          editorOptions={primaryContact}        >
          <Label text="Primary Contact" />
        </SimpleItem>
        <GroupItem caption="Functional Assay" cssClass="groupItem" colCount={1}></GroupItem>
        <SimpleItem
          dataField="functionalAssay1"
          editorOptions={
            {
              placeholder: "Functional Assay",
              onChange: setMetaDataValue,
              value: metaData.functionalAssay1
            }
          }>
          <Label text={AssayLabel.functionalAssay1} />
        </SimpleItem>
        <SimpleItem
          dataField="functionalAssay2"
          editorOptions={
            {
              placeholder: "Functional Assay",
              onChange: setMetaDataValue,
              value: metaData.functionalAssay2
            }
          }>
          <Label text={AssayLabel.functionalAssay2} />
        </SimpleItem>
        <SimpleItem dataField="functionalAssay3" editorOptions={
          {
            placeholder: "Functional Assay",
            onChange: setMetaDataValue,
            value: metaData.functionalAssay3
          }
        }>
          <Label text={AssayLabel.functionalAssay3} />
        </SimpleItem>
        <SimpleItem
          dataField="functionalAssay4"
          editorOptions={
            {
              placeholder: "Functional Assay",
              onChange: setMetaDataValue,
              value: metaData.functionalAssay4
            }
          }>
          <Label text={AssayLabel.functionalAssay4} />
        </SimpleItem>
        <GroupItem cssClass="buttons-group" colCount={2}>
          <GroupItem cssClass="buttons-group" colCount={2}>
            <ButtonItem horizontalAlignment="left" cssClass="form_btn_primary">
              <ButtonOptions
                text="Update"
                useSubmitBehavior={true}
                onClick={handleSubmit}
              />
            </ButtonItem>
            <ButtonItem horizontalAlignment="left" cssClass="form_btn_secondary">
              <ButtonOptions text="Cancel" onClick={cancelSave} />
            </ButtonItem>
          </GroupItem>
        </GroupItem>
      </Form >
    </>
  );
}
