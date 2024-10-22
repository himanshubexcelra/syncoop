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
import { Popup as MainPopup, } from "devextreme-react/popup";
import { Button as Btn } from "devextreme-react/button";
import "./table.css";
import styles from "./table.module.css";
import RenderCreateUser from "./createUser";
import { UserTableProps } from "@/lib/definition";
import { getUsers } from "./service";
import { User } from "@/lib/definition";
import { filterUsersByOrgId } from "@/utils/helpers";
import { LoadIndicator } from "devextreme-react";
import DialogPopUp from "@/ui/DialogPopUp";
import ResetPassword from "../Profile/ResetPassword";
import RenderEditUser from "./editUserDetails";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";

const resetDialogProperties = {
    width: 480,
    height: 260,
}
export default function UsersTable({ orgUser, roles, roleType, type, setInternalCount, setExternalCount }: UserTableProps) {
    const [editPopup, setEditPopup] = useState(false);
    const [editRow, setEditRow] = useState<User>();
    const [passwordPopupVisible, setPasswordPopupVisible] = useState(false);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [tableData, setTableData] = useState<User[]>([]);
    const [password, setPassword] = useState('');
    const [loader, setLoader] = useState(true);
    const grid = useRef<DataGridRef>(null);
    const formRef = useRef<any>(null);
    const formRefEdit = useRef<any>(null);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const context: any = useContext(AppContext);
    const appContext = context.state;

    const hidePasswordPopup = () => {
        setPasswordPopupVisible(false)
    };
    const showEditPopup = (data: any) => {
        setEditRow(data)
        setEditPopup(true)
    }
    const showPasswordPopup = (data: any) => {
        setEditRow(data)
        setPasswordPopupVisible(true)
    }
    const contentProps = {
        onClose: hidePasswordPopup,
        email: editRow?.email
    }
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
                    className="no-padding-header"
                >
                    <Paging defaultPageSize={5} defaultPageIndex={0} />
                    <Sorting mode="single" />
                    <Column
                        dataField="email"
                        caption="Email Address"
                        width={350}
                        cellRender={(data: any) => {
                            const userId = data?.data?.id;
                            return (
                                <a
                                    href={`/profile/${userId}`}
                                    className="text-themeBlueColor underline"
                                >
                                    {data.value}
                                </a>
                            );
                        }}
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
                            <div className="flex gap-2 cursor-pointer">
                                <Image
                                    src="/icons/pen-edit-icon.svg"
                                    width={24}
                                    height={24}
                                    onClick={() => showEditPopup(data)}
                                    alt="Edit" />
                                <Image
                                    src="/icons/lock-password-icon.svg"
                                    width={16}
                                    height={18}
                                    onClick={() => showPasswordPopup(data)}
                                    alt="Reset" />

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
                                    formRef.current?.instance().reset();
                                }}
                                showCloseButton={true}
                                wrapperAttr={{ class: "create-popup mr-[15px]" }}
                            />
                            <MainPopup
                                title="Edit User"
                                visible={editPopup}
                                showCloseButton={true}
                                hideOnOutsideClick={true}
                                contentRender={() => (
                                    <RenderEditUser tableData={editRow}
                                        formRef={formRefEdit}
                                        setCreatePopupVisibility={setEditPopup}
                                        roles={[]}
                                        roleType={roleType}
                                        type={type}
                                        fetchData={fetchAndFilterData}
                                        isMyProfile={false}
                                    />
                                )}
                                width={400}
                                height="100%"
                                position={popupPosition}
                                onHiding={() => {
                                    formRefEdit.current?.instance().reset();
                                    setEditPopup(false)
                                }}
                                wrapperAttr={{ class: "create-popup" }}
                            />
                            <DialogPopUp {...{
                                visible: passwordPopupVisible,
                                dialogProperties: resetDialogProperties,
                                Content: ResetPassword,
                                hidePopup: hidePasswordPopup,
                                contentProps
                            }} />
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
