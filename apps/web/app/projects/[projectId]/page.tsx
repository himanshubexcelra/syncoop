import LibraryDetails from "@/components/Libraries/LibraryDetails";
import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";
import { redirect } from "next/navigation";
import {
    isOnlyProtocolApprover,
    isOnlyResearcher,
    isResearcherAndProtocolAproover
} from "@/utils/helpers";

export default async function ProjectDetail() {
    const sessionData = await getUserData();

    if (!sessionData) {
        redirect('/');
    }

    const { userData, actionsEnabled } = sessionData;
    const { myRoles } = userData;
    if (isOnlyResearcher(myRoles) ||
        isOnlyProtocolApprover(myRoles) ||
        isResearcherAndProtocolAproover(myRoles)) {
        redirect('/');
    }

    return (
        <Layout>
            <LibraryDetails
                userData={userData}
                actionsEnabled={actionsEnabled} />
        </Layout>
    );
}
