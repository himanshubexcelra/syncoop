import { BreadCrumbsObj } from "@/lib/definition";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";
import { redirect } from "next/navigation";
import ProjectDetails from "@/components/Projects/ProjectDetails";

type ProjectsProps = {
    organizationId: string;
}
export default async function Projects({ organizationId }: ProjectsProps) {

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

    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }

    const { userData, actionsEnabled } = sessionData;

    return (
        <Layout>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <ProjectDetails userData={userData} actionsEnabled={actionsEnabled} organizationId={organizationId} />
        </Layout>
    );
}
