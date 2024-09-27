"use client";
import { useEffect, useRef, useState } from "react";
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
import { Popup as MainPopup, PopupRef } from "devextreme-react/popup";
import { Form as DeleteForm, SimpleItem } from "devextreme-react/form";
import { Button as Btn } from "devextreme-react/button";
import "./table.css";
import styles from "./table.module.css";
import { OrganizationTableProps } from "@/lib/definition";
import RenderCreateOrganization from "./createOrganization";
import EditOrganization from "./editOrganization";
import { formatDate } from "@/utils/dateFormat";

export default function Table({ data }: OrganizationTableProps) {
  const [editPopup, showEditPopup] = useState(false);
  const [editField, setEditField] = useState({});
  const [deletePopup, showDeletePopup] = useState(-1);
  const [deleteVal, setDelete] = useState({ delete: "" });
  const [createPopupVisible, setCreatePopupVisibility] = useState(false);
  const [tableData, setTableData] = useState(data);

  const formFieldDataChanged = (e: any) => {
    setDelete({ delete: e.value });
  };

  const renderContent = () => {
    return (
      <>
        <div className="title">{`Are you sure, you want to delete ${(editField as any).name}?`}</div>
        <p>Type ‘delete’ in the field below</p>
        <DeleteForm onFieldDataChanged={formFieldDataChanged}>
          <SimpleItem
            dataField="."
            editorOptions={{
              placeholder: "delete",
              class: "delete-input",
            }}
          />
        </DeleteForm>
        <Btn
          text="Delete"
          elementAttr={{ class: "btn_primary" }}
          disabled={deleteVal.delete !== "delete"}
        />
        <Btn
          text="Cancel"
          onClick={() => showDeletePopup(-1)}
          elementAttr={{ class: "btn_secondary" }}
        />
      </>
    );
  };

  const grid = useRef<DataGridRef>(null);
  const deleteRef = useRef<PopupRef>(null);
  const formRef = useRef<PopupRef>(null);

  const renderTitleField = () => {
    return <p className={styles.edit_title}>{`Edit ${editField?.name}`}</p>;
  };

  const showEditPopupForm = (data: any) => {
    setEditField(data);
    showEditPopup(true);
  };

  const [popupPosition, setPopupPosition] = useState({} as any);

  useEffect(() => {
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
          cellRender={() => (
            <span>0</span>
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
          dataField="users"
          width={70}
          alignment="center"
          cellRender={() => (
            <span>0</span>
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
        <Column
          width={80}
          cellRender={({ data }: any) => (
            <Btn
              disabled={true}
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
        <GridToolbar>
          <Item location="after">
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
            <MainPopup
              title="Create Organization"
              visible={createPopupVisible}
              contentRender={() => (
                <RenderCreateOrganization
                  formRef={formRef}
                  setCreatePopupVisibility={setCreatePopupVisibility}
                  setTableData={setTableData}
                  tableData={tableData}
                />
              )}
              width={400}
              hideOnOutsideClick={true}
              height="100%"
              position={{ my: "top right", at: "top right", of: window }}
              onHiding={() => {
                formRef.current?.instance().reset();
                setCreatePopupVisibility(false);
              }}
              showCloseButton={true}
              wrapperAttr={{ class: "create-popup mr-[15px]" }}
            />
            <MainPopup
              titleRender={renderTitleField}
              showTitle={true}
              visible={editPopup}
              showCloseButton={true}
              hideOnOutsideClick={true}
              contentRender={() => (
                <EditOrganization
                  data={editField}
                  showEditPopup={showEditPopup}
                  showDeletePopup={showDeletePopup}
                />
              )}
              width={400}
              height="100%"
              position={{ my: "top right", at: "top right", of: window }}
              onHiding={() => showEditPopup(false)}
              wrapperAttr={{ class: "create-popup" }}
            />
          </Item>
          <Item location="after">
            <Btn
              text="Filter"
              icon="filter"
              elementAttr={{ class: "btn_primary btn-toolbar btn-filter" }}
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
      <MainPopup
        // title="Are you sure, you want to delete Fauxbio?"
        wrapperAttr={{ class: "delete-popup" }}
        visible={deletePopup !== -1}
        ref={deleteRef}
        width="577px"
        height="236px"
        showCloseButton={true}
        onHiding={() => showDeletePopup(-1)}
        contentRender={renderContent}
        position={popupPosition}
      />
    </>
  );
}
