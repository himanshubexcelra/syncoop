/*eslint max-len: ["error", { "code": 100 }]*/
import Layout from '@/components/layout';
import { getUserData } from '@/utils/auth';
import { redirect } from 'next/navigation';
import MoleculeOrderPage from '@/components/MoleculeOrder/MoleculeOrder';
import Breadcrumb from '@/components/Breadcrumbs/BreadCrumbs';
import { BreadCrumbsObj } from '@/lib/definition';

export default async function MoleculeOrder() {
  const sessionData = await getUserData();
  const breadcrumbs: BreadCrumbsObj[] = [
    { label: 'Home', svgPath: '/icons/home-icon.svg', svgWidth: 16, svgHeight: 16, href: '/' },
    {
      label: 'Molecule Orders', svgPath: '/icons/molecule-order.svg',
      svgWidth: 16, svgHeight: 16, href: '/projects', isActive: true
    },
  ];

  // Redirect to home if no session
  if (!sessionData) {
    redirect('/');
  }

  const { userData } = sessionData;

  return (
    <Layout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <MoleculeOrderPage userData={userData} />
    </Layout>
  );

}
