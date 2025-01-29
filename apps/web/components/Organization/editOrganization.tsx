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
import { editOrganization, deleteOrganization } from "./service";
import {
  delay,
  isDeleteLibraryEnable
} from "@/utils/helpers";
import { DELAY, status } from "@/utils/constants";
import DeleteConfirmation from "@/ui/DeleteConfirmation";

import {
  userType,
  OrganizationDataFields,
  OrganizationType,
  ShowEditPopupType,
  fetchDataType,
  ProjectDataFields,
  ActionStatus,
} from "@/lib/definition";
import { User } from "@/lib/definition";
import { AppContext } from "@/app/AppState";
import { Messages } from "@/utils/message";

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
  const context: any = useContext(AppContext);
  const appContext = context.state;
  const { orgUser, type } = organizationData;
  const [confirm, setConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Update local state when organizationData changes

  useEffect(() => {
    const formValue = { ...organizationData };
    formRef.current?.instance().option('formData', formValue);
    setFormData(formValue);
    setPrimaryContactId(organizationData.owner_id);
  }, [organizationData, formRef, editPopup]);


  const handleSubmit = async () => {
    if (formRef.current!.instance().validate().isValid) {
      const finalData = { ...formData, primaryContactId };
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
    user.user_role?.[0]?.role?.type ===
    (type === OrganizationType.Internal ? 'admin' : 'org_admin'));

  const primaryContact = {
    key: "id",
    dataSource: userList,
    displayExpr: (item: userType) => `${item?.first_name} ${item?.last_name || ''}`,
    valueExpr: "id",
    value: primaryContactId, // Bind the value to state
    onValueChanged: handleContactChange,
  };

  const disableAllowed = myRoles?.includes('admin') &&
    organizationData.owner_id !== loggedInUser;

  const cancelSave = () => {
    formRef?.current!.instance().reset();
    showEditPopup(false);
  }
  const handleDeleteOrganization = () => {
    setConfirm(true);
  }

  const validateDeleteProjectBtn = (data: OrganizationDataFields) => {
    const projectLibraries = data?.other_container;
    if (!projectLibraries) return true;
    if (!isDeleteLibraryEnable(data?.organizationMolecules ?? [])) {
      return false;
    }
    return true;
  };

  const deleteOrganizationData = async (data: OrganizationDataFields) => {
    const projectIds: number[] = (data?.other_container ?? [])
      .map((item: ProjectDataFields) => Number(item.id));
    let params: object = {
      org_id: data.id,
    }
    if (data?.other_container) {
      params = {
        ...params,
        orgProjectIds: projectIds
      }
    }
    if (data?.organizationMolecules) {
      params = {
        ...params,
        isMolecule: true
      }
    }
    const result = await deleteOrganization(params);
    if (result.success) {
      toast.success(Messages.DELETE_ORGANIZATION_SUCCESS);
      setIsLoading(false);
      showEditPopup(false);
      fetchOrganizations();
    }
    else {
      toast.error(Messages.DELETE_ORGANIZATION_ERROR);
      setIsLoading(false);
    }
  }
  const handleCancel = () => {
    setConfirm(false)
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
              className={`radio-flex ${!disableAllowed} ? "disabled-field" : ""`}
              defaultValue={formData.is_active ? ActionStatus.Enabled : ActionStatus.Disabled}
              onValueChange={handleValueChange} />
          </SimpleItem>
          {validateDeleteProjectBtn(formData) && myRoles?.includes('admin') &&
            <ButtonItem cssClass="delete-button">
              <ButtonOptions
                stylingMode="text"
                text={`Delete 
          ${formData.name}`}
                visible={disableAllowed}
                elementAttr={{ class: 'lowercase' }}
                onClick={() => handleDeleteOrganization()}

              />
            </ButtonItem>
          }

        </GroupItem>
        <SimpleItem
          editorType="dxSelectBox"
          editorOptions={primaryContact}        >
          <Label text="Primary Contact" />
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
        {confirm && (
          <DeleteConfirmation
            onSave={() => deleteOrganizationData(formData)}
            openConfirmation={confirm}
            isLoader={isLoading}
            setConfirm={() => handleCancel()}
            msg={Messages.deleteOrgMsg(formData.name)}
            title={Messages.DELETE_ORGANIZATION_TITLE}
          />
        )}
      </Form >

    </>
  );
}
