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
import { Button as Btn } from "devextreme-react/button";
import "./table.css";
import styles from "./table.module.css";
import RenderCreateUser from "./createUser";
import { UserTableProps } from "@/lib/definition";
import { getUsers } from "./service";
import { User } from "@/lib/definition";
import { filterUsersByOrgId } from "@/utils/helpers";
import { LoadIndicator } from "devextreme-react";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";

export default function UsersTable({ orgUser, roles, roleType, type, setInternalCount, setExternalCount }: UserTableProps) {
    const [editPopup, showEditPopup] = useState(false);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [tableData, setTableData] = useState<User[]>([]);
    const [password, setPassword] = useState('');
    const [loader, setLoader] = useState(true);
    const grid = useRef<DataGridRef>(null);
    const formRef = useRef<PopupRef>(null);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const context: any = useContext(AppContext);
    const appContext = context.state;

    const fetchAndFilterData = async () => {
        setLoader(true);
        try {
            const usersList = await getUsers(['orgUser', 'user_role']);
            const { internalUsers, externalUsers } = filterUsersByOrgId(usersList, orgUser?.id);

            if (roleType === "admin") {
                type === "Internal" ? setTableData(internalUsers) : setTableData(externalUsers);
                setInternalCount(internalUsers.length);
                setExternalCount(externalUsers.length);
                context?.addToState({
                    ...appContext, userCount: {
                        externalUsers: externalUsers.length,
                        internalUsers: internalUsers.length
                    }
                })
            }
            else {
                setTableData(internalUsers);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoader(false);
        }
    };
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPopupPosition({
                my: 'top right',
                at: 'top right',
                of: window,
            });
        }
    }, []);
    useEffect(() => {
        fetchAndFilterData();
    }, [roleType, type, orgUser]);

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
                    {type === "External" && <Column
                        dataField="orgUser.name"
                        caption="Organization"
                        width={130}
                    />}
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
                                    onClick={() => console.log(`edit clicked ${data}`)}
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
                                        organizationData={[orgUser]}
                                        roles={roles}
                                        roleType={roleType}
                                        type={type}
                                        fetchAndFilterData={fetchAndFilterData}
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
                </DataGrid>}
        </>
    );
}
