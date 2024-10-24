import styles from "./page.module.css";
import { BreadCrumbsObj, HeadingObj } from "@/lib/definition";
import Layout from "@/components/layout";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import { dataSource, features, } from "@/utils/constants";
import AssayTable from "@/components/AssayTable/AssayTable";
import Module from "@/components/Module/Module";
import StatusComponent from "@/components/StatusDetails/StatusComponent";
import { TabDetail } from "@/lib/definition";
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

  const breadcrumbs: BreadCrumbsObj[] = [
    {
      label: "Home",
      svgPath: "/icons/home-icon.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
    },
    {
      label: `Admin: EMD DD`,
      svgPath: "/icons/admin-inactive-icon.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
    },
  ];

  if (!myRoles.includes('admin')) {
    breadcrumbs.push({
      label: `${orgUser?.name}`,
      svgPath: "/icons/organization.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
    })
  }

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
            breadcrumbs={breadcrumbs}
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
