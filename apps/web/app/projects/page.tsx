import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";
import { redirect } from "next/navigation";
import ProjectDetails from "@/components/Projects/ProjectDetails";

type ProjectsProps = {
    organizationId: string;
}
export default async function Projects({ organizationId }: ProjectsProps) {

    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }

    const { userData, actionsEnabled, } = sessionData;

    return (
        <Layout>
            <ProjectDetails
                userData={userData}
                actionsEnabled={actionsEnabled}
                organizationId={organizationId} />
        </Layout>
    );
}
