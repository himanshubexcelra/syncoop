"use client";
import { useRef, useState, useEffect } from "react";
import DataGrid, {
  Item,
  Column,
  SearchPanel,
  Toolbar as GridToolbar,
  DataGridRef,
  Paging,
  Sorting,
} from "devextreme-react/data-grid";
import Image from "next/image";
import { Popup } from "devextreme-react/popup";
import { Button as Btn } from "devextreme-react/button";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import "./table.css";
import './form.css';
import styles from "./table.module.css";
import { OrganizationDataFields, UserData, UserRole } from "@/lib/definition";
import RenderCreateOrganization from "./createOrganization";
import EditOrganization from "./editOrganization";
import { getOrganization } from "@/components/Organization/service";
import { formatDate } from "@/utils/helpers";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import { getFilteredRoles } from "../Role/service";

type ListOrganizationProps = {
  userData: UserData, actionsEnabled: string[]
}

export default function ListOrganization({ userData, actionsEnabled }: ListOrganizationProps) {
  const [editPopup, showEditPopup] = useState(false);
  const [editField, setEditField] = useState({ name: '', email: '' });
  const [createPopupVisible, setCreatePopupVisibility] = useState(false);
  const [tableData, setTableData] = useState<OrganizationDataFields[]>([]);
  const [loader, setLoader] = useState(true);
  const [orgAdminRole, setRole] = useState(-1);

  const { myRoles } = userData;
  const context: any = useContext(AppContext);
  const appContext = context.state;

  const fetchOrganizations = async () => {
    const organization = await getOrganization({ withRelation: ['orgUser', 'user_role'], withCount: ['projects'] });

    setTableData(organization);
    setLoader(false);
  }

  useEffect(() => {
    fetchOrganizations();
  }, [appContext?.userCount]);

  useEffect(() => {
    const fetchRoles = async () => {
      const roles = await getFilteredRoles();
      setRole(roles.filter((role: UserRole) => role.type === 'org_admin')[0].id)
    };

    fetchRoles();
  }, []);

  const grid = useRef<DataGridRef>(null);
  const formRef = useRef<any>(null);

  const renderTitleField = () => {
    return <p className={styles.edit_title}>{`Edit ${editField?.name}`}</p>;
  };

  const showEditPopupForm = (data: any) => {
    setEditField(data);
    showEditPopup(true);
  };

  const [popupPosition, setPopupPosition] = useState({} as any);

  useEffect(() => {
    fetchOrganizations();
    // This runs only in the browser
    if (typeof window !== 'undefined') {
      setPopupPosition({
        my: 'top right',
        at: 'top right',
        of: window,
      });
    }
  }, []);

  return (
    <>
      <LoadIndicator
        visible={loader}
      />
      {!loader &&
        <DataGrid
          dataSource={tableData}
          showBorders={true}
          ref={grid}
          elementAttr={{ cssClass: styles.table }}
          className="no-padding-header"
        >
          <Paging defaultPageSize={5} defaultPageIndex={0} />
          <Sorting mode="single" />
          <Column dataField="name" caption="Organization Name" />
          <Column
            dataField="_count.projects"
            width={90}
            alignment="center"
            caption="Projects"
            cellRender={({ data }: any) => (
              <span>{data._count?.projects}</span>
            )}
          />
          <Column
            dataField="molecules"
            width={90}
            alignment="center"
            cellRender={() => (
              <span>0</span>
            )}
          />
          <Column
            dataField="orgUser"
            caption="Users"
            width={70}
            alignment="center"
            cellRender={({ data }: any) => (
              <span>{data?.orgUser?.length}</span>
            )}
          />
          <Column dataField="status" alignment="center" caption="Organization Status" />
          <Column
            dataField="user.email"
            minWidth={350}
            caption="Organization Admin"
            cellRender={({ data }: any) => <span>{data.user.email}</span>}
          />
          <Column
            dataField="createdAt"
            caption="Creation Date"
            defaultSortIndex={0}
            defaultSortOrder="desc"
            cellRender={({ data }) => (
              <span>{formatDate(data.createdAt)}</span>
            )}
          />
          <Column
            dataField="updatedAt"
            caption="Last Modified Date"
            cellRender={({ data }) => (
              <span>{formatDate(data.updatedAt)}</span>
            )}
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
                      />
                    </>
                  )}
                  onClick={() => showEditPopupForm(data)}
                />
              )}
              caption="Actions"
            />
          )}
          <GridToolbar>
            <Item location="after">
              {myRoles?.includes('admin') && (
                <Btn
                  text="Create Organization"
                  icon="plus"
                  className={`${styles.button_primary_toolbar} mr-[20px]`}
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
                contentRender={() => (
                  <RenderCreateOrganization
                    formRef={formRef}
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    fetchOrganizations={fetchOrganizations}
                    roleId={orgAdminRole}
                    createdBy={userData.id}
                  />
                )}
                width={477}
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
                titleRender={renderTitleField}
                showTitle={true}
                visible={editPopup}
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
                    orgAdminRole={orgAdminRole}
                  />
                )}
                width={477}
                height="100%"
                position={popupPosition}
                onHiding={() => { formRef.current?.instance().reset(); showEditPopup(false) }}
                wrapperAttr={{ class: "create-popup" }}
              />
            </Item>
            <Item location="after">
              <Btn
                text="Filter"
                icon="filter"
                elementAttr={{ class: "btn_primary btn-toolbar" }}
                disabled={true}
                render={() => (
                  <>
                    <Image
                      src="/icons/filter.svg"
                      width={24}
                      height={24}
                      alt="Filter"
                    />
                    <span>Filter</span>
                  </>
                )}
              />
            </Item>
            <Item name="searchPanel" />
          </GridToolbar>
          <SearchPanel visible={true} highlightCaseSensitive={true} />
        </DataGrid>
      }
    </>
  );
}
