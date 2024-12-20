/*eslint max-len: ["error", { "code": 100 }]*/
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
  HeaderFilter
} from "devextreme-react/data-grid";
import Image from "next/image";
import { Popup } from "devextreme-react/popup";
import { Button as Btn } from "devextreme-react/button";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { OrganizationDataFields, OrganizationType, UserData, UserRole } from "@/lib/definition";
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
  const [editField, setEditField] = useState({ name: '', email_id: '' });
  const [createPopupVisible, setCreatePopupVisibility] = useState(false);
  const [tableData, setTableData] = useState<OrganizationDataFields[]>([]);
  const [loader, setLoader] = useState(true);
  const [orgAdminRole, setRole] = useState(-1);

  const { myRoles } = userData;
  const context: any = useContext(AppContext);
  const appContext = context.state;

  const fetchOrganizations = async () => {
    let organization = await getOrganization(
      {
        withRelation: ['orgUser', 'user_role'],
        withCount: ['projects']
      });
    organization = organization.filter
      ((organization: OrganizationDataFields) => organization.type !== OrganizationType.Internal);
    setTableData(organization);
    setLoader(false);
  }

  const fetchRoles = async () => {
    const roles = await getFilteredRoles();
    const role = roles.find(
      (role: UserRole) => role.type === 'org_admin');
    if (role) {
      setRole(role.id)
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [appContext?.userCount]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const grid = useRef<DataGridRef>(null);
  const formRef = useRef<any>(null);

  const renderTitleField = () => {
    return <p className='form-title'>{`Edit ${editField?.name}`}</p>;
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

  const statusHeaderFilter = [
    { value: 'Enabled', text: 'Enabled' },
    { value: 'Disabled', text: 'Disabled' },
  ]

  const handlePopupShown = () => {
    if (formRef.current) {
      formRef.current.instance().resetValues();
    }
  };

  return (
    <>
      {loader && <div className="center">
        <LoadIndicator
          visible={loader}
        />
      </div>}
      <DataGrid
        dataSource={tableData}
        showBorders={true}
        ref={grid}
        className="no-padding-header"
      >
        <Paging defaultPageSize={5} defaultPageIndex={0} />
        <Sorting mode="single" />
        <HeaderFilter visible={true} />
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
          dataField="_count.projects"
          width={90}
          alignment="center"
          caption="Projects"
          cellRender={({ data }: any) => (
            <span>{data._count?.projects}</span>
          )}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="molecules"
          width={90}
          alignment="center"
          cellRender={() => (
            <span>0</span>
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
          dataField="status"
          alignment="center"
          caption="Organization Status"
        >
          <HeaderFilter dataSource={statusHeaderFilter} />
        </Column>
        <Column
          dataField="user.email_id"
          minWidth={350}
          caption="Organization Admin"
          cellRender={({ data }: any) => <span>{data.user.email_id}</span>}
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
          cellRender={({ data }) => (
            <span>{formatDate(data.updated_at)}</span>
          )}
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
              onShown={handlePopupShown}
              contentRender={() => (
                <RenderCreateOrganization
                  formRef={formRef}
                  setCreatePopupVisibility={setCreatePopupVisibility}
                  fetchOrganizations={fetchOrganizations}
                  role_id={orgAdminRole}
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
          <Item name="searchPanel" location="before" />
        </GridToolbar>
        <SearchPanel visible={true} highlightSearchText={true} />
      </DataGrid>
    </>
  );
}
