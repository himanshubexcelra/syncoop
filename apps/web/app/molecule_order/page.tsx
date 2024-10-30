/*eslint max-len: ["error", { "code": 100 }]*/
import Layout from '@/components/layout';
import { getMoleculesOrder } from './service';
import { getUserData } from '@/utils/auth';
import { redirect } from 'next/navigation';
import MoleculeOrderPage from '@/components/MoleculeOrder/MoleculeOrder';

export default async function Page({ searchParams }: 
  { searchParams: { projectId?: string; libraryId?: string } }) {
  const sessionData = await getUserData();

  // Redirect to home if no session
  if (!sessionData) {
    redirect('/');
  }

  const { userData } = sessionData;
  const { myRoles, organizationId } = userData;

  // Identify if the user is internal or external based on roles
  const isInternalUser = myRoles.some((role: string) => 
    role === 'researcher' || role === 'protocol_approver');
  const isExternalUser = myRoles.some((role: string) => 
    role === 'library_manager' || role === 'admin');

  let data = [];
  try {
    if (isInternalUser) {
      // For internal users, pass organizationId as a parameter
      data = await getMoleculesOrder({ organizationId });
    } else if (isExternalUser && searchParams.projectId && searchParams.libraryId) {
      // For external users, pass projectId and libraryId as parameters
      data = await getMoleculesOrder({
        projectId: searchParams.projectId,
        libraryId: searchParams.libraryId,
      });
    } else {
      console.warn("User role not supported or missing required parameters.");
      return <MoleculeOrderPage initialData={[]} />;
    }

    // Transform the fetched data
    const transformedData = data.map((item: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { batch_detail, molecule, organization, ...rest } = item;
      return {
        ...rest,
        organizationName: organization.name,
        molecular_weight: molecule.molecular_weight,
        smile: molecule.smile,
        status: molecule.status,
      };
    });

    return <Layout><MoleculeOrderPage initialData={transformedData} /></Layout>;
  } catch (error) {
    console.error("Error in data fetching:", error);
    return <Layout> <MoleculeOrderPage initialData={[]} /></Layout>;
  }
}
