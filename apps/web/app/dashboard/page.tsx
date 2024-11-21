/*eslint max-len: ["error", { "code": 100 }]*/
import Layout from "@/components/layout";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import { getFilteredRoles } from "@/components/Role/service";
import LandingPage from "@/components/Dashboard/LandingPage";

export default async function Dashboard() {

  const sessionData = await getUserData();
  if (!sessionData) {
    redirect('/');
  }

  const { userData, actionsEnabled } = sessionData;
  const { myRoles, orgUser } = userData;
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
        />
      </div>
    </Layout>
  );
}
