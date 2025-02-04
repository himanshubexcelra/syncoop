/*eslint max-len: ["error", { "code": 100 }]*/
import Layout from '@/components/layout';
import { getUserData } from '@/utils/auth';
import { redirect } from 'next/navigation';
import MoleculeOrderPage from '@/components/MoleculeOrder/MoleculeOrder';
import { isOnlyLibraryManger } from '@/utils/helpers';

type OrgMoleculeOrderProps = {
  params: {
    organizationId: string,
  }
}

export default async function MoleculeOrderCustomer({ params }: OrgMoleculeOrderProps) {
  const sessionData = await getUserData();
  const { organizationId } = params;
  // Redirect to home if no session
  if (!sessionData) {
    redirect('/');
  }
  const { userData, actionsEnabled } = sessionData;
  const { myRoles } = userData;
  if (isOnlyLibraryManger(myRoles)) {
    redirect('/');
  }

  return (
    <Layout>
      <MoleculeOrderPage
        userData={userData}
        actionsEnabled={actionsEnabled}
        customerOrgId={Number(organizationId)} />
    </Layout>
  );

}
