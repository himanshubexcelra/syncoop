/*eslint max-len: ["error", { "code": 100 }]*/
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
    HeaderFilter
} from "devextreme-react/data-grid";
import Image from "next/image";
import { Popup as MainPopup, } from "devextreme-react/popup";
import { Button as Btn } from "devextreme-react/button";
import RenderCreateUser from "./createUser";
import { OrganizationType, UserTableProps } from "@/lib/definition";
import { getUsers } from "./service";
import { User } from "@/lib/definition";
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
const getRoleOptions = (tableData: User[]) => {
    const uniqueRoles = new Set<string>();
    tableData.forEach(user => {
        user.user_role?.forEach(roleItem => {
            if (roleItem.role?.name) {
                uniqueRoles.add(roleItem.role.name);
            }
        });
    });
    return Array.from(uniqueRoles).map(role => ({ text: role, value: role }));
};

export default function UsersTable({
    orgUser,
    filteredRoles,
    myRoles,
    type,
    setInternalCount,
    setExternalCount,
    user_id,
    actionsEnabled,
    customerOrgId,
}: UserTableProps) {
    const [editPopup, setEditPopup] = useState(false);
    const [internalUsers, setInternalUsers] = useState<User[]>([]);
    const [externalUsers, setExternalUsers] = useState<User[]>([]);
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
        email_id: editRow?.email_id
    }
    const fetchAndFilterData = async () => {
        setLoader(true);
        try {
            if (myRoles.includes("admin") && !customerOrgId) {
                const [internal, external] = await Promise.all([
                    getUsers(['orgUser', 'user_role'], OrganizationType.Internal, user_id),
                    getUsers(['orgUser', 'user_role'], OrganizationType.External, user_id)
                ])
                setInternalUsers(internal);
                setExternalUsers(external);
                setInternalCount(internal.length);
                setExternalCount(external.length);
                if (type === OrganizationType.Internal) {
                    setTableData(internal)
                } else {
                    setTableData(external);
                }
                context?.addToState({
                    ...appContext, userCount: {
                        externalUsers: externalUsers.length,
                        internalUsers: internalUsers.length
                    },
                    refreshUsersTable: false,
                })
            }
            else {
                const users = await getUsers(['orgUser', 'user_role'], "", user_id, orgUser?.id);
                setTableData(users);
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
    }, [myRoles, type, orgUser, appContext?.refreshUsersTable]);

    const calculateCellValue = (data: any) => {
        return data?.user_role?.map((item: any) => item.role?.name).join(', ') || '';
    };


    const calculateFilterExpression = (filterValue: any) => {
        return [
            calculateCellValue,
            "contains",
            filterValue
        ];
    };
    return (
        <>
            {loader ? (
                <div className="center">
                    <LoadIndicator
                        visible={loader}
                    />
                </div>
            ) :
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
                        dataField="email_id"
                        caption="Email Address"
                        width={350}
                        allowHeaderFiltering={false}
                        cellRender={(data: any) => {
                            const user_id = data?.data?.id;
                            return (
                                <a
                                    href={`/profile/${user_id}`}
                                    className="text-themeBlueColor underline"
                                >
                                    {data.value}
                                </a>
                            );
                        }}
                    />
                    <Column
                        dataField="first_name"
                        caption="First Name"
                        width={130}
                        alignment="left"
                        defaultSortIndex={0}
                        defaultSortOrder="asc"
                        allowHeaderFiltering={false}
                    />
                    <Column
                        dataField="last_name"
                        width={140}
                        caption="Last Name"
                        allowHeaderFiltering={false}
                    />
                    {type === OrganizationType.External && <Column
                        allowHeaderFiltering={false}
                        dataField="orgUser.name"
                        caption="Organization"
                        width={130}
                    />}
                    <Column
                        dataField="user_role"
                        calculateFilterExpression={calculateFilterExpression}

                        caption="Roles"
                        headerFilter={{
                            dataSource: getRoleOptions(tableData)
                        }}
                        calculateCellValue={calculateCellValue}
                        cellRender={(data: any) => {
                            return <div className="flex gap-5">
                                {data?.data?.user_role?.map((item: any, index: number) => {
                                    return (
                                        <div
                                            key={index}
                                            className={`p-1.5 text-white roles`}
                                        >
                                            {item.role.name}
                                        </div>
                                    );
                                })}
                            </div>;
                        }}
                    />
                    {(actionsEnabled.includes('edit_user') || myRoles.includes('admin')) && <Column
                        width={80}
                        allowHeaderFiltering={false}
                        cellRender={({ data }: any) => (
                            <div className="flex gap-2 cursor-pointer">
                                <Image
                                    src="/icons/edit.svg"
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
                    />}
                    <GridToolbar>
                        <Item location="after">
                            <Btn
                                text="Add New User"
                                icon="plus"
                                className={`button_primary_toolbar mr-[20px]`}
                                visible={actionsEnabled.includes('create_user') ||
                                    myRoles.includes('admin')}
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
                                        password_hash={password}
                                        setPassword={setPassword}
                                        organizationData={[orgUser]}
                                        roles={filteredRoles}
                                        myRoles={myRoles}
                                        type={type}
                                        customerOrgId={customerOrgId}
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
                                        myRoles={myRoles}
                                        type={type}
                                        fetchData={fetchAndFilterData}
                                        isMyProfile={false}
                                        customerOrgId={customerOrgId}
                                    />
                                )}
                                width={470}
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
                        <Item name="searchPanel" location="before" />
                    </GridToolbar>
                    <SearchPanel visible={true} highlightSearchText={true} />
                </DataGrid>}
        </>
    );
}
