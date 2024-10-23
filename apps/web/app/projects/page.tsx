import { BreadCrumbsObj } from "@/lib/definition";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";
import { redirect } from "next/navigation";
import ProjectDetails from "@/components/Projects/ProjectDetails";

export default async function Projects() {

    const breadcrumbs: BreadCrumbsObj[] = [
        {
            label: "Home",
            svgPath: "/icons/home-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
        },
        {
            label: 'Projects',
            svgPath: '/icons/project-icon.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: '/projects',
            isActive: true
        }
    ];

    const sessionData: any = await getUserData();
    if (!sessionData) {
        redirect('/');
    }

    const { userData, actionsEnabled } = sessionData;

    return (
        <Layout>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <ProjectDetails userData={userData} actionsEnabled={actionsEnabled} />
        </Layout>
    );
}
