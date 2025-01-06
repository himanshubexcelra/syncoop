/*eslint max-len: ["error", { "code": 100 }]*/
'use client';
import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from 'react';
import { Popup } from "devextreme-react/popup";
import {
    BreadCrumbsObj,
    HeadingObj,
    OrganizationDataFields,
    OrgUser,
    TabDetail,
    UserData,
    UserRole
} from "@/lib/definition";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import UsersTable from "@/components/User/UsersTable";
import ListOrganization from "@/components/Organization/ListOrganization";
import Heading from "@/components/Heading/Heading";
import Tabs from "@/ui/Tab/Tabs";
import TabUsersTable from "@/components/Organization/TabUsersTable";
import { popupPositionValue } from "@/utils/helpers";
import { getOrganizationById } from "@/components/Organization/service";
import EditOrganization from "../Organization/editOrganization";
import { getDashBoardBreadCrumbs } from "./breadCrumbs";
import StatusComponent from "../StatusDetails/StatusComponent";
import AssayTable from "../AssayTable/AssayTable";
import Module from "../Module/Module";
import ADMESelector from "../ADMEDetails/ADMESelector";


type DashboardPageTypeProps = {
    userData: UserData,
    filteredRoles: UserRole[],
    myRoles: string[],
    orgUser: OrgUser,
    actionsEnabled: string[],
    customerOrgId?: number,
}

export default function LandingPage({
    userData,
    filteredRoles,
    myRoles,
    orgUser,
    actionsEnabled,
    customerOrgId,
}: DashboardPageTypeProps) {
    const [organizationData, setOrganization] =
        useState<OrganizationDataFields>({} as OrganizationDataFields);
    const [editPopup, showEditPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const formRef = useRef<any>(null);
    const { id, } = userData;
    const orgDetail = useMemo(() =>
        customerOrgId
            ? { id: customerOrgId, name: organizationData.name || '' }
            : orgUser,
        [customerOrgId, organizationData.name, orgUser]
    );
    const breadcrumbs: BreadCrumbsObj[] = getDashBoardBreadCrumbs(myRoles, orgDetail, customerOrgId)
    const heading: HeadingObj[] = [
        {
            svgPath: myRoles.includes('admin') && !customerOrgId ?
                "/icons/admin-icon-lg.svg" :
                "/icons/organization.svg",
            label: customerOrgId ? `${orgDetail?.name}` || '' : `${orgUser?.name}` || '',
            svgWidth: 28,
            svgHeight: 28,
            href: "",
            type: customerOrgId ? "Customer Organizations:" : "Admin:"
        }
    ];


    const tabsStatus: TabDetail[] = [
        {
            title: "Overview",
            Component: StatusComponent,
            props: { myRoles, orgUser: orgDetail, customerOrgId }
        },
        {
            title: "ADME",
            Component: ADMESelector,
            props: { organizationId: orgDetail.id }
        },
        {
            title: "Assays",
            Component: AssayTable,
            props: { orgUser: orgDetail, },
        },
        {
            title: "Modules",
            Component: Module,
            props: { orgUser: orgDetail, myRoles, },
        }
    ];
    const fetchOrganizationData = async () => {
        const organization = await getOrganizationById(
            {
                withRelation: ['orgUser', 'user_role'],
                id: customerOrgId ? customerOrgId : userData?.organization_id
            });
        setOrganization(organization);
    };

    useEffect(() => {
        if (['admin', 'org_admin'].some((role) => myRoles?.includes(role))) {
            fetchOrganizationData();
        }
    }, []);

    useEffect(() => {
        setPopupPosition(popupPositionValue());
    }, []);

    return (
        <>
            <div className="space-y-2 mb-2">
                <Breadcrumb breadcrumbs={breadcrumbs} />
                <Heading {...{ heading }} myRoles={myRoles} showEditPopup={showEditPopup} />
            </div>
            <main className="main main-heading main-padding">
                <div className="w-full shadow-lg shadow-[var(--tabBoxShadow)]">
                    <Tabs tabsDetails={tabsStatus} />
                </div>
                {myRoles.includes('admin') && !customerOrgId &&
                    <>
                        <TabUsersTable
                            orgUser={orgDetail}
                            filteredRoles={filteredRoles}
                            myRoles={myRoles}
                            user_id={id}
                            actionsEnabled={actionsEnabled}
                        />
                        <div className="w-full">
                            <div className="imageContainer">
                                <Image
                                    src="/icons/organization.svg"
                                    width={33}
                                    height={30}
                                    alt="organization"
                                />
                                <span>Customer Organizations</span>
                            </div>
                            <div className="table w-full">
                                <ListOrganization userData={userData}
                                    actionsEnabled={actionsEnabled} />
                            </div>
                        </div>
                    </>
                }
                {(!myRoles.includes('admin') || customerOrgId) && <div className="w-full">
                    <div className={`imageContainer pt-5 pb-2.5`}>
                        <Image
                            src="/icons/Users-icon-lg.svg"
                            width={40}
                            height={32}
                            alt="organization"
                        />
                        <span>Users</span>
                    </div>
                    <div className="table w-full">
                        <UsersTable
                            orgUser={orgDetail}
                            filteredRoles={filteredRoles}
                            myRoles={myRoles}
                            user_id={id}
                            customerOrgId={customerOrgId}
                            actionsEnabled={actionsEnabled} />
                    </div>
                </div>
                }
                <Popup
                    title={`Edit ${organizationData?.name}`}
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
                            editPopup={editPopup}
                        />
                    )}
                    width={477}
                    height="100%"
                    position={popupPosition}
                    dragEnabled={false}
                    onHiding={() => { formRef.current?.instance().reset(); showEditPopup(false) }}
                    wrapperAttr={{ class: "create-popup" }}
                />
            </main>
        </>
    );
}
