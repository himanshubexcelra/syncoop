"use client";
import { useRef, useState, useEffect } from 'react';
import styles from './ProfileInfo.module.css'
import { HeadingObj, OrgUser, UserData, } from '@/lib/definition';
import { Popup as MainPopup, } from "devextreme-react/popup";
import { Button } from "devextreme-react/button";
import { getUsersById } from './service';
import DialogPopUp from '@/ui/DialogPopUp';
import ChangePassword from './ChangePassword';
import ResetPassword from './ResetPassword';
import Heading from '../Heading/Heading';
import RenderEditUser from '../User/editUserDetails';
import { Messages } from '@/utils/message';
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import { getProfileBreadCrumbs } from './breadCrumbs';

const changeDialogProperties = {
    width: 480,
    height: 338,
}
const resetDialogProperties = {
    width: 480,
    height: 260,
}

type ProfileInfoProps = {
    id: number;
    myRoles: string[];
    isMyProfile: boolean;
    actionsEnabled: string[]
    orgDetailLoggedIn?: OrgUser
}

export default function ProfileInfo({ id,
    myRoles,
    isMyProfile,
    actionsEnabled,
    orgDetailLoggedIn
}: ProfileInfoProps) {
    const [data, setData] = useState<UserData[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [passwordPopupVisible, setPasswordPopupVisible] = useState(false);
    const formRef = useRef<any>(null);
    const { email_id, first_name, last_name, orgUser, user_role, status } = data[0] || {}
    const userRoleNames = user_role?.map(role => role.role.name).join(', ');

    const formEdit = {
        email_id, first_name, user_role, last_name, orgUser
    }

    const hidePopup = () => {
        setPasswordPopupVisible(false)
    };

    const contentProps = {
        email_id,
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
            label: first_name ? `${first_name}` : '',
            svgWidth: 33,
            svgHeight: 36,
            href: "",
            type: "Profile:"
        },
    ];
    const breadcrumbs = getProfileBreadCrumbs(isMyProfile, myRoles, orgDetailLoggedIn || null)
    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <Heading heading={heading} myRoles={myRoles} />
            <main className={styles.main}>
                <div className={styles.box}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="groupItem">My Profile</div>
                        {(isMyProfile || actionsEnabled.includes('edit_user') || myRoles.includes('admin')) &&
                            <div className="space-x-2">
                                <Button className="btn-primary" onClick={() => setPasswordPopupVisible(true)}>
                                    {isMyProfile ? "Change Password" : "Reset Password"}
                                </Button>
                                <Button className="btn-secondary" onClick={() => setFormVisible(true)}>
                                    Edit
                                </Button>
                            </div>}
                    </div>
                    <div className={`${styles.grid} gap-y-5`}>
                        <div>
                            <span className={`subHeading ${styles.type}`}>Organization:</span>
                            <span className={`subHeading ${styles.output}`}> {orgUser?.name}</span>
                        </div>
                        <div>
                            <span className={`subHeading ${styles.type}`}>Roles:</span>
                            <span className={`subHeading ${styles.output}`}> {userRoleNames}</span>
                        </div>
                        <div>
                            <span className={`subHeading ${styles.type}`}>First Name:</span>
                            <span className={`subHeading ${styles.output}`}> {first_name}</span>
                        </div>
                        <div>
                            <span className={`subHeading ${styles.type}`}>email_id:</span>
                            <span className={`subHeading ${styles.output}`}> {email_id}</span>
                        </div>
                        <div>
                            <span className={`subHeading ${styles.type}`}>Last Name:</span>
                            <span className={`subHeading ${styles.output}`}> {last_name}</span>
                        </div>
                        {!isMyProfile && <div>
                            <span className={`subHeading ${styles.type}`}>Status:</span>
                            <span className={`subHeading ${styles.output}`}> {status}</span>
                        </div>}
                    </div>
                </div>
                <MainPopup
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
                            myRoles={myRoles} />
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