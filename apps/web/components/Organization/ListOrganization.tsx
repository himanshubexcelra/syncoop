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
import { OrganizationDataFields, UserData, UserRoleType } from "@/lib/definition";
import RenderCreateOrganization from "./createOrganization";
import EditOrganization from "./editOrganization";
import { getOrganization } from "@/components/Organization/service";
import { formatDate } from "@/utils/helpers";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";

export default function ListOrganization({ userData }: { userData: UserData }) {
  const [editPopup, showEditPopup] = useState(false);
  const [editField, setEditField] = useState({ name: '', email: '' });
  const [createPopupVisible, setCreatePopupVisibility] = useState(false);
  const [tableData, setTableData] = useState<OrganizationDataFields[]>([]);
  const [loader, setLoader] = useState(true);

  const { role } = userData.user_role[0] as UserRoleType;
  const { type: roleType, id: roleId } = role;
  const context: any = useContext(AppContext);
  const appContext = context.state;

  const fetchOrganizations = async () => {
    const organization = await getOrganization(['orgUser', 'user_role']);
    setTableData(organization);
    setLoader(false);
  }

  useEffect(() => {
    fetchOrganizations();
  }, [appContext?.userCount]);

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
        >
          <Paging defaultPageSize={5} defaultPageIndex={0} />
          <Sorting mode="single" />
          <Column dataField="name" caption="Organization Name" />
          <Column
            dataField="projects"
            width={90}
            alignment="center"
            cellRender={({ data }: any) => (
              <span>{data.projects?.length}</span>
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
              <span>{data.orgUser?.length}</span>
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
          {roleType !== 'library_manager' && (
            <Column
              width={80}
              cellRender={({ data }: any) => (
                <Btn
                  render={() => (
                    <>
                      <Image
                        src="/icons/edit.svg"
                        width={24}
                        height={24}
                        alt="Create"
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
              {roleType === 'admin' && (
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
                        alt="Create"
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
                    role={roleId}
                  />
                )}
                width={400}
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
                  />
                )}
                width={400}
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
