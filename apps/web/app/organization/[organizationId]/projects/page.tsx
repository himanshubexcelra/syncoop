import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import Projects from "@/app/projects/page";
import { isSystemAdmin } from "@/utils/helpers";

type OrgProjectsProps = {
    params: { organizationId: string }
}

export default async function OrgProjects({ params }: OrgProjectsProps) {
    const { organizationId } = params;

    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }
    const { userData } = sessionData;
    const { myRoles } = userData;
    if (!isSystemAdmin(myRoles)) {
        redirect('/');
    }

    return (
        <Projects organizationId={organizationId} />
    );
}
