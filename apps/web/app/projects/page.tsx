import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";
import { redirect } from "next/navigation";
import ProjectDetails from "@/components/Projects/ProjectDetails";
import {
    isOnlyProtocolApprover,
    isOnlyResearcher,
    isResearcherAndProtocolAproover
} from "@/utils/helpers";

type ProjectsProps = {
    organizationId: string;
}
export default async function Projects({ organizationId }: ProjectsProps) {

    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }
    const { userData, actionsEnabled, } = sessionData;
    const { myRoles } = userData;
    if (isOnlyResearcher(myRoles) ||
        isOnlyProtocolApprover(myRoles) ||
        isResearcherAndProtocolAproover(myRoles)) {
        redirect('/');
    }

    return (
        <Layout>
            <ProjectDetails
                userData={userData}
                actionsEnabled={actionsEnabled}
                organizationId={Number(organizationId)} />
        </Layout>
    );
}
