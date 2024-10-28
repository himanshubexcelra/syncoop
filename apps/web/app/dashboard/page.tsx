import styles from "./page.module.css";
import { HeadingObj } from "@/lib/definition";
import Layout from "@/components/layout";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import AssayTable from "@/components/AssayTable/AssayTable";
import Module from "@/components/Module/Module";
import StatusComponent from "@/components/StatusDetails/StatusComponent";
import { TabDetail } from "@/lib/definition";
import { getFilteredRoles } from "@/components/Role/service";
import LandingPage from "@/components/Dashboard/LandingPage";
import { getOrganizationModule, getOrganizationById } from "@/components/Organization/service";

interface Feature {
  name: string;
  requiredPurchase: boolean;
}

export default async function Dashboard() {

  const sessionData = await getUserData();
  if (!sessionData) {
    redirect('/');
  }

  const { userData, actionsEnabled } = sessionData;
  const { myRoles, orgUser } = userData;
  const filteredRoles = await getFilteredRoles();
  const fetchOrgModule = await getOrganizationModule(orgUser.id)
  const fetchDataSource = await getOrganizationById({ id: 1 });
  const dataSource = Object.keys(fetchDataSource.metadata
  ).map(key => ({
    name: key,
    description: fetchDataSource.metadata[key]
  }))
  const features = fetchOrgModule.map((d: Feature) => ({ name: d.name, value: d.name, checked: d.requiredPurchase }))
  const heading: HeadingObj[] = [
    {
      svgPath: myRoles.includes('admin') ? "/icons/admin-icon-lg.svg" : "/icons/organization.svg",
      label: `${orgUser?.name}`,
      svgWidth: 28,
      svgHeight: 28,
      href: "",
      type: myRoles.includes('admin') ? "Admin:" : "Customer Organization:"
    }
  ];


  const tabsStatus: TabDetail[] = [
    {
      title: "Overview",
      Component: StatusComponent,
      props: { myRoles, orgUser }
    },
    {
      title: "Assays",
      Component: AssayTable,
      props: { dataSource },
    },
    {
      title: "Modules",
      Component: Module,
      props: { features, myRoles },
    }
  ];

  return (
    <Layout>
      <div className={styles.page}>
        <main className={styles.main}>
          <LandingPage
            userData={userData}
            tabsStatus={tabsStatus}
            heading={heading}
            filteredRoles={filteredRoles}
            myRoles={myRoles}
            orgUser={orgUser}
            actionsEnabled={actionsEnabled}
          />
        </main>
      </div>
    </Layout>
  );
}
