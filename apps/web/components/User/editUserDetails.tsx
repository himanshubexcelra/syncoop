import {
    Form as CreateForm,
    SimpleItem,
    RequiredRule,
    Label,
} from "devextreme-react/form";
import styles from './createUser.module.css'
import { useEffect, useState } from "react";
import { Messages } from "@/utils/message";
import { editUser } from "./service";
import toast from "react-hot-toast";
import { delay } from "@/utils/helpers";
import { DELAY } from "@/utils/constants";
import { getOrganization } from "../Organization/service";
import { getLowPriorityRole } from "../Role/service";


export default function RenderEditUser({
    setCreatePopupVisibility,
    formRef,
    tableData,
    fetchData,
    type,
    roleType,
    isMyProfile,
}: any) {

    const [formData, setFormData] = useState(tableData);
    const [rolesSelect, setRolesSelect] = useState([])
    const [organizationSelect, setOrganizationSelect] = useState([])
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesDropdown = await getLowPriorityRole(1);
                setRolesSelect(rolesDropdown);
            } catch (error) {
                console.log(Messages.ROLE_FETCH_ERROR, error);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        const formValue = {
            firstName: tableData.firstName,
            lastName: tableData.lastName,
            email: tableData.email,
            organization: tableData.orgUser ? {
                id: tableData.orgUser.id,
                name: tableData.orgUser.name
            } : null,
            roles: tableData.user_role.map((userRole: any) => ({
                id: userRole.roleId,
                name: userRole.role.name
            }))
        };
        formRef.current?.instance().option('formData', formValue);
        setFormData(formValue);
    }, [tableData, formRef]);

    const handleSubmit = async () => {
        const values = formRef.current!.instance().option("formData");
        const validationCheck = formRef.current!.instance().validate().isValid
        if (validationCheck) {
            const response = await editUser(values);
            if (response.status === 200) {
                formRef.current!.instance().reset();
                setCreatePopupVisibility(false);
                await fetchData()
            } else {
                const toastId = toast.error(`${response.error}`);
                await delay(DELAY);
                toast.remove(toastId);
            }
        }
        else {
            formRef.current!.instance().validate()
        }
    };

    const handleCancel = () => {
        setCreatePopupVisibility(false);
    };

    return (
        <CreateForm ref={formRef} formData={formData}>
            <SimpleItem
                dataField={"organization"}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: organizationSelect.length > 0 ? organizationSelect : [tableData.orgUser],
                    placeholder: "Select Organization",
                    displayExpr: "name",
                    valueExpr: "id",
                    value: tableData.orgUser.id,
                    disabled: isMyProfile || roleType !== "admin" || type === "Internal",
                    onOpened: async () => {
                        if (organizationSelect.length === 0) {
                            const organizationDropdown = type ? await getOrganization({ type: type }) : await getOrganization({});
                            setOrganizationSelect(organizationDropdown);
                        }
                    },
                }}
            >
                <Label text="Organization" />
                <RequiredRule message={Messages.requiredMessage('Organisation')} />
            </SimpleItem>
            <SimpleItem
                dataField={"email"}
                editorOptions={{
                    placeholder: "User Email Address",
                    disabled: true,
                }}
            >
                <Label text="User Email Address" />
            </SimpleItem>
            <SimpleItem
                dataField={"firstName"}
                editorOptions={{ placeholder: "First Name" }}
            >
                <Label text="First Name" />
                <RequiredRule message={Messages.requiredMessage('First Name')} />
            </SimpleItem>
            <SimpleItem
                dataField={"lastName"}
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
                    disabled: isMyProfile || !["admin", "org_admin"].includes(roleType),
                    value: tableData.user_role?.map((item: any) => item.roleId),

                }}
            >
                <Label text="Roles" />
                <RequiredRule message={Messages.ROLE_REQUIRED} />
            </SimpleItem>
            <SimpleItem>
                <div className="flex justify-start gap-2 mt-5">
                    <button onClick={handleSubmit} className={styles.primaryButton}>
                        Update
                    </button >
                    <button onClick={handleCancel} className={styles.secondaryButton}>
                        Cancel
                    </button>
                </div>
            </SimpleItem>
        </CreateForm>
    );
}
