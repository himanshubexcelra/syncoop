import { BreadCrumbsObj } from "@/lib/definition";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import ProjectDetails from "@/components/Projects/ProjectDetails";
import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";
import { redirect } from "next/navigation";

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
            label: "Projects",
            svgPath: "",
            svgWidth: 16,
            svgHeight: 16,
            href: "/projects",
        },
    ];

    const userData: any = await getUserData();
    if (!userData) {
        redirect('/');
    }

    return (
        <Layout>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <ProjectDetails data={userData} />
        </Layout>
    );
}
