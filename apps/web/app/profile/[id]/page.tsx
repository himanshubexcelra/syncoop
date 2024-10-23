import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import Layout from "@/components/layout";
import ProfileInfo from "@/components/Profile/ProfileInfo";
import { BreadCrumbsObj } from "@/lib/definition";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function Profile({ params }: { params: { id: string } }) {
    const { id } = params
    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }
    const { userData, actionsEnabled } = sessionData;
    const { orgUser, myRoles } = userData;
    const breadcrumbs: BreadCrumbsObj[] = [
        {
            label: 'Home',
            svgPath: '/icons/home-icon.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: '/dashboard'
        },
        {
            label: `${['admin', 'org_admin'].some((role) => myRoles.includes(role)) ? 'Admin:' : ''} ${orgUser?.name}`,
            svgPath: "/icons/admin-inactive-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/dashboard",
        },
        {
            label: 'Profile',
            svgPath: '/icons/profile-icon-sm-active.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: '/profile',
            isActive: true
        }
    ]
    return (
        <Layout>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <ProfileInfo id={Number(id)} myRoles={myRoles} isMyProfile={false} actionsEnabled={actionsEnabled} />
        </Layout>
    );
}
