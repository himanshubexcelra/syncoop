import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import Projects from "@/app/projects/page";

type OrgProjectsProps = {
    params: { organizationId: string }
}

export default async function OrgProjects({ params }: OrgProjectsProps) {
    const { organizationId } = params;

    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }

    return (
        <Projects organizationId={organizationId} />
    );
}
