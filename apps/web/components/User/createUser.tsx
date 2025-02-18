/*eslint max-len: ["error", { "code": 100 }]*/
import toast from "react-hot-toast";
import {
    Form as CreateForm,
    SimpleItem,
    RequiredRule,
    EmailRule,
    Label,
    GroupItem,
    Item,
    ButtonItem,
    ButtonOptions,
} from "devextreme-react/form";
import { delay, generatePassword } from "@/utils/helpers";
import { createUser } from "./service";
import { Button, Tooltip } from "devextreme-react";
import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import PasswordCriteria from "../Tooltips/PasswordCriteria";
import { LoginFormSchema, OrganizationType } from "@/lib/definition";
import { DELAY } from "@/utils/constants";
import { getOrganization } from "../Organization/service";
import { Messages } from "@/utils/message";

const customPasswordCheck = (password: any) =>
    LoginFormSchema.shape.password_hash.safeParse(password).success

export default function RenderCreateUser({
    setCreatePopupVisibility,
    setTableData,
    formRef,
    tableData,
    roles,
    organizationData,
    myRoles,
    type,
    fetchAndFilterData,
    customerOrgId
}: any) {
    const [organization, setOrganization] = useState(organizationData);
    const [password_hash, setPassword] = useState('');
    const handleSubmit = async () => {
        const values = formRef.current!.instance().option("formData");
        const validationCheck = customPasswordCheck(values.password_hash) &&
            formRef.current!.instance().validate().isValid
        if (validationCheck) {
            const response = await createUser(values);
            if (response.status === 200) {
                const tempData = [...tableData, response.data];
                formRef.current!.instance().reset();
                setPassword('');
                setTableData(tempData);
                setCreatePopupVisibility(false);
                fetchAndFilterData()
                const toastId = toast.success(Messages.ADD_USER);
                await delay(DELAY);
                toast.remove(toastId);
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
    let copyPassword = password_hash
    const handleGeneratePassword = () => {
        const generatedPassword = generatePassword();
        setPassword(generatedPassword);
        navigator.clipboard.writeText(generatedPassword)
            .then(() => toast.success(Messages.PASSWORD_COPY))
            .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
        formRef.current!.instance().updateData("password_hash", generatedPassword);
    };

    const handleCopyPassword = async () => {
        if (copyPassword === "") {
            const toastId = toast.error(Messages.PASSWORD_EMPTY)
            await delay(DELAY);
            toast.remove(toastId);
            return;
        }
        navigator.clipboard.writeText(copyPassword)
            .then(() => toast.success(Messages.PASSWORD_COPY))
            .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
    };
    const handleCancel = () => {
        setPassword('');
        formRef.current!.instance().reset();
        setCreatePopupVisibility(false)
    }

    const OrganizationSelectBox = useMemo(() => (
        <SimpleItem
            dataField="organization"
            editorType="dxSelectBox"
            editorOptions={{
                items: organization,
                displayExpr: "name",
                valueExpr: "id",
                searchEnabled: true,
                value: myRoles.includes('admin')
                    ? (type === OrganizationType.External && !customerOrgId
                        ? ""
                        : organization && organization[0].id)
                    : organization[0].id,
                disabled: !myRoles.includes('admin') || type === OrganizationType.Internal
                    || customerOrgId,
                onOpened: async () => {
                    if (type) {
                        const organizationDropdown = await getOrganization({ type });
                        setOrganization(organizationDropdown);
                    }
                },
            }}
        >
            <Label text="Select an Organization" />
            <RequiredRule message={Messages.requiredMessage('Organization')} />
        </SimpleItem>
    ), [organization, myRoles, type]);
    const changePasswordMode = useCallback((name: any) => {
        const editor = formRef.current.instance().getEditor(name);
        const currentMode = editor.option('mode');
        editor.option('mode', currentMode === 'text' ? 'password' : 'text');
        const passwordButton = editor.option('buttons').find((button: any) =>
            button.name === name);
        if (passwordButton) {
            passwordButton.options.icon = currentMode === 'text' ? "eyeopen" : "eyeclose";
        }
        editor.repaint();
    }, []);
    return (
        <CreateForm ref={formRef}>
            {OrganizationSelectBox}
            <SimpleItem
                dataField="email_id"
                editorOptions={{ placeholder: "User Email Address" }}
            >
                <Label text="User Email Address" />
                <RequiredRule message={Messages.requiredMessage('User Email Address')} />
                <EmailRule message={Messages.EMAIL_INVALID} />
            </SimpleItem>
            <SimpleItem
                dataField="first_name"
                editorOptions={{ placeholder: "First Name" }}
            >
                <Label text="First Name" />
                <RequiredRule message={Messages.requiredMessage('First Name')} />
            </SimpleItem>
            <SimpleItem
                dataField="last_name"
                editorOptions={{ placeholder: "Last Name" }}
            >
                <Label text="Last Name" />
                <RequiredRule message={Messages.requiredMessage('Last Name')} />
            </SimpleItem>
            <SimpleItem
                dataField="roles"
                editorType="dxTagBox"
                editorOptions={{
                    items: roles,
                    displayExpr: "name",
                    valueExpr: "id",
                    showSelectionControls: true,
                    applyValueMode: "useButtons",
                    placeholder: "Select Roles",
                    maxDisplayedTags: 2,
                }}
            >
                <Label text="Roles" />
                <RequiredRule message={Messages.ROLE_REQUIRED} />
            </SimpleItem>
            <GroupItem colCount={4} cssClass="reset-password-group">
                <SimpleItem
                    dataField="password_hash"
                    editorType="dxTextBox"
                    cssClass="custom-password"
                    editorOptions={{
                        mode: 'password',
                        placeholder: "Enter Password",
                        valueChangeEvent: 'keyup',
                        onValueChanged: (e: any) => { copyPassword = e.value },
                        buttons: [{
                            name: "password_hash",
                            location: "after",
                            // options: passwordButton,
                            options: {
                                stylingMode: 'text',
                                icon: 'eyeopen',
                                onClick: () => changePasswordMode('password_hash'),
                            },
                        }],
                    }}
                    validationRules={[
                        {
                            type: 'required',
                            message: Messages.requiredMessage('Password')
                        },
                        {
                            type: 'custom',
                            validationCallback: (e) => {
                                return customPasswordCheck(e.value);
                            },
                            message: Messages.PASSWORD_CRITERIA
                        }
                    ]}
                >
                    <Label text={'Password'} />
                </SimpleItem>
                <Item>
                    <div className="mt-[12px]">
                        <Image
                            src="/icons/copy-icon.svg"
                            alt="copy"
                            width={16}
                            height={16}
                            priority
                            onClick={handleCopyPassword}
                        />
                    </div>
                </Item>
                <Item>
                    <div className="mt-[12px]" id="info-box">
                        <Image
                            src="/icons/info-icon.svg"
                            alt="info"
                            width={16}
                            height={16}
                            priority
                            id="info-icon-password_hash"
                        />
                        <Tooltip
                            target="#info-icon-password_hash"
                            showEvent="mouseenter"
                            hideEvent="mouseleave"
                            position="bottom"
                            hideOnOutsideClick={false}
                        >
                            <PasswordCriteria />
                        </Tooltip>
                    </div>
                </Item>
                <ButtonItem cssClass="pt-[20px]">
                    <ButtonOptions
                        text={`Generate`}
                        onClick={handleGeneratePassword}
                        elementAttr={{ class: 'btn-secondary' }} />
                </ButtonItem>
            </GroupItem>

            <SimpleItem>
                <div className="flex justify-start gap-2 mt-5 ">
                    <Button
                        text="Create User"
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
    );
}
