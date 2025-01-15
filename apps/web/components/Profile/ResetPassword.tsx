/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import toast from "react-hot-toast";
import Image from 'next/image';
import { Button, Tooltip } from 'devextreme-react';
import { LoginFormSchema } from '@/lib/definition';
import { Messages } from '@/utils/message';
import PasswordCriteria from "../Tooltips/PasswordCriteria";
import { useCallback, useRef, useState } from 'react';
import { delay, generatePassword } from "@/utils/helpers";
import {
    ButtonItem,
    ButtonOptions,
    Form, GroupItem, Item, Label, SimpleItem
} from "devextreme-react/form";
import { editUser } from "../User/service";
import { DELAY } from "@/utils/constants";

interface ChangePasswordProps {
    onClose: () => void;
    email_id?: string;
}
const customPasswordCheck = (password: any) =>
    LoginFormSchema.shape.password_hash.safeParse(password).success;


export default function ResetPassword({ onClose, email_id,
}: ChangePasswordProps) {
    const formRef = useRef<any>(null);
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = async () => {
        const values = formRef.current!.instance().option("formData");
        const validationCheck = customPasswordCheck(values.newPassword)
        if (validationCheck) {
            const response = await editUser({ ...values, email_id });
            if (response.status === 200) {
                setNewPassword('');
                formRef.current!.instance().reset();
                onClose();
                const toastId = toast.success(Messages.PASSWORD_CHANGE)
                await delay(DELAY)
                toast.remove(toastId)
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
    let copyPassword = newPassword
    const handleCopyPassword = async () => {
        if (copyPassword === "") {
            const toastId = toast.error(Messages.PASSWORD_EMPTY);
            await delay(DELAY);
            toast.remove(toastId);
            return;
        }
        navigator.clipboard.writeText(copyPassword)
            .then(() => toast.success(Messages.PASSWORD_COPY))
            .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
    };

    const handleGeneratePassword = () => {
        const generatedPassword = generatePassword();
        setNewPassword(generatedPassword);
        navigator.clipboard.writeText(generatedPassword)
            .then(() => toast.success(Messages.PASSWORD_COPY))
            .catch(() => toast.error(Messages.PASSWORD_COPY_FAIL));
        formRef.current!.instance().updateData("newPassword", generatedPassword);
    };


    const handleCancel = () => {
        setNewPassword('');
        formRef.current!.instance().reset();
        onClose();
    }
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
        <>
            <div className="flex justify-between mb-4">
                <div className="subHeading">Generate Password</div>
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
                {/* <SimpleItem
                    dataField="newPassword"
                    render={newPasswordRender}
                /> */}
                <GroupItem colCount={4} cssClass="reset-password-group">
                    <SimpleItem
                        dataField="newPassword"
                        editorType="dxTextBox"
                        cssClass="custom-password"
                        editorOptions={{
                            mode: 'password',
                            placeholder: "Enter Password",
                            valueChangeEvent: 'keyup',
                            onValueChanged: (e: any) => copyPassword = e.value,
                            buttons: [{
                                name: "newPassword",
                                location: "after",
                                // options: passwordButton,
                                options: {
                                    stylingMode: 'text',
                                    icon: 'eyeopen',
                                    onClick: () => changePasswordMode('newPassword'),
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
