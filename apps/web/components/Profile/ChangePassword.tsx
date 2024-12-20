/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import toast from "react-hot-toast";
import Image from 'next/image';
import { Button, TextBox, Tooltip, Validator } from 'devextreme-react';
import { Button as TextBoxButton } from 'devextreme-react/text-box';
import { CustomRule, RequiredRule } from 'devextreme-react/cjs/data-grid';
import { LoginFormSchema } from '@/lib/definition';
import { Messages } from '@/utils/message';
import PasswordCriteria from '../PasswordCriteria/PasswordCriteria';
import { useMemo, useRef, useState } from 'react';
import { delay, generatePassword } from "@/utils/helpers";
import { TextBoxTypes } from "devextreme-react/cjs/text-box";
import { ButtonTypes } from "devextreme-react/cjs/button";
import { Form, SimpleItem } from "devextreme-react/form";
import { editUser } from "../User/service";
import { DELAY } from "@/utils/constants";

interface ChangePasswordProps {
    onClose: () => void;
    email_id?: string;
}
const customPasswordCheck = (password: any) =>
    LoginFormSchema.shape.password_hash.safeParse(password).success;

const passwordLabel = { 'aria-label': 'Password' };

export default function ChangePassword({ onClose, email_id }: ChangePasswordProps) {
    const formRef = useRef<any>(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordMode, setNewPasswordMode] = useState<TextBoxTypes.TextBoxType>('password');
    const [oldPasswordMode, setOldPasswordMode] = useState<TextBoxTypes.TextBoxType>('password');
    const [valid, setValid] = useState<any>('valid');

    const passwordButtonNew = useMemo<ButtonTypes.Properties>(
        () => ({
            icon: newPasswordMode === "text" ? "eyeclose" : "eyeopen",
            stylingMode: "text",
            onClick: () => {
                setNewPasswordMode((prevPasswordMode) =>
                    prevPasswordMode === "text" ? "password" : "text"
                );
            },
        }),
        [newPasswordMode]
    );

    const passwordButtonOld = useMemo<ButtonTypes.Properties>(
        () => ({
            icon: oldPasswordMode === "text" ? "eyeclose" : "eyeopen",
            stylingMode: "text",
            onClick: () => {
                setOldPasswordMode((prevPasswordMode) =>
                    prevPasswordMode === "text" ? "password" : "text"
                );
            },
        }),
        [oldPasswordMode]
    );

    const handleSubmit = async () => {
        const values = formRef.current!.instance().option("formData");
        const validationCheck = customPasswordCheck(values.newPassword)
        if (validationCheck) {
            const response = await editUser({ ...values, email_id });
            if (response.status === 200) {
                setNewPassword('');
                setOldPassword('')
                formRef.current!.instance().reset();
                onClose();
                const toastId = toast.success(Messages.PASSWORD_CHANGE)
                await delay(DELAY)
                toast.remove(toastId)
                setValid('valid')
            } else {
                const toastId = toast.error(`${response.error}`);
                await delay(DELAY);
                toast.remove(toastId);
            }
        }
        else {
            setValid('invalid')
            formRef.current!.instance().validate()
        }
    };

    const handleCopyPassword = async () => {
        if (newPassword === "") {
            const toastId = toast.error(Messages.PASSWORD_EMPTY);
            await delay(DELAY);
            toast.remove(toastId);
            return;
        }
        navigator.clipboard.writeText(newPassword)
            .then(() => toast.success(Messages.PASSWORD_COPY))
            .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
    };

    const handleGeneratePassword = () => {
        const generatedPassword = generatePassword();
        setNewPassword(generatedPassword);
        navigator.clipboard.writeText(generatedPassword)
            .then(() => toast.success(Messages.PASSWORD_COPY))
            .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
    };

    const checkValidationStatus = (password: any) =>
        password !== '' && !customPasswordCheck(password) ? 'invalid' : valid

    const oldPasswordRender = (data: any) => {
        return (
            <TextBox
                value={oldPassword}
                onValueChanged={(e) => {
                    setOldPassword(e.value);
                    data.component.updateData("oldPassword", e.value);
                }}
                placeholder="Enter Old Password"
                inputAttr={passwordLabel}
                mode={oldPasswordMode}
                validationStatus={checkValidationStatus(oldPassword)}
            >
                <TextBoxButton
                    name="oldPassword"
                    location="after"
                    options={passwordButtonOld}
                />
                <Validator>
                    <RequiredRule message={Messages.requiredMessage('Password')} />
                </Validator>
            </TextBox>
        );
    };

    const newPasswordRender = (data: any) => {
        return (
            <div className="flex items-center gap-2">
                <TextBox
                    value={newPassword}
                    onValueChanged={(e) => {
                        setNewPassword(e.value);
                        data.component.updateData("newPassword", e.value);
                    }}
                    placeholder="Enter New Password"
                    inputAttr={passwordLabel}
                    mode={newPasswordMode}
                    validationStatus={checkValidationStatus(newPassword)}
                >
                    <TextBoxButton
                        name="newPassword"
                        location="after"
                        options={passwordButtonNew}
                    />
                    <Validator>
                        <RequiredRule message={Messages.requiredMessage('Password')} />
                        <CustomRule
                            validationCallback={(options) => customPasswordCheck(options.value)}
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
                    className="cursor-pointer"
                    onClick={handleCopyPassword}
                />
                <div id="info-container">
                    <Image
                        src="/icons/info-icon.svg"
                        alt="info"
                        width={14}
                        height={15}
                        priority
                        className="cursor-pointer"
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
                    className="btn-secondary"
                />
            </div>
        );
    };
    const handleCancel = () => {
        setNewPassword('');
        setOldPassword('')
        formRef.current!.instance().reset();
        onClose();
        setValid('valid')
    }
    return (
        <>
            <div className="flex justify-between mb-4">
                <div className="subHeading">Change Password</div>
                <Image
                    className='cursor-pointer'
                    src="/icons/cross-icon.svg"
                    alt="close icon"
                    width={21.1}
                    height={22.5}
                    onClick={handleCancel}
                />
            </div>
            <Form ref={formRef}>
                <SimpleItem
                    dataField="oldPassword"
                    render={oldPasswordRender}
                />
                <SimpleItem
                    dataField="newPassword"
                    render={newPasswordRender}
                />
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
            </Form>
        </>
    );
}
