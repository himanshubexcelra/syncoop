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
    roleType
}: any) {
    const passwordLabel = { 'aria-label': 'Password' };
    const [passwordMode, setPasswordMode] = useState<TextBoxTypes.TextBoxType>('password');
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
            if (!response.error) {
                const tempData = [...tableData, response];
                formRef.current!.instance().reset();
                setPassword('');
                setTableData(tempData);
                setCreatePopupVisibility(false);
            } else {
                const toastId = toast.error(`${response.error}`);
                await delay(DELAY);
                toast.remove(toastId);
            }
        }
    };

    const handleGeneratePassword = () => {
        const generatedPassword = generatePassword();
        setPassword(generatedPassword);
        formRef.current!.instance().updateData("password", generatedPassword);
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(password)
            .then(() => toast.success("Password copied to clipboard"))
            .catch(() => toast.error("Failed to copy password"));
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
                        <RequiredRule message="Confirm Password is required" />
                        <CustomRule
                            validationCallback={(options: any) => customPasswordCheck(options.value)}
                            message="Password should be at least 8 characters long and contain at least one lowercase letter, one capital letter, one number, and one special character."
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
                items: organizationData,
                displayExpr: "name",
                valueExpr: "id",
                value: roleType === 'admin' ? "" : organizationData[0].id,
            }}
        >
            <Label text="Select an Organisation" />
        </SimpleItem>
    ), [organizationData, roleType]);
    return (
        <CreateForm ref={formRef}>
            {OrganizationSelectBox}
            <SimpleItem
                dataField="email"
                editorOptions={{ placeholder: "User Email Address" }}
            >
                <Label text="User Email Address" />
                <RequiredRule message="User Email Address is required" />
                <EmailRule message="Invalid Email Address" />
            </SimpleItem>
            <SimpleItem
                dataField="firstName"
                editorOptions={{ placeholder: "First Name" }}
            >
                <Label text="First Name" />
                <RequiredRule message="First Name is required" />
            </SimpleItem>
            <SimpleItem
                dataField="lastName"
                editorOptions={{ placeholder: "Last Name" }}
            >
                <Label text="Last Name" />
                <RequiredRule message="Last Name is required" />
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
                <RequiredRule message="At least one role is required" />
            </SimpleItem>
            <SimpleItem
                dataField="password"
                render={passwordEditorRender}
            >
                <RequiredRule message="Password is required" />
            </SimpleItem>
            <SimpleItem>
                <div className="flex justify-start gap-2 mt-5">
                    <Button
                        text="Create User"
                        onClick={handleSubmit}
                        useSubmitBehavior={true}
                        className={styles.primaryButton}
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
