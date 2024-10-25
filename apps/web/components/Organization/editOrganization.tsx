"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import "./table.css";
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
import { OrganizationEditField, userType, OrganizationDataFields } from "@/lib/definition";
import { TextBoxTypes } from 'devextreme-react/text-box';

const functionalAssay = {
  functionalAssay1: '',
  functionalAssay2: '',
  functionalAssay3: '',
  functionalAssay4: '',
};

export default function EditOrganization({
  organizationData,
  showEditPopup,
  fetchOrganizations,
  formRef,
  myRoles,
  loggedInUser,
  orgAdminRole
}: OrganizationEditField) {
  const [formData, setFormData] = useState(organizationData);
  const [primaryContactId, setPrimaryContactId] = useState(organizationData.orgAdminId);
  const [metaData, setMetaData] = useState(organizationData.metadata ? organizationData.metadata : functionalAssay);

  // Update local state when organizationData changes
  useEffect(() => {
    const data = organizationData.metadata || functionalAssay;
    const formValue = { ...organizationData, metadata: data };
    formRef.current?.instance().option('formData', formValue);
    setFormData(formValue);
    setPrimaryContactId(organizationData.orgAdminId);
    setMetaData(data);

  }, [organizationData, formRef]);


  const handleSubmit = async () => {
    if (formRef.current!.instance().validate().isValid) {
      const metadata = metaData;
      const finalData = { ...formData, metadata: metadata, orgAdminRole };
      const response = await editOrganization(finalData);
      if (!response.error) {
        formRef.current!.instance().reset();
        fetchOrganizations();
        showEditPopup(false);
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
      status: value,
    }));
  };

  const handleContactChange = (contact: any) => {
    const user = formData?.orgUser?.filter((val: userType) => val.id === contact.value)?.[0];
    setFormData((prevData: OrganizationDataFields) => ({
      ...prevData,
      user
    }));
    setPrimaryContactId(user?.id)
  };

  const primaryContact = {
    key: "id",
    dataSource: organizationData.orgUser,
    displayExpr: (item: userType) => `${item?.firstName} ${item?.lastName || ''}`,
    valueExpr: "id",
    value: primaryContactId, // Bind the value to state
    onValueChanged: handleContactChange,
    disabled: true
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

  const disableAllowed = myRoles?.includes('admin') && organizationData.orgAdminId !== loggedInUser;

  const cancelSave = () => {
    formRef?.current!.instance().reset();
    showEditPopup(false);
  }

  return (
    <Form ref={formRef} formData={formData}>
      <SimpleItem dataField="name" editorOptions={{ disabled: true }}>
        <Label text="Organization Name" />
        <RequiredRule message="Organization name is required" />
      </SimpleItem>

      <GroupItem colCount={2} cssClass="delete-button-group">
        <SimpleItem dataField="status" editorOptions={{ disabled: !disableAllowed }}>
          <RadioGroup items={status} disabled={!disableAllowed} className={!disableAllowed ? "disabled-field" : ""} defaultValue={formData.status} onValueChange={handleValueChange} />
        </SimpleItem>
        <ButtonItem cssClass="delete-button">
          <ButtonOptions stylingMode="text" text={`Delete ${formData.name}`} disabled={true} elementAttr={{ class: 'lowercase' }} />
        </ButtonItem>
      </GroupItem>
      <SimpleItem
        editorType="dxSelectBox"
        editorOptions={primaryContact}
      >
        <Label text="Primary Contact" />
      </SimpleItem>
      <GroupItem caption="Functional Assay" cssClass="groupItem" colCount={1}></GroupItem>
      <SimpleItem dataField="functionalAssay1" editorOptions={{ placeholder: "Functional Assay", onChange: setMetaDataValue, value: metaData.functionalAssay1 }}>
        <Label text="Functional Assay 1" />
      </SimpleItem>
      <SimpleItem dataField="functionalAssay2" editorOptions={{ placeholder: "Functional Assay", onChange: setMetaDataValue, value: metaData.functionalAssay2 }}>
        <Label text="Functional Assay 2" />
      </SimpleItem>
      <SimpleItem dataField="functionalAssay3" editorOptions={{ placeholder: "Functional Assay", onChange: setMetaDataValue, value: metaData.functionalAssay3 }}>
        <Label text="Functional Assay 3" />
      </SimpleItem>
      <SimpleItem dataField="functionalAssay4" editorOptions={{ placeholder: "Functional Assay", onChange: setMetaDataValue, value: metaData.functionalAssay4 }}>
        <Label text="Functional Assay 4" />
      </SimpleItem>
      <GroupItem cssClass="buttons-group" colCount={2}>
        <GroupItem cssClass="buttons-group" colCount={2}>
          <ButtonItem horizontalAlignment="left" cssClass="btn_primary">
            <ButtonOptions
              text="Update"
              useSubmitBehavior={true}
              onClick={handleSubmit}
            />
          </ButtonItem>
          <ButtonItem horizontalAlignment="left" cssClass="btn_secondary">
            <ButtonOptions text="Cancel" onClick={cancelSave} />
          </ButtonItem>
        </GroupItem>
      </GroupItem>
    </Form>
  );
}
