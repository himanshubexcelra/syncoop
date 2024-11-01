/*eslint max-len: ["error", { "code": 100 }]*/
import Layout from '@/components/layout';
import { getMoleculesOrder } from './service';
import { getUserData } from '@/utils/auth';
import { redirect } from 'next/navigation';
import MoleculeOrderPage from '@/components/MoleculeOrder/MoleculeOrder';
import { Messages } from '@/utils/message';

type MoleculeOrderProps = {
  searchParams: {
    projectId?: string;
    libraryId?: string;
  };
};

export default async function MoleculeOrder({ searchParams }: MoleculeOrderProps) {
  const sessionData = await getUserData();

  // Redirect to home if no session
  if (!sessionData) {
    redirect('/');
  }

  const { userData } = sessionData;
  const { organizationId, orgUser } = userData;
  const { type } = orgUser;

  let data = [];
  let transformedData: any[] = [];

  try {
    if (type === "external") {
      // External users: fetch records filtered by organizationId, projectId, and libraryId
      data = await getMoleculesOrder({
        organizationId,
        projectId: searchParams.projectId,
        libraryId: searchParams.libraryId,
      });
    } else if (type === "Internal") {
      // Internal users: fetch all records without filters
      data = await getMoleculesOrder({});
    } else {
      console.warn(Messages.USER_ROLE_CHECK);
    }
    // Transform the fetched data if data is available
    transformedData = data?.map((item: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { batch_detail, molecule, organization, orderName, project, library, ...rest } = item;
      return {
        ...rest,
        organizationName: organization.name,
        molecular_weight: molecule.molecular_weight,
        smile: molecule.smile,
        status: molecule.status,
        orderName,
        rowGroupName: type === "Internal"
          ? `${organization.name} / ${orderName}`
          : `${project.name} / ${library.name}`
      };
    });

  } catch (error) {
    console.error(Messages.FETCH_ERROR, error);
    transformedData = []; // Set to an empty array in case of an error
  }

  return (
    <Layout>
      <MoleculeOrderPage initialData={transformedData} />
    </Layout>
  );

}
