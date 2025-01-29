/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import { useRef, useState, useEffect } from "react";
import DataGrid, {
  Item,
  Column,
  Toolbar as GridToolbar,
  DataGridRef,
  HeaderFilter,
  Paging
} from "devextreme-react/data-grid";
import Image from "next/image";
import { Popup } from "devextreme-react/popup";
import { Button as Btn } from "devextreme-react/button";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {
  ActionStatus,
  ContainerType,
  OrganizationDataFields,
  OrganizationType,
  UserData,
} from "@/lib/definition";
import RenderCreateOrganization from "./createOrganization";
import EditOrganization from "./editOrganization";
import { deleteOrganization, getOrganization } from "@/components/Organization/service";
import {
  formatDate,
  isDeleteLibraryEnable,
} from "@/utils/helpers";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import { FormRef } from "devextreme-react/cjs/form";
import DeleteConfirmation from "@/ui/DeleteConfirmation";
import { Messages } from "@/utils/message";
import toast from "react-hot-toast";

type ListOrganizationProps = {
  userData: UserData, actionsEnabled: string[]
}

export default function ListOrganization({ userData, actionsEnabled }: ListOrganizationProps) {
  const [editPopup, showEditPopup] = useState(false);
  const [editField, setEditField] =
    useState<OrganizationDataFields>({} as OrganizationDataFields);
  const [createPopupVisible, setCreatePopupVisibility] = useState(false);
  const [tableData, setTableData] = useState<OrganizationDataFields[]>([]);
  const [loader, setLoader] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { myRoles } = userData;
  const context: any = useContext(AppContext);
  const appContext = context.state;

  const fetchOrganizations = async () => {
    const organization = await getOrganization(
      {
        withRelation: ['orgUser', 'user_role', 'projects', 'libraries'],
        withCount: ['projects', 'molecules'],
        type: OrganizationType.External
      });
    setTableData(organization);
    setLoader(false);
  }

  useEffect(() => {
    fetchOrganizations();
    if (typeof window !== 'undefined') {
      setPopupPosition({
        my: 'top right',
        at: 'top right',
        of: window,
      });
    }
  }, [appContext?.userCount]);

  const grid = useRef<DataGridRef>(null);
  const formRef = useRef<FormRef>(null);

  const showEditPopupForm = (data: any) => {
    setEditField(data);
    showEditPopup(true);
  };

  const [popupPosition, setPopupPosition] = useState({} as any);

  const statusHeaderFilter = [
    { value: ActionStatus.Enabled, text: 'Enabled' },
    { value: ActionStatus.Disabled, text: 'Disabled' },
  ]

  const handlePopupShown = () => {
    if (formRef.current) {
      formRef.current.instance().resetValues();
    }
  };
  const [currentSort, setCurrentSort] = useState<{
    field: string | null;
    order: 'asc' | 'desc' | null
  }>({ field: 'created_at', order: 'desc' });

  const handleSortChanged = (e: any) => {
    // Only handle sorting-related changes
    if (e.name !== 'columns' || !e.fullName?.includes('sortOrder')) return;
    const dataGrid = grid.current?.instance();
    if (!dataGrid) return;
    const sortedColInfo = e.component.getVisibleColumns()?.
      filter((column: any) => column.sortOrder)?.[0]
    const newField = sortedColInfo?.dataField;
    // Get current sorting state
    const currentField = currentSort.field;
    const previousOrder = e.previousValue;
    const newOrder = e.value;

    if (currentField === newField) {
      if (newOrder === 'desc' && previousOrder === 'asc') {
        // Second click - already handled by DevExtreme
        setCurrentSort({ field: newField, order: 'desc' });
      } else if (previousOrder === 'desc') {
        // Third click - clear sorting
        dataGrid.clearSorting();
        setCurrentSort({ field: null, order: null });
      }
    } else {
      // New column clicked - DevExtreme handles the ascending sort
      setCurrentSort({ field: newField, order: 'asc' });
    }
  };
  const handleDeleteOrganization = (data: OrganizationDataFields) => {
    setEditField(data);
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
      .filter((item: any) => item.type === ContainerType.PROJECT)
      .map((item: any) => Number(item.id));
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
      {loader ? <div className="center">
        <LoadIndicator
          visible={loader}
        />
      </div>
        : <DataGrid
          dataSource={tableData}
          showBorders={true}
          ref={grid}
          className="no-padding-header"
          sorting={{
            mode: 'single'
          }}
          height={'auto'}
          style={{ maxHeight: '400px' }}
          headerFilter={{
            visible: true
          }}
          searchPanel={{
            visible: true,
            highlightSearchText: true
          }}
          onOptionChanged={handleSortChanged}
        >

          <Paging defaultPageSize={5} defaultPageIndex={0} />
          <Column
            dataField="name"
            caption="Organization Name"
            allowHeaderFiltering={false}
            cellRender={(data: any) => {
              const orgId = data?.data?.id;
              return (
                <a
                  href={`/organization/${orgId}`}
                  className="text-themeBlueColor underline"
                >
                  {data?.value}
                </a>
              );
            }} />
          <Column
            dataField="_count.other_container"
            width={90}
            alignment="center"
            caption="Projects"
            cellRender={({ data }: any) => (
              <span>{data._count?.other_container}</span>
            )}
            allowHeaderFiltering={false}
          />
          <Column
            dataField="_count.organizationMolecules"
            width={90}
            alignment="center"
            caption="Molecules"
            cellRender={({ data }: any) => (
              <span>{data._count?.organizationMolecules}</span>
            )}
            allowHeaderFiltering={false}
          />
          <Column
            dataField="orgUser"
            caption="Users"
            width={70}
            alignment="center"
            cellRender={({ data }: any) => (
              <span>{data?.orgUser?.length}</span>
            )}
            allowHeaderFiltering={false}
          />
          <Column
            dataField="is_active"
            alignment="center"
            caption="Organization Status"
            calculateCellValue={({ is_active }) =>
              (is_active ? ActionStatus.Enabled : ActionStatus.Disabled)
            }
            cellRender={({ data }: any) => (
              <span>{
                data.is_active ? ActionStatus.Enabled : ActionStatus.Disabled
              }</span>
            )}
          >
            <HeaderFilter dataSource={statusHeaderFilter} />
          </Column>
          <Column
            dataField="owner.email_id"
            minWidth={350}
            caption="Organization Admin"
            cellRender={({ data }: any) => <span>{data.owner.email_id}</span>}
            allowHeaderFiltering={false}
          />
          <Column
            dataField="created_at"
            caption="Creation Date"
            defaultSortIndex={0}
            defaultSortOrder="desc"
            cellRender={({ data }) => (
              <span>{formatDate(data.created_at)}</span>
            )}
            allowHeaderFiltering={false}
          />
          <Column
            dataField="updated_at"
            caption="Last Modified Date"
            cellRender={({ data }) =>
            (
              <span>{data.updated_at
                &&
                formatDate(data.updated_at)}</span>
            )
            }
            allowHeaderFiltering={false}
          />
          {(actionsEnabled.includes('edit_own_org') || myRoles?.includes('admin')) && (
            <Column
              width={80}
              cellRender={({ data }: any) => (
                <Btn
                  visible={actionsEnabled.includes('edit_own_org') || myRoles?.includes('admin')}
                  render={() => (
                    <>
                      <Image
                        src="/icons/edit.svg"
                        width={24}
                        height={24}
                        alt="Edit Organization"
                        title="Edit organization"
                      />
                    </>
                  )}
                  onClick={() => showEditPopupForm(data)}
                />
              )}
              caption="Actions"
            />
          )}
          {(actionsEnabled.includes('edit_own_org') || myRoles?.includes('admin')) && (
            <Column
              width={80}
              cellRender={({ data }: any) => (
                <Btn
                  visible={validateDeleteProjectBtn(data)}
                  render={() => (
                    <>
                      <Image
                        src="/icons/delete-blue-sm.svg"
                        width={24}
                        height={24}
                        alt="Delete Organization"
                        title="Delete organization"
                      />
                    </>
                  )}
                  onClick={() => handleDeleteOrganization(data)}
                />
              )}
              caption="Delete"
            />
          )}
          <GridToolbar>
            <Item location="after">
              {myRoles?.includes('admin') && (
                <Btn
                  text="Create Organization"
                  icon="plus"
                  className={`button_primary_toolbar mr-[20px]`}
                  render={(buttonData: any) => (
                    <>
                      <Image
                        src="/icons/plus.svg"
                        width={24}
                        height={24}
                        alt="Create Organization"
                      />
                      <span>{buttonData.text}</span>
                    </>
                  )}
                  onClick={() => setCreatePopupVisibility(true)}
                />
              )}
              <Popup
                title="Create Organization"
                visible={createPopupVisible}
                dragEnabled={false}
                onShown={handlePopupShown}
                contentRender={() => (
                  <RenderCreateOrganization
                    formRef={formRef}
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    fetchOrganizations={fetchOrganizations}
                    created_by={userData.id}
                  />
                )}
                width={550}
                hideOnOutsideClick={true}
                height="100%"
                position={popupPosition}
                onHiding={() => {
                  formRef.current?.instance().reset();
                  setCreatePopupVisibility(false);
                }}
                showCloseButton={true}
                wrapperAttr={{ class: "create-popup mr-[15px]" }}
              />
              <Popup
                title={`Edit ${editField?.name}`}
                visible={editPopup}
                dragEnabled={false}
                showCloseButton={true}
                hideOnOutsideClick={true}
                contentRender={() => (
                  <EditOrganization
                    formRef={formRef}
                    organizationData={editField}
                    showEditPopup={showEditPopup}
                    fetchOrganizations={fetchOrganizations}
                    myRoles={myRoles}
                    loggedInUser={userData.id}
                    editPopup={editPopup}
                  />
                )}
                width={550}
                height="100%"
                position={popupPosition}
                onHiding={() => { formRef.current?.instance().reset(); showEditPopup(false) }}
                wrapperAttr={{ class: "create-popup" }}
              />
            </Item>
            <Item name="searchPanel" location="before" />
          </GridToolbar>
        </DataGrid>}
      {confirm && (
        <DeleteConfirmation
          onSave={() => deleteOrganizationData(editField)}
          openConfirmation={confirm}
          isLoader={isLoading}
          setConfirm={() => handleCancel()}
          msg={Messages.deleteOrgMsg(editField.name)}
          title={Messages.DELETE_ORGANIZATION_TITLE}
        />
      )}
    </>
  );
}
