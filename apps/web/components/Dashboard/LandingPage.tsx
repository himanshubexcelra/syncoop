'use client';
import Image from "next/image";
import { useState, useEffect, useRef } from 'react';
import { Popup } from "devextreme-react/popup";
import { DashboardPageType, OrganizationDataFields } from "@/lib/definition";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import UsersTable from "@/components/User/UsersTable";
import ListOrganization from "@/components/Organization/ListOrganization";
import Heading from "@/components/Heading/Heading";
import Tabs from "@/ui/Tab/Tabs";
import TabUsersTable from "@/components/Organization/TabUsersTable";
import { popupPositionValue } from "@/utils/helpers";
import styles from "./page.module.css";
import { getOrganizationById } from "@/components/Organization/service";
import EditOrganization from "../Organization/editOrganization";
import Script from 'next/script';

export default function LandingPage({ userData,
    breadcrumbs,
    tabsStatus,
    filteredRoles,
    myRoles,
    orgUser,
    heading,
    actionsEnabled,
}: DashboardPageType) {
    const [organizationData, setOrganization] = useState<OrganizationDataFields>({});
    const [editPopup, showEditPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const formRef = useRef<any>(null);
    const { id } = userData;

    const fetchOrganizationData = async () => {
        const organization = await getOrganizationById({ withRelation: ['orgUser', 'user_role'], id: userData?.organizationId });
        setOrganization(organization);
    };

    useEffect(() => {
        if (!window?.RDKit) {
            window
                .initRDKitModule()
                .then((RDKit: any) => {
                    window.RDKit = RDKit;
                })
                .catch(() => {
                    window.RDKit = undefined;
                });
        }
        if (myRoles.includes('org_admin')) fetchOrganizationData();
    }, []);

    useEffect(() => {
        setPopupPosition(popupPositionValue());
    }, []);

    const renderTitleField = () => {
        return <p className={styles.edit_title}>{`Edit ${organizationData?.name}`}</p>;
    };



    return (
        <>
            <Script src="https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js" strategy="beforeInteractive" />
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <Heading {...{ heading }} myRoles={myRoles} showEditPopup={showEditPopup} />
            <Tabs tabsDetails={tabsStatus} />
            {myRoles.includes('admin') &&
                <>
                    <TabUsersTable orgUser={orgUser} filteredRoles={filteredRoles} myRoles={myRoles} userId={id} actionsEnabled={actionsEnabled} />
                    <div>
                        <div className={styles.imageContainer}>
                            <Image
                                src="/icons/organization.svg"
                                width={33}
                                height={30}
                                alt="organization"
                            />
                            <span>Customer Organizations</span>
                        </div>
                        <div className={styles.table}>
                            <ListOrganization userData={userData} actionsEnabled={actionsEnabled} />
                        </div>
                    </div>
                </>
            }
            {!myRoles.includes('admin') && <div className='p-5'>
                <div className={`${styles.imageContainer} pt-5 pb-2.5`}>
                    <Image
                        src="/icons/Users-icon-lg.svg"
                        width={40}
                        height={32}
                        alt="organization"
                    />
                    <span>Users</span>
                </div>
                <div className={styles.table}>
                    <UsersTable
                        orgUser={orgUser}
                        filteredRoles={filteredRoles}
                        myRoles={myRoles}
                        userId={id}
                        actionsEnabled={actionsEnabled} />
                </div>
            </div>
            }
            <Popup
                titleRender={renderTitleField}
                showTitle={true}
                visible={editPopup}
                showCloseButton={true}
                hideOnOutsideClick={true}
                contentRender={() => (
                    <EditOrganization
                        formRef={formRef}
                        organizationData={organizationData}
                        showEditPopup={showEditPopup}
                        fetchOrganizations={fetchOrganizationData}
                        myRoles={myRoles}
                        loggedInUser={userData.id}
                    />
                )}
                width={477}
                height="100%"
                position={popupPosition}
                onHiding={() => { formRef.current?.instance().reset(); showEditPopup(false) }}
                wrapperAttr={{ class: "create-popup" }}
            />
        </>
    );
}
