/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import { useEffect, useRef, useState } from "react";
import DataGrid, {
    Item,
    Column,
    Toolbar as GridToolbar,
    DataGridRef,
    Paging,
    Scrolling,
    HeaderFilter,
    Sorting,
    GroupPanel,
    Grouping,
    SearchPanel
} from "devextreme-react/data-grid";
import Image from "next/image";
import { Popup as MainPopup, } from "devextreme-react/popup";
import { Button as Btn } from "devextreme-react/button";
import RenderCreateUser from "./createUser";
import { OrganizationType, UserData, UserTableProps } from "@/lib/definition";
import { getUsers, deleteUserData, getUserEnabled } from "./service";
import { User } from "@/lib/definition";
import { LoadIndicator } from "devextreme-react";
import DialogPopUp from "@/ui/DialogPopUp";
import ResetPassword from "../Profile/ResetPassword";
import RenderEditUser from "./editUserDetails";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import { isOnlyLibraryManger, isOrgAdmin } from "@/utils/helpers";
import DeleteConfirmation from "@/ui/DeleteConfirmation";
import { Messages } from "@/utils/message";
import toast from "react-hot-toast";


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
    const [loader, setLoader] = useState(true);
    const grid = useRef<DataGridRef>(null);
    const formRef = useRef<any>(null);
    const formRefEdit = useRef<any>(null);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const context: any = useContext(AppContext);
    const appContext = context.state.appContext;
    const [deletePopup, setDeletePopup] = useState(false)
    const [deleteUserId, setDeleteUserData] = useState({ user_id: 0, name: '', role_id: 0 });

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
        const fetchDetails = ['orgUser', 'user_role', 'projects']
        try {
            if (myRoles.includes("admin") && !customerOrgId) {
                const [internal, external] = await Promise.all([
                    getUsers(fetchDetails, OrganizationType.Internal, user_id),
                    getUsers(fetchDetails, OrganizationType.External, user_id)
                ])
                setInternalUsers(internal);
                setExternalUsers(external);
                setInternalCount(internal.length);
                setExternalCount(external.length);
                if (type === OrganizationType.Internal) {
                    const internalUsers = await insertEnableDelete(internal);
                    setTableData(internalUsers)
                } else {
                    const externalUsers = await insertEnableDelete(external);
                    setTableData(externalUsers);
                }
                context?.addToState({
                    appContext: {
                        ...appContext,
                        userCount: {
                            externalUsers: externalUsers.length,
                            internalUsers: internalUsers.length
                        },
                        refreshUsersTable: false,
                    }
                });
            }
            else {
                const users = await getUsers(fetchDetails, "", user_id, orgUser?.id);
                setTableData(users);
            }
        } catch (error) {
            console.log("Error fetching users:", error);
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

    const insertEnableDelete = async (internal: any[]) => {
        const internalUsers = await Promise.all(
            internal.map(async (item: any) => {
                const enableDelete = await isDeleteUserEnabled(item);
                return { ...item, enableDelete };
            })
        );
        return internalUsers;
    };

    const isDeleteUserEnabled = async (data: UserData) => {
        // Case for Org Admin and Library Manager
        if (isOrgAdmin(data?.user_role?.map((item: any) => item.role.type))
            || isOnlyLibraryManger(data?.user_role?.map((item: any) => item.role.type))) {
            return data._count.owner > 0 ? false : true;
        }
        else {
            const userEnabled = await getUserEnabled(String(data.id));
            return userEnabled.data.length > 0 ? false : true;
        }
    };

    const calculateFilterExpression = (filterValue: any) => {
        return [
            calculateCellValue,
            "contains",
            filterValue
        ];
    };

    const rowGroupName = () => {
        if (type === OrganizationType.External) {
            return "Organization";
        }
    }
    const handleCancel = () => {
        setDeletePopup(false)
    }
    const deleteUser = (data: UserData) => {
        setDeleteUserData(
            {
                user_id: data.id,
                name: data?.first_name,
                role_id: Number(data?.user_role?.[0]?.id)
            }
        )
        setDeletePopup(true)
    }


    const handleDelete = () => {
        setLoader(true);
        deleteUserData(deleteUserId.user_id, deleteUserId.role_id)
            .then((res) => {
                if (res.error) {
                    toast.error("Failed to delete user");
                    setLoader(false);
                }
                else {
                    toast.success(Messages.deleteUserMsg(deleteUserId.name));
                    setDeleteUserData({ user_id: 0, name: '', role_id: 0 })
                    setLoader(false);
                    fetchAndFilterData();
                }
            })
    }

    const [currentSort, setCurrentSort] = useState<{
        field: string | null;
        order: 'asc' | 'desc' | null
    }>({ field: 'first_name', order: 'asc' });

    const handleSortChanged = (e: any) => {
        // Only handle sorting-related changes
        if (e.name !== 'columns' || !e.fullName?.includes('sortOrder')) return;
        const dataGrid = grid.current?.instance();
        if (!dataGrid) return;
        const sortedColInfo = e.component.getVisibleColumns().
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
    const groupCellRender = (e: any) => <span>{e.value}</span>;

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
                    height={'auto'}
                    style={{ maxHeight: '400px' }}
                    onOptionChanged={handleSortChanged}>
                    <Paging enabled={false} />
                    <HeaderFilter visible={true}></HeaderFilter>
                    <Sorting mode="single"></Sorting>
                    <GroupPanel visible={type == OrganizationType.External}></GroupPanel>
                    <Grouping autoExpandAll={true}></Grouping>
                    <SearchPanel visible={true} highlightSearchText={true}></SearchPanel>
                    <Column
                        dataField="email_id"
                        caption="Email Address"
                        width={350}
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
                    />
                    <Column
                        dataField="last_name"
                        width={140}
                        caption="Last Name"
                    />
                    {type === OrganizationType.External && <Column
                        dataField="orgUser.name"
                        caption="Organization"
                        groupIndex={0}
                        groupCellRender={groupCellRender}
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
                                    title="Edit user"
                                    width={24}
                                    height={24}
                                    onClick={() => showEditPopup(data)}
                                    alt="Edit" />
                                <Image
                                    src="/icons/lock-password-icon.svg"
                                    width={16}
                                    title="Generate password"
                                    height={18}
                                    onClick={() => showPasswordPopup(data)}
                                    alt="Reset" />

                            </div>
                        )}
                        caption="Actions"
                    />}
                    {(actionsEnabled.includes('delete_user')) && <Column
                        width={60}
                        alignment="left"
                        allowHeaderFiltering={false}
                        cellRender={({ data }: any) => {
                            return (
                                data.enableDelete && <div className="flex gap-2 cursor-pointer">
                                    <Image
                                        src="/icons/delete-blue-sm.svg"
                                        title="Delete user"
                                        width={24}
                                        height={24}
                                        onClick={() => deleteUser(data)}
                                        alt="del" />
                                </div>
                            )
                        }}
                        caption="Delete"
                    />}
                    <GridToolbar>
                        {rowGroupName() &&
                            <Item location="before" name="groupPanel" />
                        }
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
                                        organizationData={[orgUser]}
                                        roles={filteredRoles}
                                        myRoles={myRoles}
                                        type={type}
                                        customerOrgId={customerOrgId}
                                        fetchAndFilterData={fetchAndFilterData}
                                    />
                                )}
                                width={470}
                                dragEnabled={false}
                                hideOnOutsideClick={false}
                                height="100%"
                                position={popupPosition}
                                onHiding={() => {
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
                                hideOnOutsideClick={false}
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
                                        allUsers={tableData}
                                    />
                                )}
                                width={470}
                                height="100%"
                                dragEnabled={false}
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
                            {deletePopup && (
                                <DeleteConfirmation
                                    onSave={() => handleDelete()}
                                    openConfirmation={deletePopup}
                                    setConfirm={() => handleCancel()}
                                    msg={"Delete"}
                                    title={"Delete User"}
                                    isLoader={false}
                                />
                            )}
                        </Item>
                        <Item
                            name="searchPanel"
                            location={type === OrganizationType.External ? 'after' : 'before'} />
                    </GridToolbar>
                    <Scrolling
                        rowRenderingMode='virtual'
                        columnRenderingMode='virtual'>
                    </Scrolling>
                </DataGrid>}
        </>
    );
}
