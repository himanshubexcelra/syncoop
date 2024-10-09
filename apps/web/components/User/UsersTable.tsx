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
import RenderCreateUser from "./createUser";
import { UserTableProps } from "@/lib/definition";

export default function UsersTable({ data, organizationData, roles, roleType, }: UserTableProps) {

    const [editPopup, showEditPopup] = useState(false);
    const [editField, setEditField] = useState({});
    const [deletePopup, showDeletePopup] = useState(-1);
    const [deleteVal, setDelete] = useState({ delete: "" });
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [tableData, setTableData] = useState(data);
    const [password, setPassword] = useState('');
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

    const showEditPopupForm = (data: any) => {
        setEditField(data);
        showEditPopup(false);
    };

    const [popupPosition, setPopupPosition] = useState({} as any);

    useEffect(() => {
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
                <Column
                    dataField="email"
                    caption="Email Address"
                    width={350}
                />
                <Column
                    dataField="firstName"
                    caption="First Name"
                    width={130}
                    alignment="left"
                />
                <Column
                    dataField="lastName"
                    width={140}
                    caption="Last Name"
                />
                <Column
                    dataField="user_role"
                    caption="Roles"
                    cellRender={(data: any) => {
                        return <div className="flex gap-5">{data?.value?.map((item: any, index: number) => {
                            return (
                                <div key={index} className={`p-1.5 text-white ${styles.roles}`}>
                                    {item.role.name}
                                </div>
                            );
                        })}</div>;
                    }}
                />
                <Column
                    width={80}
                    cellRender={({ data }: any) => (
                        <div className="flex gap-0.5">
                            <Image
                                src="/icons/pen-edit-icon.svg"
                                width={24}
                                height={24}
                                onClick={() => showEditPopupForm(data)}
                                alt="Edit" />
                            <Image
                                src="/icons/refresh-icon.svg"
                                width={24}
                                height={24}
                                alt="Edit" />

                        </div>
                    )}
                    caption="Actions"
                />
                <GridToolbar>
                    <Item location="after">
                        <Btn
                            text="Add New User"
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
                            title="New User"
                            visible={createPopupVisible}
                            contentRender={() => (
                                <RenderCreateUser
                                    formRef={formRef}
                                    setCreatePopupVisibility={setCreatePopupVisibility}
                                    setTableData={setTableData}
                                    tableData={tableData}
                                    password={password}
                                    setPassword={setPassword}
                                    organizationData={organizationData}
                                    roles={roles}
                                    roleType={roleType}
                                />
                            )}
                            width={470}
                            hideOnOutsideClick={true}
                            height="100%"
                            position={popupPosition}
                            onHiding={() => {
                                setPassword('')
                                setCreatePopupVisibility(false);
                            }}
                            showCloseButton={true}
                            wrapperAttr={{ class: "create-popup mr-[15px]" }}
                        />
                        <MainPopup
                            showTitle={true}
                            visible={editPopup}
                            showCloseButton={true}
                            hideOnOutsideClick={true}
                            contentRender={() => (
                                <div>Edit</div>
                            )}
                            width={400}
                            height="100%"
                            position={popupPosition}
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
