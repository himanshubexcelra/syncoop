'use client'
import toast from "react-hot-toast";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Form,
  SimpleItem,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  Label,
  GroupItem,
} from "devextreme-react/form";
import Image from 'next/image';
import { CheckBox, CheckBoxTypes } from 'devextreme-react/check-box';
import { delay } from "@/utils/helpers";
import { createProjectApi, editProject } from "./projectService";
import "./projects.css";
import { ProjectCreateFields, OrganizationDataFields, User } from "@/lib/definition";
import { DELAY, PERMISSIONS, PROJECT_TYPES } from "@/utils/constants";
import DataGrid, { Column, Sorting, DataGridRef } from "devextreme-react/data-grid";
import Textbox, { TextBoxTypes } from 'devextreme-react/text-box';
import { SelectBox } from "devextreme-react";
import { sortString } from "@/utils/sortString";

export default function CreateProject({
  setCreatePopupVisibility,
  fetchOrganizations,
  formRef,
  data,
  projectData,
  users,
  organizationData,
  roleType,
  edit
}: ProjectCreateFields) {
  const [filteredData, setFilteredData] = useState<User[]>(users);
  const [userList, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({ search: '', filter: false, permission: '' });
  const [organizationId, setOrganizationId] = useState(data?.orgUser?.id);
  const [showIcon, setShowIcon] = useState('arrow-both');
  const dataGridRef = useRef<DataGridRef>(null);

  const projectTypeEditorOptions = { items: PROJECT_TYPES, searchEnabled: true, disabled: edit };

  const filterUsers = (filteredUsers: User[] = []) => {
    if (edit && projectData) {
      const filteredUser = filteredUsers.filter(u => u.id !== projectData.ownerId)
      const updatedAllUsers = filteredUser.map(user => {
        const updatedUser = projectData.sharedUsers.find(u => u.userId === user.id);
        return { ...user, permission: updatedUser ? updatedUser.role : 'View' };
      });
      setFilteredData(updatedAllUsers);
      const newFilter = { permission: '', search: '', filter: false };
      setFilters(newFilter);
      setUsers(updatedAllUsers);
    } else {
      const updatedData = filteredUsers.map(user => ({
        ...user,
        permission: 'View',
      }));
      setFilteredData(updatedData);
      const newFilter = { permission: '', search: '', filter: false };
      setFilters(newFilter);
      setUsers(updatedData);
    }
  }

  useEffect(() => {
    filterUsers(users);
  }, []);

  const filterValue = ({ data }: { data: User[] }) => {
    const filteredValue = data.filter((item) =>
      item.permission !== 'View');
    setFilteredData(filteredValue);
  }

  const searchUser = ({ value, data }: { value: string, data: User[] }) => {
    const filteredValue = data.filter((item) =>
      item.firstName.toLowerCase().includes(value.toLowerCase()) ||
      item.lastName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filteredValue);
  }

  const onValueChanged = (args: CheckBoxTypes.ValueChangedEvent) => {
    const { value } = args;
    setFilters((prevState) => ({ ...prevState, filter: value }));
    if (value) {
      filterValue({ data: filteredData });
    } else {
      if (filters.search) searchUser({ value: filters.search, data: userList });
      else setFilteredData(userList);
    }
  };

  const searchData = (e: TextBoxTypes.ValueChangedEvent) => {
    const { value } = e;
    setFilters((prevState) => ({ ...prevState, search: value }));
    if (value) {
      searchUser({ value, data: filteredData });
    }
    else {
      if (filters.filter) filterValue({ data: userList });
      else setFilteredData(userList);
    }

  }

  const handlePermissionChange = (userId: number, permission: string) => {
    const data = [...filteredData];
    data[userId].permission = permission;

    setFilteredData(data);
    setShowIcon('arrow-both');
  }

  const handleSubmit = async () => {
    const values = formRef.current!.instance().option("formData");
    if (formRef.current!.instance().validate().isValid) {
      const sharedUsers = filteredData.filter(val => val.permission !== 'View');
      let response;
      if (edit) response = await editProject({ ...values, sharedUsers, organizationId, userId: data.id })
      else response = await createProjectApi({ ...values, sharedUsers, organizationId, userId: data.id });
      if (!response.error) {
        formRef.current!.instance().reset();
        fetchOrganizations();
        setCreatePopupVisibility(false);
      } else {
        const toastId = toast.error(`${response.error}`);
        await delay(DELAY);
        toast.remove(toastId);
      }
    }
  };

  const fetchUserList = (e: any) => {
    const { value } = e;
    if (Array.isArray(organizationData)) {
      let filteredUsers = organizationData.filter((org: OrganizationDataFields) => org.id === value)[0]?.orgUser || [];
      filteredUsers = filteredUsers.filter((user: User) => user.user_role[0]?.role?.type === 'library_manager' && user.id !== data.id);
      setUsers(filteredUsers);
      setOrganizationId(value);
      filterUsers(filteredUsers);
    }
  }

  const sortByPermission = () => {
    let value = filters.permission;
    if (!value) value = 'asc';
    else if (value === 'desc') value = 'asc';
    else value = 'desc';
    setFilters((prevState) => ({ ...prevState, permission: value }));
    let tempUsers = [...filteredData];
    if (value === 'asc') {
      tempUsers = sortString(tempUsers, 'permission', 'asc');
      setShowIcon('arrow-down');
      setFilteredData(tempUsers);
      if (dataGridRef.current) {
        dataGridRef.current.instance().clearSorting();
      }
    } else {
      tempUsers = sortString(tempUsers, 'permission', 'desc');
      setShowIcon('arrow-up');
      setFilteredData(tempUsers);
      if (dataGridRef.current) {
        dataGridRef.current.instance().clearSorting();
      }
    }
  }

  const OrganizationSelectBox = useMemo(() => (
    <SimpleItem
      dataField="organization"
      editorType="dxSelectBox"
      editorOptions={{
        items: organizationData,
        displayExpr: "name",
        placeholder: "Organization name",
        valueExpr: "id",
        value: "",
        onValueChanged: fetchUserList
      }}
    >
      <Label text="Select an Organisation" />
    </SimpleItem>
  ), [organizationData, roleType]);

  return (
    <Form ref={formRef} showValidationSummary={true} formData={projectData}>
      {roleType === 'admin' && !edit ? OrganizationSelectBox :
        <SimpleItem
          dataField="organization"
          editorOptions={{ placeholder: "Organization name", disabled: true, value: data?.orgUser?.name }}
          cssClass='disabled-field'
        >
          <Label text="Organization Name" />
        </SimpleItem>}
      <SimpleItem
        dataField="owner"
        editorOptions={{ placeholder: "Project Owner", disabled: true, value: `${data.owner?.firstName} ${data.owner?.lastName}` }}
        cssClass='disabled-field'
      >
        <Label text="Project Owner" />
      </SimpleItem>
      <SimpleItem
        editorType="dxSelectBox"
        dataField="type"
        editorOptions={projectTypeEditorOptions}
        cssClass={edit ? 'disabled-field' : ''}
      >
        <Label text="Project Type" />
        <RequiredRule message="Project type is required" />
      </SimpleItem>
      <SimpleItem
        dataField="name"
        editorOptions={{ placeholder: "New Project" }}
      >
        <Label text="Project name" />
        <RequiredRule message="Project name is required" />
      </SimpleItem>
      <SimpleItem
        dataField="target"
        editorOptions={{ placeholder: "Target" }}
      >
        <Label text="Target" />
      </SimpleItem>
      <SimpleItem
        dataField="description"
        editorType="dxTextArea"
        editorOptions={{
          maxLength: 500,
          height: "90px",
          placeholder: "Description"
        }}
        colSpan={2}
      >
        <Label text="Description" />
      </SimpleItem>

      <GroupItem caption="Admin/Editors Access" cssClass="groupItem group-search" colCount={2}>
        <div className="search-box">
          <Textbox
            placeholder="Search"
            className="search-input"
            inputAttr={{
              style: { paddingRight: '30px' }
            }}
            onValueChanged={searchData}
          />
        </div>
        <div className="flex gap-[8px] filter">
          <CheckBox
            elementAttr={{ 'aria-label': 'Hide view only' }}
            onValueChanged={onValueChanged}
          />
          <div>Hide view only</div>
        </div>
      </GroupItem>
      {filteredData.length === 0 ? (
        <GroupItem caption=" " cssClass="groupItem group-data" colCount={1}>
          <div className="nodata">No data</div>
        </GroupItem>
      ) : (
        <GroupItem caption=" " cssClass="groupItem group-data" colCount={2}>
          <div style={{ width: '50%' }}>
            <DataGrid
              dataSource={filteredData}
              ref={dataGridRef}
            >
              <Column
                dataField="firstName"
                alignment="center"
                cellRender={({ data }: any) => <span>{data.firstName} {data.lastName}</span>}
                caption="Name"
              />
              <Sorting mode="single" />
            </DataGrid>
          </div>
          <div>
            <div className="permission" onClick={sortByPermission}>
              Permissions
              <Image
                src={`/icons/${showIcon}.svg`}
                width={24}
                height={24}
                alt="organization"
              />
            </div>
            {filteredData?.map((user, idx) => (
              <div key={user.id} className={`select-div ${idx === 0 ? 'select-div-first' : ''}`}>
                <SelectBox
                  items={PERMISSIONS}
                  value={user.permission}
                  onValueChange={(e) => handlePermissionChange(idx, e)}
                />
              </div>
            ))}
          </div>
        </GroupItem>
      )}
      <GroupItem cssClass="buttons-group" colCount={2}>
        <ButtonItem horizontalAlignment="left" cssClass="btn_primary">
          <ButtonOptions
            text={edit ? 'Update' : "Create Project"}
            useSubmitBehavior={true}
            onClick={handleSubmit}
          />
        </ButtonItem>
        <ButtonItem horizontalAlignment="left" cssClass="btn_secondary">
          <ButtonOptions text="Discard" onClick={() => setCreatePopupVisibility(false)} />
        </ButtonItem>
      </GroupItem>
    </Form>
  );
}