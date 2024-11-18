import ProjectDetail from "@/app/projects/[id]/page";
import { getUserData } from "@/utils/auth";
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

    return (
        <ProjectDetail organizationId={organizationId} projectId={projectId} />
    );
}
