import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import { BreadCrumbsObj } from "@/lib/definition";
import Layout from "@/components/layout";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import ProfileInfo from "@/components/Profile/ProfileInfo";


export default async function Profile() {
    const userData = await getUserData();
    if (!userData) {
        redirect('/');
    }

    const { id } = userData;
    const { type: roleType, } = userData?.user_role[0]?.role;
    const breadcrumbs: BreadCrumbsObj[] = [
        { label: 'Home', svgPath: '/icons/home-icon.svg', svgWidth: 16, svgHeight: 16, href: '/dashboard' },
        { label: 'Profile', svgPath: '/icons/profile-icon-sm-active.svg', svgWidth: 16, svgHeight: 16, href: '/profile', isActive: true }
    ]


    return (
        <Layout>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <ProfileInfo id={id} roleType={roleType} isMyProfile={true} />
        </Layout>
    );
}
