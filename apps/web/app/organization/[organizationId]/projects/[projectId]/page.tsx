/* import ProjectDetail from "@/app/projects/[projectId]/page"; */
import Layout from "@/components/layout";
import LibraryDetails from "@/components/Libraries/LibraryDetails";
import { getUserData } from "@/utils/auth";
import { isSystemAdmin } from "@/utils/helpers";
import { redirect } from "next/navigation";

type OrgProjectDetailProps = {
    params: {
        organizationId: string,
        projectId: string
    }
}

export default async function OrgProjectDetail({ params }: OrgProjectDetailProps) {
    const { organizationId, projectId } = params;

    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }

    const { userData, actionsEnabled, } = sessionData;
    const { myRoles } = userData;
    if (!isSystemAdmin(myRoles)) {
        redirect('/');
    }

    return (
        <Layout>
            <LibraryDetails
                userData={userData}
                actionsEnabled={actionsEnabled}
                organizationId={organizationId}
                projectId={projectId} />
        </Layout>
    );
}
