import { BreadCrumbsObj } from "@/lib/definition";
import LibraryDetails from "@/components/Libraries/LibraryDetails";
import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";
import { redirect } from "next/navigation";

export default async function Projects() {
    const sessionData: any = await getUserData();

    if (!sessionData) {
        redirect('/');
    }

    const breadcrumbs: BreadCrumbsObj[] = [
        {
            label: "Home",
            svgPath: "/icons/home-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
        },
        {
            label: "Project:",
            svgPath: "/icons/project-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/projects",
        },
    ];


    const { userData, actionsEnabled } = sessionData

    return (
        <Layout>
            <LibraryDetails userData={userData} breadcrumbs={breadcrumbs} actionsEnabled={actionsEnabled} />
        </Layout>
    );
}
