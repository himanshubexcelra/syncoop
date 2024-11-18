import LibraryDetails from "@/components/Libraries/LibraryDetails";
import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";
import { redirect } from "next/navigation";

type ProjectDetailProps = {
    organizationId?: string;
    projectId: string
}

export default async function ProjectDetail({
    organizationId,
    projectId
}: ProjectDetailProps) {
    const sessionData = await getUserData();

    if (!sessionData) {
        redirect('/');
    }

    const { userData, actionsEnabled } = sessionData

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
