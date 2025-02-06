import Layout from "@/components/layout";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/Dashboard/LandingPage";
import { getFilteredRoles } from "@/components/Role/service";

export default async function Organization({ params }: { params: { id: string } }) {
    const { id } = params
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
                <main className="main main-heading">
                    <LandingPage
                        userData={userData}
                        filteredRoles={filteredRoles}
                        myRoles={myRoles}
                        orgUser={orgUser}
                        actionsEnabled={actionsEnabled}
                        customerOrgId={Number(id)}
                        isCustomerOrg={true}
                    />
                </main>
            </div>
        </Layout >
    );
}
