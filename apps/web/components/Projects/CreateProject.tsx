/*eslint max-len: ["error", { "code": 100 }]*/
'use client'
import toast from "react-hot-toast";
import { useState, useEffect, useMemo } from "react";
import {
  Form,
  SimpleItem,
  RequiredRule,
  Label,
  GroupItem,
} from "devextreme-react/form";
import Image from 'next/image';
import { LoadIndicator } from 'devextreme-react';
import { CheckBox, CheckBoxTypes } from 'devextreme-react/check-box';
import { debounce, delay, isLibraryManger, isSystemAdmin } from "@/utils/helpers";
import { createProject, editProject } from "./projectService";
import {
  ProjectCreateFields,
  OrganizationDataFields,
  User,
  OrganizationType,
  ContainerPermissionLabel
} from "@/lib/definition";
import {
  ContainerAccessPermissionType,
  DELAY,
  PERMISSIONS,
  PROJECT_TYPES
} from "@/utils/constants";
import { SelectBox } from "devextreme-react";
import { sortString, sortStringJoined } from "@/utils/sortString";
import { Messages } from "@/utils/message";

export default function CreateProject({
  setCreatePopupVisibility,
  fetchOrganizations,
  formRef,
  userData,
  projectData,
  users,
  organizationData,
  myRoles,
  edit,
  clickedOrg
}: ProjectCreateFields) {
  const [filteredData, setFilteredData] = useState<User[]>(users);
  const [loadIndicatorVisible, setLoadIndicatorVisible] = useState(false);
  const [userList, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({ search: '', filter: false, permission: '', name: '' });
  const [organization_id, setOrganizationId] = useState(
    clickedOrg
      ? clickedOrg
      : !isSystemAdmin(myRoles) ?
        userData?.orgUser?.id : '');
  const [showIcon, setShowIcon] = useState({ name: 'arrow-both', permission: 'arrow-both' });

  const filterUsers = (filteredUsers: User[] = []) => {
    if (edit && projectData) {
      const filteredUser = filteredUsers.filter(u => u.id !== projectData.owner_id);
      const updatedAllUsers = filteredUser.map(user => {
        const updatedUser = projectData?.container_access_permission?.find(u =>
          u.user_id === user.id);
        return {
          ...user, permission: updatedUser ?
            ContainerAccessPermissionType[updatedUser.access_type] : ContainerPermissionLabel.View
        };
      });
      setFilteredData(updatedAllUsers);
      const newFilter = { permission: '', search: '', filter: false, name: '' };
      setFilters(newFilter);
      setUsers(updatedAllUsers);
    } else {
      const updatedData = filteredUsers.map(user => ({
        ...user,
        permission: 'View',
      }));
      setFilteredData(updatedData);
      const newFilter = { permission: '', search: '', filter: false, name: '' };
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
      item.first_name.toLowerCase().includes(value.toLowerCase()) ||
      item.last_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filteredValue);
  }

  const onFilterChange = (args: CheckBoxTypes.ValueChangedEvent) => {
    const { value } = args;
    setFilters((prevState) => ({ ...prevState, filter: value }));
    if (value) {
      filterValue({ data: filteredData });
    } else {
      if (filters.search) searchUser({ value: filters.search, data: userList });
      else setFilteredData(userList);
    }
  };

  const handleSearch = debounce((value: string) => {
    setFilters((prevState) => ({ ...prevState, search: value }));
    if (value) {
      searchUser({ value, data: filteredData });
    }
    else {
      if (filters.filter) filterValue({ data: userList });
      else setFilteredData(userList);
    }
  }, 500);

  const searchData = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  }

  const handlePermissionChange = (user_id: number, permission: string) => {
    const data = [...filteredData];
    data[user_id].permission = permission;

    setFilteredData(data);
    setShowIcon({ name: 'arrow-both', permission: 'arrow-both' });
  }

  const handleSubmit = async () => {
    setLoadIndicatorVisible(true);
    const values = formRef.current!.instance().option("formData");
    if (formRef.current!.instance().validate().isValid) {
      const sharedUsers = filteredData.filter(val => val.permission !== 'View');
      let response;
      if (edit) {
        response = await editProject(
          {
            ...values,
            sharedUsers,
            organization_id: projectData?.container?.id,
            user_id: userData.id,
          })
      }
      else {
        const selectedOrg = organizationData.find(
          (orgData) => orgData.id === organization_id);
        response = await createProject(
          {
            ...values,
            sharedUsers,
            organization_id,
            user_id: userData.id,
            ...(() => {
              if (selectedOrg && selectedOrg.config) {
                return {
                  config: selectedOrg.config
                }
              }
            })()
          });
      }
      if (!response.error) {
        formRef.current!.instance().reset();
        fetchOrganizations();
        setCreatePopupVisibility(false);
        const status = `${edit ? 'updated' : 'created'}`;
        const message = Messages.projectAddedUpdated(status);
        const toastId = toast.success(message);
        await delay(DELAY);
        toast.remove(toastId);
        setLoadIndicatorVisible(false);
      } else {
        const toastId = toast.error(`${response.error}`);
        await delay(DELAY);
        toast.remove(toastId);
        setLoadIndicatorVisible(false);
      }
    }
  };

  const fetchUserList = (e: any) => {
    const { value } = e;
    setOrganizationId(value);
    let filteredUsers = organizationData.filter(
      (org: OrganizationDataFields) => org.id === value)[0]?.orgUser || [];
    filteredUsers = filteredUsers.filter(
      (user: User) => {
        const roles = user.user_role
          .map(role => role.role.type)
          .filter(role => role !== undefined) as string[] || [];
        return isLibraryManger(roles) && user.id !== userData.id
      });
    setUsers(filteredUsers);
    filterUsers(filteredUsers);
  }

  const sortUsers = (field: string) => {
    let value = filters[field as keyof typeof filters];
    if (!value) value = 'asc';
    else if (value === 'desc') value = ''; // remove sort
    else value = 'desc';
    let tempUsers = [...filteredData];
    const sortIcon = { name: 'arrow-both', permission: 'arrow-both' };
    const tempFilter = { ...filters, permission: '', name: '' };
    setFilters({ ...tempFilter, [field]: value });
    if (field === 'permission') {
      tempUsers = sortString(tempUsers, field, value);
    } else {
      tempUsers = sortStringJoined(tempUsers, 'first_name', value, 'second_name');
    }
    setFilteredData(tempUsers);
    if (value === 'asc') {
      sortIcon[field as keyof typeof sortIcon] = 'arrow-down';
      setShowIcon(sortIcon);
    } else if (value === 'desc') {
      sortIcon[field as keyof typeof sortIcon] = 'arrow-up';
      setShowIcon(sortIcon);
    } else {
      setShowIcon(sortIcon);
      setFilteredData(userList);
    }
  }

  const OrganizationSelectBox = useMemo(() => (
    <SimpleItem
      dataField="organization"
      editorType="dxSelectBox"
      editorOptions={{
        items: organizationData.filter(
          (organization: OrganizationDataFields) =>
            organization.type !== OrganizationType.Internal),
        displayExpr: "name",
        placeholder: "Organization name",
        valueExpr: "id",
        value: organization_id,
        searchEnabled: true,
        onValueChanged: fetchUserList
      }}
    >
      <Label text="Select an Organization" />
      <RequiredRule message="Organization name is required" />
    </SimpleItem>
  ), [organizationData, myRoles, organization_id]);

  const cancelSave = () => {
    formRef?.current!.instance().reset();
    setCreatePopupVisibility(false);
  }

  return (
    <Form ref={formRef} showValidationSummary={true} formData={projectData}>
      {myRoles?.includes('admin') && !edit && !clickedOrg ? OrganizationSelectBox :
        <SimpleItem
          dataField="organization"
          editorOptions={
            {
              placeholder: "Organization name",
              disabled: true,
              value: edit ? projectData?.container?.name : (
                clickedOrg ?
                  organizationData[0]?.name
                  : userData?.orgUser?.name)
            }
          }
        >
          <Label text="Organization Name*" />
        </SimpleItem>}
      <SimpleItem
        dataField="owner"
        editorOptions={
          {
            placeholder: "Project Owner",
            disabled: true,
            value: `${userData.owner?.first_name} ${userData.owner?.last_name}`
          }
        }
      >
        <Label text="Project Owner*" />
      </SimpleItem>
      <SimpleItem
        editorType="dxSelectBox"
        dataField="type"
        editorOptions={{
          items: PROJECT_TYPES,
          searchEnabled: true,
          disabled: edit,
          value: edit ? projectData?.metadata.type : PROJECT_TYPES[0]
        }}
      >
        <Label text="Project Type" />
        <RequiredRule message="Project type is required" />
      </SimpleItem>
      <SimpleItem
        dataField="name"
        editorOptions={{ placeholder: "New Project" }}
      >
        <Label text="Project Name" />
        <RequiredRule message="Project name is required" />
      </SimpleItem>
      <SimpleItem
        dataField="target"
        editorOptions={{
          placeholder: "Target",
          value: (projectData?.metadata.target) ? projectData.metadata.target : ''
        }}
      >
        <Label text="Target" />
      </SimpleItem>
      <SimpleItem
        dataField="description"
        editorType="dxTextArea"
        cssClass='textarea-field'
        editorOptions={{
          height: "90px",
          placeholder: "Description"
        }}
        colSpan={2}
      >
        <Label text="Description" />
      </SimpleItem>

      <GroupItem caption="Admin/Editors Access" cssClass="groupItem group-search" colCount={2}>
        <div>
          <input
            placeholder="Search"
            className="search-input"
            width={120}
            onChange={searchData} />
        </div>
        <div className="flex gap-[8px] filter">
          <CheckBox
            elementAttr={{ 'aria-label': 'Hide view only' }}
            onValueChanged={onFilterChange}
          />
          <div>Hide view only</div>
        </div>
      </GroupItem>
      {filteredData.length === 0 ? (
        <GroupItem caption=" " cssClass="groupItem group-data group-empty" colCount={2}>
          <div className="nodata-project">No data</div>
        </GroupItem>
      ) : (
        <GroupItem caption=" " cssClass="groupItem group-data" colCount={2}>
          <div style={{ width: '50%' }}>
            <div className="permission" onClick={() => sortUsers('name')}>
              Name
              <Image
                src={`/icons/${showIcon.name}.svg`}
                width={24}
                height={24}
                alt="sort"
              />
            </div>
            {filteredData?.map((user, idx) => (
              <div key={user.id} className={`
              select-div name-div ${idx === 0 ? 'select-div-first' : ''}`}>
                <div>{user.first_name} {user.last_name}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="permission" onClick={() => sortUsers('permission')}>
              Permissions
              <Image
                src={`/icons/${showIcon.permission}.svg`}
                width={24}
                height={24}
                alt="sort-p"
              />
            </div>
            {filteredData?.map((user, idx) => (
              <div key={user.id} className={`select-div ${idx === 0 ? 'select-div-first' : ''}`}>
                <SelectBox
                  items={PERMISSIONS}
                  placeholder="permission"
                  value={user.permission}
                  onValueChange={(e) => handlePermissionChange(idx, e)}
                />
              </div>
            ))}
          </div>
        </GroupItem>
      )}
      <GroupItem cssClass="buttons-group" colCount={2}>
        <button className={
          loadIndicatorVisible
            ? 'disableButton w-[65px] h-[37px]'
            : 'primary-button'}
          onClick={handleSubmit}
          disabled={loadIndicatorVisible}>
          <LoadIndicator className={
            `button-indicator`
          }
            visible={loadIndicatorVisible}
            height={20}
            width={20}
          />
          {loadIndicatorVisible ? '' : edit ? 'Update' : 'Create Project'}
        </button>
        <button className='secondary-button ml-[15px]' onClick={cancelSave}>
          Discard
        </button>
      </GroupItem>
    </Form>
  );
}