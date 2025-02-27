/*eslint max-len: ["error", { "code": 100 }]*/
'use client'
import toast from "react-hot-toast";
import {
  Form,
  SimpleItem,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  Label,
  GroupItem,
} from "devextreme-react/form";
import { debounce, delay, isCustomReactionCheck, isDeleteLibraryEnable } from "@/utils/helpers";
import { createLibrary, deleteLibrary, editLibrary } from "./service";
import { ContainerPermissionLabel, LibraryCreateFields, User } from "@/lib/definition";
import { ContainerAccessPermissionType, DELAY, PERMISSIONS } from "@/utils/constants";
import { Messages } from "@/utils/message";
import { AppContext } from "@/app/AppState";
import { useContext, useEffect, useState } from "react";
import DeleteConfirmation from "@/ui/DeleteConfirmation";
import { LoadIndicator, SelectBox } from "devextreme-react";
import CheckBox, { CheckBoxTypes } from "devextreme-react/cjs/check-box";
import { sortString, sortStringJoined } from "@/utils/sortString";
import Image from "next/image";


export default function CreateLibrary({
  setCreatePopupVisibility,
  fetchLibraries,
  formRef,
  userData,
  projectData,
  library_idx,
  setLibraryId,
  users
}: LibraryCreateFields) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleteLibraryData, setDeleteLibraryData] = useState({ id: 0, name: '' });
  const context: any = useContext(AppContext);
  const appContext = context.state;
  const [deleteLibraryEnabled, setDeleteLibraryEnabled] = useState(false);
  const [loadIndicatorVisible, setLoadIndicatorVisible] = useState(false);
  const isCustomReaction = isCustomReactionCheck(projectData.metadata);
  const [filteredData, setFilteredData] = useState<User[]>(users);
  const [showIcon, setShowIcon] = useState({ name: 'arrow-both', permission: 'arrow-both' });
  const [filters, setFilters] = useState({ search: '', filter: false, permission: '', name: '' });
  const [userList, setUsers] = useState<User[]>([]);

  const entityLabel = isCustomReaction
    ? 'reactions'
    : 'molecules';
  
  const targetLib = projectData.other_container?.[library_idx]
  const owner = library_idx !== -1
    ? `${targetLib?.owner.first_name} ${targetLib?.owner?.last_name}`
    : `${userData?.first_name} ${userData?.last_name}`
  const initialFormData = {
    organization: projectData?.container?.name || '',
    owner: `${userData.first_name} ${userData.last_name}` || '',
    projectName: projectData.name || '',
    name: ''
  }
        
  const handleSubmit = async () => {
    const values = formRef?.current!.instance().option("formData");
    if (formRef.current!.instance().validate().isValid) {
      setLoadIndicatorVisible(true)
      const sharedUsers = filteredData.filter(val => val.permission !== 'View');
      let response;
      if (library_idx !== -1) {
        const metadata = { ...values.metadata, target: values.target };
        response = await editLibrary(
          {
            ...values,
            user_id: userData.id,
            project_id: projectData.id,
            organization_id: projectData.container.id,
            sharedUsers,
            metadata,
          });
        context?.addToState({ ...appContext, refreshAssayTable: true, refreshADME: true });
      } else {
        response = await createLibrary(
          {
            ...values,
            user_id: userData.id,
            project_id: projectData.id,
            organization_id: projectData.container.id,
            config: { ...projectData.config },
            sharedUsers,
          });
      }
      if (!response.error) {
        formRef?.current!.instance().reset();
        setCreatePopupVisibility(false);
        if (library_idx !== -1) {
          setLibraryId(values.id)
          fetchLibraries();
        }
        else {
          fetchLibraries(true)
        }
        const status = `${library_idx !== -1 ? 'updated' : 'created'}`;
        const message = Messages.libraryAddedUpdated(status);
        const toastId = toast.success(message);
        await delay(DELAY);
        context?.addToState({ ...appContext, refreshCart: true })
        toast.remove(toastId);
        setLoadIndicatorVisible(false);
      } else {
        const toastId = toast.error(`${response.error}`);
        await delay(DELAY);
        toast.remove(toastId);
        setLoadIndicatorVisible(false)
      }
    }
  };

  const cancelSave = () => {
    formRef?.current!.instance().reset();
    setCreatePopupVisibility(false);
  }

  const handleDeleteLibrary = (library_id: number, library_name: string) => {
    setConfirm(true);
    setDeleteLibraryData({ id: library_id, name: library_name });
  }
  const deleteLibraryDetail = async () => {
    setIsLoading(true);
    const result = await deleteLibrary(deleteLibraryData.id);
    if (result.length === 0) {
      toast.success(Messages.LIBRARY_NOT_DELETE_MESSAGE(entityLabel));
      setIsLoading(false);
      setCreatePopupVisibility(false);
    }
    else {
      if (result.error) {
        toast.error(Messages.DELETE_LIBRARY_ERROR_MESSAGE);
        setIsLoading(false);
      }
      else {
        toast.success(Messages.DELETE_LIBRARY_MESSAGE);
        setCreatePopupVisibility(false);
        fetchLibraries(true);
        setIsLoading(false);
      }
    }
  }
  const handleCancel = () => {
    setConfirm(false)
  };

  useEffect(() => {
    const libraryMolecules = projectData.other_container?.[library_idx]?.libraryMolecules;
    if (libraryMolecules) {
      setDeleteLibraryEnabled(isDeleteLibraryEnable(libraryMolecules))
    }
  }, [library_idx])
  const filterUsers = (filteredUsers: User[] = []) => {
    if (projectData) {
      const filteredUser = filteredUsers.filter(u => u.id !== projectData.owner_id &&
        !projectData.container_access_permission.some(item => item.user_id === u.id)
      );
      const updatedAllUsers = filteredUser.map(user => {
        const updatedUser =
          projectData.other_container?.[library_idx]?.container_access_permission?.find(u =>
            u.user_id === user.id);
        return {
          ...user, permission: updatedUser ?
            ContainerAccessPermissionType[updatedUser.access_type] :
            ContainerPermissionLabel.View
        };
      });

      setFilteredData(updatedAllUsers);
      const newFilter = { permission: '', search: '', filter: false, name: '' };
      setFilters(newFilter);
      setUsers(filteredUser);
    }
  }

  useEffect(() => {
    filterUsers(users);
  }, []);
  const handlePermissionChange = (user_id: number, permission: string) => {
    const data = [...filteredData];
    data[user_id].permission = permission;

    setFilteredData(data);
    setShowIcon({ name: 'arrow-both', permission: 'arrow-both' });
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
  const searchData = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  }
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
  return (
    <>
      <Form
        ref={formRef}
        showValidationSummary={true}
        formData={library_idx !== -1
          ? projectData.other_container?.[library_idx]
          : initialFormData
        }>
        {deleteLibraryEnabled
          && <ButtonItem cssClass="delete-button">
            <ButtonOptions
              stylingMode="text"
              text={`Delete Library`}
              onClick={() => handleDeleteLibrary(
                Number(projectData.other_container?.[library_idx]?.id),
                String(projectData.other_container?.[library_idx]?.name)
              )}
              elementAttr={{ class: 'lowercase-button' }} />
          </ButtonItem>
        }
        <SimpleItem
          dataField="organization"
          editorOptions={
            {
              placeholder: "Organization name",
              disabled: true,
              value: projectData?.container?.name
            }}
        >
          <Label text="Organization Name*" />
        </SimpleItem>

        <SimpleItem
          dataField="owner"
          editorOptions={
            {
              placeholder: "Library Owner",
              disabled: true, value: owner
            }
          }
        >
          <Label text="Library Owner*" />
        </SimpleItem>

        <SimpleItem
          dataField="projectName"
          editorOptions={{ placeholder: "New Project", value: projectData.name, disabled: true }}
        >
          <Label text="Project name*" />
        </SimpleItem>
        <SimpleItem
          dataField="name"
          editorOptions={{
            placeholder: `${(library_idx !== -1 ? 'Edit' : 'New')} Library`,
            value: library_idx !== -1 ?
              projectData.other_container?.[library_idx].name : ''
          }}
        >
          <Label text="Library name" />
          <RequiredRule message="Library name is required" />
        </SimpleItem>
        <SimpleItem
          dataField="target"
          editorOptions={{
            placeholder: "Target", value: library_idx !== -1 ?
              projectData.other_container?.[library_idx].metadata.target : ''
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
              onChange={searchData}
            />
          </div>
          <div className="flex gap-[8px] filter">
            <CheckBox
              elementAttr={{ 'aria-label': 'Hide view only' }}
              onValueChanged={onFilterChange}
            />
            <div>Hide view only</div>
          </div>
        </GroupItem>
        {filteredData?.length === 0 ? (
          <GroupItem caption=" " cssClass="groupItem group-data group-empty" colCount={2}>
            <div className="nodata-project">No data</div>
          </GroupItem>
        ) : (
          <GroupItem caption=" " cssClass="groupItem group-data" colCount={2}>
            <div style={{ width: '50%' }}>
              <div className="permission"
                onClick={() => sortUsers('name')}
              >
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
              <div className="permission"
                onClick={() => sortUsers('permission')}
              >
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
        <GroupItem
          cssClass="buttons-group"
          colCountByScreen={{ xs: 2, sm: 2, md: 2, lg: 2 }}
        >
          <ButtonItem >
            <ButtonOptions
              text={loadIndicatorVisible
                ? ''
                : library_idx !== -1 ? 'Update' : 'Create Library'}
              useSubmitBehavior={true}
              onClick={handleSubmit}
              elementAttr={{
                class: loadIndicatorVisible
                  ? `disableButton ${library_idx !== -1 ?
                    'w-[65px]'
                    : 'w-[108px]'} h-[37px]`
                  : 'btn-primary'
              }}
              disabled={isLoading}
              render={(btn) => (

                <>{loadIndicatorVisible && (
                  <LoadIndicator
                    width={20}
                    height={20}
                    visible={true}
                  />
                )}
                  <span>{btn.text}</span>
                </>
              )}
            />
          </ButtonItem>
          <ButtonItem >
            <ButtonOptions
              text="Cancel"
              onClick={cancelSave}
              elementAttr={{ class: "btn-secondary" }}
            />
          </ButtonItem>
        </GroupItem>
      </Form>
      {confirm && (
        <DeleteConfirmation
          onSave={() => deleteLibraryDetail()}
          openConfirmation={confirm}
          isLoader={isLoading}
          setConfirm={() => handleCancel()}
          msg={Messages.deleteLibraryMsg(deleteLibraryData.name, entityLabel)}
          title={Messages.DELETE_LIBRARY_TITLE}
        />
      )}
    </>
  );
}