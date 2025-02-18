/*eslint max-len: ["error", { "code": 100 }]*/
import {
    Form as CreateForm,
    SimpleItem,
    RequiredRule,
    Label,
    GroupItem,
    ButtonItem,
    ButtonOptions,
} from "devextreme-react/form";
import { useEffect, useState, useCallback } from "react";
import { Messages } from "@/utils/message";
import { editUser, getUsers, deleteUserData, getUserEnabled } from "./service";
import toast from "react-hot-toast";
import { delay, isOnlyLibraryManger, isOrgAdmin } from "@/utils/helpers";
import { DELAY, status } from "@/utils/constants";
import { getOrganization } from "../Organization/service";
import { getFilteredRoles } from "../Role/service";
import { Button, RadioGroup } from "devextreme-react";
import { ActionStatus, OrganizationType, UserData } from "@/lib/definition";
import DeleteConfirmation from "@/ui/DeleteConfirmation";

export default function RenderEditUser({
    setCreatePopupVisibility,
    formRef,
    tableData,
    fetchData,
    type,
    myRoles,
    isMyProfile,
    customerOrgId,
    allUsers
}: any) {
    const [formData, setFormData] = useState(tableData);
    const [rolesSelect, setRolesSelect] = useState([]);
    const [organizationSelect, setOrganizationSelect] = useState([]);
    const [contactDropdownData, setContactDropdownData] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState(tableData.orgUser?.id);
    const [deletePopup, setDeletePopup] = useState(false)
    const [deleteUserId, setDeleteUserData] = useState({ user_id: 0, name: '', role_id: 0 });

    const isOnlyLibManager = isOnlyLibraryManger(
        tableData?.user_role?.map((item: any) => item.role.type));


    const filterContact = useCallback((users: any) => {
        return users?.filter((user: any) =>
            user.is_active === true &&
            user.id !== tableData?.id &&
            user.orgUser.id === selectedOrgId &&
            user.user_role.some((role: any) => role.role.name === "Library Manager")
        );
    }, [tableData?.id, selectedOrgId]);

    useEffect(() => {
        const fetchDropdown = async () => {
            try {
                const rolesDropdown = await getFilteredRoles();
                const organizationDropdown = type ?
                    await getOrganization({ type: type }) :
                    await getOrganization({});
                setOrganizationSelect(organizationDropdown);
                setRolesSelect(rolesDropdown);
            } catch (error) {
                console.log(Messages.FETCH_ERROR, error);
            }
        };
        fetchDropdown();
    }, [type]);

    useEffect(() => {
        const formValue = {
            first_name: tableData.first_name,
            last_name: tableData.last_name,
            email_id: tableData.email_id,
            organization: tableData.orgUser?.id,
            roles: tableData.user_role.map((userRole: any) => ({
                id: userRole.role_id,
                name: userRole.role.name
            })),
            primary_contact_id: tableData.primary_contact_id,
            is_active: tableData.is_active,
        };
        setFormData(formValue);
        setSelectedOrgId(tableData.orgUser?.id);
    }, [tableData]);

    useEffect(() => {
        const fetchContacts = async () => {
            if (!allUsers && selectedOrgId) {
                const details = ['orgUser', 'user_role'];
                try {
                    const contactDropdown = await getUsers(details, '', undefined, selectedOrgId);
                    const filteredContacts = filterContact(contactDropdown);
                    setContactDropdownData(filteredContacts);
                } catch (error) {
                    console.log(Messages.FETCH_ERROR, error);
                }
            }
        };

        fetchContacts();
    }, [selectedOrgId, allUsers, filterContact]);

    useEffect(()=>{
        const insertEnableDelete = async (data: UserData[]) => {
            const internalUsers = await Promise.all(
                data.map(async (item: any) => {
                    const enableDelete = await isDeleteUserEnabled(item);
                    return { ...item, enableDelete };
                })
            );
            return internalUsers;
        };
        if(tableData.length > 0){
            insertEnableDelete(tableData);
        }
    },[tableData])

    const handleSubmit = async () => {
        const values = formRef.current!.instance().option("formData");
        const validationCheck = formRef.current!.instance().validate().isValid;

        if (validationCheck) {
            const response = await editUser(values);
            if (response.status === 200) {
                formRef.current!.instance().reset();
                setCreatePopupVisibility(false);
                await fetchData();
                const toastId = toast.success(Messages.UPDATE_USER);
                await delay(DELAY);
                toast.remove(toastId);
            } else {
                const toastId = toast.error(`${response.error}`);
                await delay(DELAY);
                toast.remove(toastId);
            }
        } else {
            formRef.current!.instance().validate();
        }
    };

    const handleCancel = () => {
        setCreatePopupVisibility(false);
    };

    const handleValueChange = (value: string) => {
        setFormData((prevData: any) => ({
            ...prevData,
            is_active: value === ActionStatus.Enabled,
        }));
    };

    const handleOrganizationChange = (e: any) => {
        const newOrgId = e.value;
        setSelectedOrgId(newOrgId);
        setFormData((prev: any) => ({
            ...prev,
            organization: newOrgId,
            primary_contact_id: null
        }));
    };
    const handleDeletePopup = () => {
        setDeletePopup(false)
    }
    const deleteUser = (tableData: UserData) => {
        setDeleteUserData(
            {
                user_id: tableData?.id,
                name: tableData?.first_name,
                role_id: Number(tableData?.user_role?.[0]?.id)
            }
        )
        setDeletePopup(true)
    }

    const handleDelete = () => {
        deleteUserData(deleteUserId.user_id, deleteUserId.role_id)
            .then((res) => {
                if (res.error) {
                    toast.error("Failed to delete user");
                }
                else {
                    toast.success(Messages.deleteUserMsg(deleteUserId.name));
                    setDeleteUserData({ user_id: 0, name: '', role_id: 0 })
                    setCreatePopupVisibility(false);
                    fetchData();
                }
            })
    }
    
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
    console.log(tableData,'tableData');
    
    return (
        <>
            {deletePopup && (
                <DeleteConfirmation
                    onSave={() => handleDelete()}
                    openConfirmation={deletePopup}
                    setConfirm={() => handleDeletePopup()}
                    msg={"Delete"}
                    title={"Delete User"}
                    isLoader={false}
                />
            )}
            <CreateForm ref={formRef} formData={formData}>
                <SimpleItem
                    dataField={"organization"}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: organizationSelect.length > 0 ?
                            organizationSelect :
                            [tableData.orgUser],
                        placeholder: "Select Organization",
                        displayExpr: "name",
                        valueExpr: "id",
                        value: selectedOrgId,
                        disabled: isMyProfile || customerOrgId || !myRoles.includes('admin') ||
                            type === OrganizationType.Internal,
                        onValueChanged: handleOrganizationChange
                    }}
                >
                    <Label text="Organization" />
                    <RequiredRule message={Messages.requiredMessage('Organization')} />
                </SimpleItem>
                <SimpleItem
                    dataField={"email_id"}
                    editorOptions={{
                        placeholder: "User Email Address",
                        disabled: true,
                    }}
                >
                    <Label text="User Email Address" />
                </SimpleItem>
                {!isMyProfile
                    && <GroupItem colCount={2} cssClass="delete-button-group">
                        <SimpleItem dataField="status">
                            <RadioGroup
                                items={status}
                                className="radio-flex"
                                defaultValue={formData.is_active ?
                                    ActionStatus.Enabled
                                    : ActionStatus.Disabled}
                                onValueChange={handleValueChange} />
                        </SimpleItem>
                        {tableData.enableDelete && <ButtonItem cssClass="delete-button">
                            <ButtonOptions
                                stylingMode="text"
                                text={`Delete User`}
                                onClick={() => deleteUser(tableData)}
                                elementAttr={{ class: 'lowercase' }} />
                        </ButtonItem>}
                    </GroupItem>}
                {!isMyProfile && !formData.is_active && isOnlyLibManager && <SimpleItem
                    dataField="primary_contact_id"
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: allUsers ? filterContact(allUsers) : contactDropdownData,
                        displayExpr: (item: any) => {
                            if (!item) return "Select Primary Contact";
                            return `${item?.first_name} ${item?.last_name || ''}`
                        },
                        placeholder: "Primary Contact",
                        valueExpr: "id",
                        value: formData.primary_contact_id,
                        onValueChanged: (e: any) => {
                            setFormData((prev: any) => ({
                                ...prev,
                                primary_contact_id: e.value
                            }));
                        }
                    }}
                >
                    <Label text="Primary Contact" />
                    <RequiredRule message={Messages.requiredMessage('Primary Contact')} />
                </SimpleItem>}
                <SimpleItem
                    dataField={"first_name"}
                    editorOptions={{ placeholder: "First Name" }}
                >
                    <Label text="First Name" />
                    <RequiredRule message={Messages.requiredMessage('First Name')} />
                </SimpleItem>
                <SimpleItem
                    dataField={"last_name"}
                    editorOptions={{ placeholder: "Last Name" }}
                >
                    <Label text="Last Name" />
                    <RequiredRule message={Messages.requiredMessage('Last Name')} />
                </SimpleItem>
                <SimpleItem
                    dataField={"roles"}
                    editorType="dxTagBox"
                    cssClass="custom-tag"
                    editorOptions={{
                        placeholder: "Select Roles",
                        dataSource: rolesSelect,
                        displayExpr: "name",
                        valueExpr: "id",
                        showSelectionControls: true,
                        applyValueMode: "useButtons",
                        maxDisplayedTags: 5,
                        disabled: isMyProfile ||
                            !myRoles.some(
                                (roleType: string) => ["admin", "org_admin"].includes(roleType)),
                        value: tableData.user_role?.map((item: any) => item.role_id),
                    }}
                >
                    <Label text="Roles" />
                    <RequiredRule message={Messages.ROLE_REQUIRED} />
                </SimpleItem>
                <SimpleItem>
                    <div className="flex justify-start gap-2 mt-5 ">
                        <Button
                            text="Update"
                            onClick={handleSubmit}
                            useSubmitBehavior={true}
                            hoverStateEnabled={false}
                            elementAttr={{ class: "btn-primary" }}
                        />
                        <Button
                            text="Cancel"
                            onClick={handleCancel}
                            elementAttr={{ class: "btn-secondary" }}
                        />
                    </div>
                </SimpleItem>
            </CreateForm>
        </>
    );
}