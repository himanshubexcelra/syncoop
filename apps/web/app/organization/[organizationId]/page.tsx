import Layout from "@/components/layout";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/Dashboard/LandingPage";
import { getFilteredRoles } from "@/components/Role/service";

type OrgProjectsProps = {
    params: { organizationId: string }
}

export default async function Organization({ params }: OrgProjectsProps) {
    const { organizationId } = params;
    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }
    const { userData, actionsEnabled } = sessionData;
    const { orgUser, myRoles } = userData;
    const filteredRoles = await getFilteredRoles();

    return (
        <Layout>
            <div>
                <LandingPage
                    userData={userData}
                    filteredRoles={filteredRoles}
                    myRoles={myRoles}
                    orgUser={orgUser}
                    actionsEnabled={actionsEnabled}
                    customerOrgId={Number(organizationId)}
                />
            </div>
        </Layout >
    );
}