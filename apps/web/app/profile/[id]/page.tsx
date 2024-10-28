import Layout from "@/components/layout";
import ProfileInfo from "@/components/Profile/ProfileInfo";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function Profile({ params }: { params: { id: string } }) {
    const { id } = params
    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }
    const { userData, actionsEnabled } = sessionData;
    const { orgUser, myRoles } = userData;

    return (
        <Layout>
            <ProfileInfo id={Number(id)} myRoles={myRoles} isMyProfile={false} actionsEnabled={actionsEnabled} orgDetailLoggedIn={orgUser} />
        </Layout>
    );
}
