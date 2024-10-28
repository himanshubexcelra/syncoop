import LibraryDetails from "@/components/Libraries/LibraryDetails";
import { getUserData } from "@/utils/auth";
import Layout from "@/components/layout";
import { redirect } from "next/navigation";

export default async function Projects() {
    const sessionData: any = await getUserData();

    if (!sessionData) {
        redirect('/');
    }

    const { userData, actionsEnabled } = sessionData

    return (
        <Layout>
            <LibraryDetails userData={userData} actionsEnabled={actionsEnabled} />
        </Layout>
    );
}
