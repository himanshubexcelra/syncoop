import toast from "react-hot-toast";
import {
    Form as CreateForm,
    SimpleItem,
    RequiredRule,
    EmailRule,
    Label,
    CustomRule,
} from "devextreme-react/form";
import { delay, generatePassword } from "@/utils/helpers";
import { createUser } from "./service";
import "./table.css";
import styles from './createUser.module.css'
import { Button, TextBox, Tooltip, Validator } from "devextreme-react";
import { Button as TextBoxButton } from 'devextreme-react/text-box';
import { useMemo, useState } from "react";
import Image from "next/image";
import { TextBoxTypes } from "devextreme-react/cjs/text-box";
import { ButtonTypes } from "devextreme-react/cjs/button";
import PasswordCriteria from "../PasswordCriteria/PasswordCriteria";
import { LoginFormSchema } from "@/lib/definition";
import { DELAY } from "@/utils/constants";
import { getOrganization } from "../Organization/service";
import { Messages } from "@/utils/message";

const customPasswordCheck = (password: any) => LoginFormSchema.shape.password.safeParse(password).success

export default function RenderCreateUser({
    setCreatePopupVisibility,
    setTableData,
    formRef,
    tableData,
    password,
    setPassword,
    roles,
    organizationData,
    myRoles,
    type,
    fetchAndFilterData
}: any) {
    const passwordLabel = { 'aria-label': 'Password' };
    const [passwordMode, setPasswordMode] = useState<TextBoxTypes.TextBoxType>('password');
    const [organization, setOrganization] = useState(organizationData);

    const passwordButton = useMemo<ButtonTypes.Properties>(
        () => ({
            icon: passwordMode === "text" ? "eyeclose" : "eyeopen",
            stylingMode: "text",
            onClick: () => {
                setPasswordMode((prevPasswordMode: TextBoxTypes.TextBoxType) =>
                    prevPasswordMode === "text" ? "password" : "text"
                );
            },
        }),
        [passwordMode]
    );
    const handleSubmit = async () => {
        const values = formRef.current!.instance().option("formData");
        const validationCheck = customPasswordCheck(values.password) && formRef.current!.instance().validate().isValid
        if (validationCheck) {
            const response = await createUser(values);
            if (response.status === 200) {
                const tempData = [...tableData, response.data];
                formRef.current!.instance().reset();
                setPassword('');
                setTableData(tempData);
                setCreatePopupVisibility(false);
                fetchAndFilterData()
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

    const handleGeneratePassword = () => {
        const generatedPassword = generatePassword();
        setPassword(generatedPassword);
        navigator.clipboard.writeText(generatedPassword)
            .then(() => toast.success(Messages.PASSWORD_COPY))
            .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
        formRef.current!.instance().updateData("password", generatedPassword);
    };

    const handleCopyPassword = async () => {
        if (password === "") {
            const toastId = toast.error(Messages.PASSWORD_EMPTY)
            await delay(DELAY);
            toast.remove(toastId);
            return;
        }
        navigator.clipboard.writeText(password)
            .then(() => toast.success(Messages.PASSWORD_COPY))
            .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
    };
    const handleCancel = () => {
        setPassword('');
        formRef.current!.instance().reset();
        setCreatePopupVisibility(false)
    }
    const passwordEditorRender = (data: any) => {
        return (
            <div className="flex items-center gap-2">
                <TextBox
                    value={password}
                    onValueChanged={(e) => {
                        setPassword(e.value);
                        data.component.updateData("password", e.value);
                    }}
                    placeholder="Enter Password"
                    inputAttr={passwordLabel}
                    mode={passwordMode}

                >
                    <TextBoxButton
                        name="password"
                        location="after"
                        options={passwordButton}
                    />
                    <Validator>
                        <RequiredRule message={Messages.requiredMessage('Password')} />
                        <CustomRule
                            validationCallback={(options: any) => customPasswordCheck(options.value)}
                            message={Messages.PASSWORD_CRITERIA}
                        />
                    </Validator>
                </TextBox>
                <Image
                    src="/icons/copy-icon.svg"
                    alt="copy"
                    width={16}
                    height={16}
                    priority
                    onClick={handleCopyPassword}
                />
                <div id="info-container">
                    <Image
                        src="/icons/info-icon.svg"
                        alt="info"
                        width={14}
                        height={15}
                        priority
                        id="info-icon"
                    />
                    <Tooltip
                        target="#info-icon"
                        showEvent="mouseenter"
                        hideEvent="mouseleave"
                        position="bottom"
                        hideOnOutsideClick={false}
                    >
                        <PasswordCriteria />
                    </Tooltip>
                </div>
                <Button
                    text="Generate"
                    onClick={handleGeneratePassword}
                    className={styles.secondaryButton}
                />
            </div>
        );
    };

    const OrganizationSelectBox = useMemo(() => (
        <SimpleItem
            dataField="organization"
            editorType="dxSelectBox"
            editorOptions={{
                items: organization,
                displayExpr: "name",
                valueExpr: "id",
                value: myRoles.includes('admin')
                    ? (type === 'External' ? "" : organization && organization[0].id)
                    : organization[0].id,
                disabled: !myRoles.includes('admin') || type === "Internal",
                onOpened: async () => {
                    if (type) {
                        const organizationDropdown = await getOrganization({ type });
                        setOrganization(organizationDropdown);
                    }
                },
            }}
        >
            <Label text="Select an Organisation" />
            <RequiredRule message={Messages.requiredMessage('Organisation')} />
        </SimpleItem>
    ), [organization, myRoles, type]);
    return (
        <CreateForm ref={formRef}>
            {OrganizationSelectBox}
            <SimpleItem
                dataField="email"
                editorOptions={{ placeholder: "User Email Address" }}
            >
                <Label text="User Email Address" />
                <RequiredRule message={Messages.requiredMessage('User Email Address')} />
                <EmailRule message={Messages.EMAIL_INVALID} />
            </SimpleItem>
            <SimpleItem
                dataField="firstName"
                editorOptions={{ placeholder: "First Name" }}
            >
                <Label text="First Name" />
                <RequiredRule message={Messages.requiredMessage('First Name')} />
            </SimpleItem>
            <SimpleItem
                dataField="lastName"
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
            <SimpleItem
                dataField="password"
                render={passwordEditorRender}
            >
                <RequiredRule message={Messages.requiredMessage('Password')} />
            </SimpleItem>
            <SimpleItem>
                <div className="flex justify-start gap-2 mt-5 ">
                    <Button
                        text="Create User"
                        onClick={handleSubmit}
                        useSubmitBehavior={true}
                        hoverStateEnabled={false}
                        elementAttr={{ class: "btn_primary_user" }}
                    />
                    <Button
                        text="Cancel"
                        onClick={handleCancel}
                        className={styles.secondaryButton}
                    />
                </div>
            </SimpleItem>
        </CreateForm>
    );
}
