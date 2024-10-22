import { BreadCrumbsObj } from "@/lib/definition";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import LibraryDetails from "@/components/Libraries/LibraryDetails";
import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";

export default async function Projects() {

    const breadcrumbs: BreadCrumbsObj[] = [
        {
            label: "Home",
            svgPath: "/icons/home-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
            isActive: true,
        },
        {
            label: "Admin",
            svgPath: "/icons/admin-inactive-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
        },
        {
            label: "Library",
            svgPath: "",
            svgWidth: 16,
            svgHeight: 16,
            href: "/library",
        },
    ];

    const userData: any = await getUserData();

    return (
        <Layout>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <LibraryDetails userData={userData} />
        </Layout>
    );
}
