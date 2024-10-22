import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import Layout from "@/components/layout";
import ProfileInfo from "@/components/Profile/ProfileInfo";
import { BreadCrumbsObj } from "@/lib/definition";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function Profile({ params }: { params: { id: string } }) {
    const { id } = params
    const userData = await getUserData();
    if (!userData) {
        redirect('/');
    }

    const { orgUser } = userData;
    const { type: roleType, } = userData?.user_role[0]?.role;
    const breadcrumbs: BreadCrumbsObj[] = [
        { label: 'Home', svgPath: '/icons/home-icon.svg', svgWidth: 16, svgHeight: 16, href: '/dashboard' },
        {
            label: `Admin:  ${orgUser?.name}`,
            svgPath: "/icons/admin-inactive-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/dashboard",
        },
        { label: 'Profile', svgPath: '/icons/profile-icon-sm-active.svg', svgWidth: 16, svgHeight: 16, href: '/profile', isActive: true }
    ]
    return (
        <Layout>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <ProfileInfo id={Number(id)} roleType={roleType} isMyProfile={false} />
        </Layout>
    );
}
