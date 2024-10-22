"use client";
import { useRef, useState, useEffect } from 'react';
import styles from './ProfileInfo.module.css'
import { HeadingObj, UserData, } from '@/lib/definition';
import { Popup as MainPopup, } from "devextreme-react/popup";
import './form.css'
import { getUsersById } from './service';
import DialogPopUp from '@/ui/DialogPopUp';
import ChangePassword from './ChangePassword';
import ResetPassword from './ResetPassword';
import Heading from '../Heading/Heading';
import RenderEditUser from '../User/editUserDetails';
import { Messages } from '@/utils/message';

interface ProfileInfoProps {
    id: number;
    roleType: string;
    isMyProfile: boolean;
}

const changeDialogProperties = {
    width: 480,
    height: 338,
}
const resetDialogProperties = {
    width: 480,
    height: 260,
}
export default function ProfileInfo({ id, roleType, isMyProfile }: ProfileInfoProps) {
    const [data, setData] = useState<UserData[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [passwordPopupVisible, setPasswordPopupVisible] = useState(false);
    const formRef = useRef<any>(null);
    const { email, firstName, lastName, orgUser, user_role, status } = data[0] || {}
    const userRoleNames = user_role?.map(role => role.role.name).join(', ');

    const formEdit = {
        email, firstName, user_role, lastName, orgUser
    }

    const hidePopup = () => {
        setPasswordPopupVisible(false)
    };

    const contentProps = {
        email,
        onClose: hidePopup
    }

    const fetchData = async () => {
        try {
            const userInfo = await getUsersById(['orgUser', 'user_role'], id);
            setData(userInfo)

        } catch (error) {
            console.error(Messages.USER_FETCH_ERROR, error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);
    const heading: HeadingObj[] = [
        {
            svgPath: "/icons/profile-icon-lg-active.svg",
            label: firstName ? `${firstName}` : '',
            svgWidth: 33,
            svgHeight: 36,
            href: "",
            type: "Profile:"
        },
    ];
    return (
        <> <Heading heading={heading} />
            <main className={styles.main}>
                <div className={styles.box}>
                    <div className="flex justify-between items-center mb-4">
                        <div className={styles.title}>My Profile</div>
                        <div className="space-x-2">
                            <button className={styles.primaryButton} onClick={() => setPasswordPopupVisible(true)}>
                                {isMyProfile ? "Change Password" : "Reset Password"}
                            </button>
                            <button className={styles.secondaryButton} onClick={() => setFormVisible(true)}>
                                Edit
                            </button>
                        </div>
                    </div>
                    <div className={`${styles.grid} gap-y-5`}>
                        <div>
                            <span className={styles.type}>Organization:</span>
                            <span className={styles.output}> {orgUser?.name}</span>
                        </div>
                        <div>
                            <span className={styles.type}>Roles:</span>
                            <span className={styles.output}> {userRoleNames}</span>
                        </div>
                        <div>
                            <span className={styles.type}>First Name:</span>
                            <span className={styles.output}> {firstName}</span>
                        </div>
                        <div>
                            <span className={styles.type}>Email:</span>
                            <span className={styles.output}> {email}</span>
                        </div>
                        <div>
                            <span className={styles.type}>Last Name:</span>
                            <span className={styles.output}> {lastName}</span>
                        </div>
                        {!isMyProfile && <div>
                            <span className={styles.type}>Status:</span>
                            <span className={styles.output}> {status}</span>
                        </div>}
                    </div>
                </div><MainPopup
                    title="Edit Profile"
                    visible={formVisible}
                    contentRender={() => (
                        <RenderEditUser
                            tableData={formEdit}
                            formRef={formRef}
                            setCreatePopupVisibility={setFormVisible}
                            roles={[]}
                            isMyProfile={isMyProfile}
                            fetchData={fetchData}
                            roleType={roleType} />
                    )}
                    width={470}
                    hideOnOutsideClick={true}
                    height="100%"
                    position={{
                        my: { x: 'right', y: 'top' },
                        at: { x: 'right', y: 'top' },
                    }}
                    onHiding={() => {
                        setFormVisible(false);
                        formRef.current!.instance().reset();
                    }}
                    showCloseButton={true}
                    wrapperAttr={{ class: "create-popup mr-[15px]" }} />
                <DialogPopUp {...{
                    visible: passwordPopupVisible,
                    dialogProperties: isMyProfile ? changeDialogProperties : resetDialogProperties,
                    Content: isMyProfile ? ChangePassword : ResetPassword,
                    hidePopup,
                    contentProps
                }} /></main></>
    )
}