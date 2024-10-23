import styles from "./page.module.css";
import Image from "next/image";
import { BreadCrumbsObj, HeadingObj } from "@/lib/definition";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import Layout from "@/components/layout";
import UsersTable from "@/components/User/UsersTable";
import { getLowPriorityRole } from "@/components/Role/service";
import ListOrganization from "@/components/Organization/ListOrganization";
import { getUserData } from "@/utils/auth";
import Heading from "@/components/Heading/Heading";
import Tabs from "@/ui/Tab/Tabs";
import { redirect } from "next/navigation";
import { dataSource, features, } from "@/utils/constants";
import AssayTable from "@/components/AssayTable/AssayTable";
import Module from "@/components/Module/Module";
import StatusComponent from "@/components/StatusDetails/StatusComponent";
import TabUsersTable from "@/components/Organization/TabUsersTable";
import { TabDetail } from "@/lib/definition";

export default async function Dashboard() {

  const userData = await getUserData();
  if (!userData) {
    redirect('/');
  }
  const { type: roleType, priority: currentUserPriority } = userData.user_role[0].role;
  const { orgUser, id } = userData;

  const filteredRoles = await getLowPriorityRole(currentUserPriority);

  const breadcrumbs: BreadCrumbsObj[] = [
    {
      label: "Home",
      svgPath: "/icons/home-icon.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
    },
    {
      label: `Admin:  ${orgUser?.name}`,
      svgPath: "/icons/admin-inactive-icon.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
    },
  ];

  const heading: HeadingObj[] = [
    {
      svgPath: "/icons/admin-icon-lg.svg",
      label: `${orgUser?.name}`,
      svgWidth: 28,
      svgHeight: 28,
      href: "",
      type: "Admin:"
    },
    {
      svgPath: "/icons/box-arrow-icon-lg.svg",
      label: "",
      svgWidth: 25,
      svgHeight: 22,
      href: ""
    }
  ];


  const tabsStatus: TabDetail[] = [
    {
      title: "Overview",
      Component: StatusComponent,
      props: { roleType, orgUser }
    },
    {
      title: "Assays",
      Component: AssayTable,
      props: { dataSource },
    },
    {
      title: "Modules",
      Component: Module,
      props: { features, roleType },
    }
  ];

  return (
    <Layout>
      <div className={styles.page}>
        <main className={styles.main}>
          <Breadcrumb breadcrumbs={breadcrumbs} />
          <Heading {...{ heading }} />
          <Tabs tabsDetails={tabsStatus} />
          {roleType === 'admin' &&
            <>
              <TabUsersTable orgUser={orgUser} roles={filteredRoles} roleType={roleType} userId={id} />
              <div>
                <div className={styles.imageContainer}>
                  <Image
                    src="/icons/organization.svg"
                    width={33}
                    height={30}
                    alt="organization"
                  />
                  <span>Customer Organizations</span>
                </div>
                <div className={styles.table}>
                  <ListOrganization userData={userData} />
                </div>
              </div>
            </>
          }
          {roleType === 'org_admin' && <div className='p-5'>
            <div className={`${styles.imageContainer} pt-5 pb-2.5`}>
              <Image
                src="/icons/Users-icon-lg.svg"
                width={40}
                height={32}
                alt="organization"
              />
              <span>Users</span>
            </div>
            <div className={styles.table}>
              <UsersTable orgUser={orgUser} roles={filteredRoles} roleType={roleType} userId={id} />
            </div>
          </div>
          }
        </main>
      </div>
    </Layout>
  );
}
