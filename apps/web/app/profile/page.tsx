import Layout from "@/components/layout";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import ProfileInfo from "@/components/Profile/ProfileInfo";


export default async function Profile() {
    const sessionData = await getUserData();

    if (!sessionData) {
        redirect('/');
    }

    const { userData, actionsEnabled } = sessionData;
    const { id, myRoles } = userData;


    return (
        <Layout>
            <ProfileInfo id={id} myRoles={myRoles} isMyProfile={true} actionsEnabled={actionsEnabled} />
        </Layout>
    );
}
